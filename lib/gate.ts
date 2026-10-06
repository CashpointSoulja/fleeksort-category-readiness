import type { Agreement, Slice } from './agreement';
import type { Leakage } from './economics';
import { GRADES } from './grades';

export type Verdict = 'READY' | 'PILOT-ONLY' | 'NOT READY';

export interface Thresholds {
  /** READY: lower confidence bound of exact agreement must be at least this. */
  readyExactLow: number;
  readyWithinOneLow: number;
  /** READY: upper confidence bound of the over-grade rate must be at most this. */
  readyOverGradeHigh: number;
  /** READY: grading leakage as a share of ideal bundle value. */
  readyLeakShare: number;
  /** PILOT-ONLY: point estimates. */
  pilotExact: number;
  pilotWithinOne: number;
  pilotOverGrade: number;
  pilotLeakShare: number;
  /** A failure-mode slice with at least this many pieces is judged on its own. */
  minSliceN: number;
  /** Any judged slice below this exact-agreement point estimate blocks READY. */
  sliceExactFloor: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  readyExactLow: 0.85,
  readyWithinOneLow: 0.97,
  readyOverGradeHigh: 0.06,
  readyLeakShare: 0.03,
  pilotExact: 0.75,
  pilotWithinOne: 0.93,
  pilotOverGrade: 0.1,
  pilotLeakShare: 0.06,
  minSliceN: 30,
  sliceExactFloor: 0.75,
};

export interface Check {
  id: string;
  label: string;
  observed: string;
  ready: 'pass' | 'fail';
  pilot: 'pass' | 'fail' | 'n/a';
  readyRule: string;
  pilotRule: string;
}

export interface GateResult {
  verdict: Verdict;
  checks: Check[];
  reasons: string[];
  sampleShort: { grade: string; have: number; need: number }[];
  weakSlices: string[];
}

const pc = (x: number) => `${(x * 100).toFixed(1)}%`;

export function evaluateGate(a: Agreement, l: Leakage, s: Slice[], t: Thresholds, requiredPerGrade: number): GateResult {
  if (a.n === 0) {
    return { verdict: 'NOT READY', checks: [], reasons: ['No graded pieces loaded. Load the synthetic demo or upload results.'], sampleShort: [], weakSlices: [] };
  }
  const leakShare = l.idealValuePerBundle ? l.totalLeakPerBundle / l.idealValuePerBundle : 1;
  const sampleShort = GRADES.filter((g) => a.perGrade[g].n < requiredPerGrade).map((g) => ({ grade: g, have: a.perGrade[g].n, need: requiredPerGrade }));
  const judged = s.filter((x) => x.risky.n >= t.minSliceN);
  const weakSlices = judged.filter((x) => x.risky.exact.point < t.sliceExactFloor).map((x) => `${x.riskyLabel}: ${pc(x.risky.exact.point)} exact on ${x.risky.n} pieces`);

  const ok = (b: boolean) => (b ? 'pass' : 'fail') as 'pass' | 'fail';
  const checks: Check[] = [
    {
      id: 'sample',
      label: 'Labelled pieces per grade',
      observed: GRADES.map((g) => `${g} ${a.perGrade[g].n}`).join(' · '),
      ready: ok(sampleShort.length === 0),
      pilot: 'n/a',
      readyRule: `≥ ${requiredPerGrade} per grade`,
      pilotRule: 'Shortfall allowed, flagged',
    },
    {
      id: 'exact',
      label: 'Exact agreement',
      observed: `${pc(a.exactRate.point)} (low ${pc(a.exactRate.low)})`,
      ready: ok(a.exactRate.low >= t.readyExactLow),
      pilot: ok(a.exactRate.point >= t.pilotExact),
      readyRule: `lower bound ≥ ${pc(t.readyExactLow)}`,
      pilotRule: `≥ ${pc(t.pilotExact)}`,
    },
    {
      id: 'within1',
      label: 'Within one grade',
      observed: `${pc(a.withinOneRate.point)} (low ${pc(a.withinOneRate.low)})`,
      ready: ok(a.withinOneRate.low >= t.readyWithinOneLow),
      pilot: ok(a.withinOneRate.point >= t.pilotWithinOne),
      readyRule: `lower bound ≥ ${pc(t.readyWithinOneLow)}`,
      pilotRule: `≥ ${pc(t.pilotWithinOne)}`,
    },
    {
      id: 'over',
      label: 'Over-grade rate',
      observed: `${pc(a.overGradeRate.point)} (high ${pc(a.overGradeRate.high)})`,
      ready: ok(a.overGradeRate.high <= t.readyOverGradeHigh),
      pilot: ok(a.overGradeRate.point <= t.pilotOverGrade),
      readyRule: `upper bound ≤ ${pc(t.readyOverGradeHigh)}`,
      pilotRule: `≤ ${pc(t.pilotOverGrade)}`,
    },
    {
      id: 'leak',
      label: 'Grading leakage, share of bundle value',
      observed: pc(leakShare),
      ready: ok(leakShare <= t.readyLeakShare),
      pilot: ok(leakShare <= t.pilotLeakShare),
      readyRule: `≤ ${pc(t.readyLeakShare)}`,
      pilotRule: `≤ ${pc(t.pilotLeakShare)}`,
    },
    {
      id: 'slices',
      label: 'Failure-mode slices',
      observed: judged.length ? `${judged.length - weakSlices.length}/${judged.length} slices ≥ floor` : 'No slice large enough to judge',
      ready: ok(weakSlices.length === 0),
      pilot: 'n/a',
      readyRule: `every slice with ≥ ${t.minSliceN} pieces ≥ ${pc(t.sliceExactFloor)} exact`,
      pilotRule: 'Weak slices allowed, inspected',
    },
  ];

  const allReady = checks.every((c) => c.ready === 'pass');
  const allPilot = checks.every((c) => c.pilot !== 'fail');
  const verdict: Verdict = allReady ? 'READY' : allPilot ? 'PILOT-ONLY' : 'NOT READY';
  const reasons: string[] = [];
  if (verdict === 'READY') reasons.push('Every READY line holds on the confidence bound, with enough pieces in every grade.');
  else {
    for (const c of checks) if (c.ready === 'fail' && (verdict === 'PILOT-ONLY' || c.pilot !== 'fail')) reasons.push(`READY blocked: ${c.label.toLowerCase()} ${c.observed}, needs ${c.readyRule}.`);
    for (const c of checks) if (c.pilot === 'fail') reasons.push(`PILOT-ONLY blocked: ${c.label.toLowerCase()} ${c.observed}, needs ${c.pilotRule}.`);
  }
  return { verdict, checks, reasons, sampleShort, weakSlices };
}
