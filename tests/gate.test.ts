import { describe, expect, it } from 'vitest';
import { agreement, slices, type Piece } from '@/lib/agreement';
import { leakage, type CostInputs } from '@/lib/economics';
import { DEFAULT_THRESHOLDS as T, evaluateGate } from '@/lib/gate';
import { CATEGORIES } from '@/lib/categories';
import { syntheticPieces } from '@/lib/synthetic';
import { confusionMatrix } from '@/lib/agreement';
import { sampleSizeForProportion } from '@/lib/stats';

const C: CostInputs = { price: { A: 10, B: 7, C: 4 }, piecesPerBundle: 10, disputeProbOneStep: 0.2, disputeProbTwoSteps: 0.5, refundShare: 0.5, handlingCostPerDispute: 2 };
const STRONG = [
  [300, 10, 0],
  [8, 290, 8],
  [0, 10, 300],
];
const run = (m: number[][], need = 196, ps: Piece[] = []) => evaluateGate(agreement(m, 0.95), leakage(m, C), slices(ps, 0.95), T, need);

describe('readiness gate', () => {
  it('READY: 890/926 exact (low bound above 85%), 18/926 over-graded, leakage 1.2% of bundle value, ≥196 per grade', () => {
    const g = run(STRONG);
    expect(g.verdict).toBe('READY');
    expect(g.checks.every((c) => c.ready === 'pass')).toBe(true);
  });
  it('the same results with too few pieces per grade cannot be READY: PILOT-ONLY with the shortfall listed', () => {
    const g = run(STRONG, 400);
    expect(g.verdict).toBe('PILOT-ONLY');
    expect(g.sampleShort.map((s) => s.grade)).toEqual(['A', 'B', 'C']);
  });
  it('NOT READY: the hand-counted 100-piece case passes exact (75% = floor), within-one and over-grade pilot lines but leaks £6.59 of £82 = 8.0% > 6%', () => {
    const m = [[40, 8, 2], [5, 30, 5], [1, 4, 5]];
    const g = run(m);
    expect(g.verdict).toBe('NOT READY');
    const byId = Object.fromEntries(g.checks.map((c) => [c.id, c]));
    expect(byId.exact.pilot).toBe('pass');
    expect(byId.within1.pilot).toBe('pass');
    expect(byId.over.pilot).toBe('pass');
    expect(byId.leak.pilot).toBe('fail');
  });
  it('a weak failure-mode slice with ≥30 pieces blocks READY even when the aggregate passes', () => {
    const mk = (i: number, ok: boolean): Piece => ({ pieceId: `P${i}`, graderGrade: 'B', modelGrade: ok ? 'B' : 'A', photoQuality: 'poor', stockCondition: 'clean', garmentTypeSeen: 'yes', brandLabel: 'ok' });
    const poor = [...Array.from({ length: 20 }, (_, i) => mk(i, true)), ...Array.from({ length: 12 }, (_, i) => mk(100 + i, false))];
    const g = run(STRONG, 196, poor);
    expect(g.verdict).toBe('PILOT-ONLY');
    expect(g.weakSlices[0]).toContain('Poor photo');
  });
  it('a slice under 30 pieces is shown but not judged', () => {
    const mk = (i: number): Piece => ({ pieceId: `Q${i}`, graderGrade: 'B', modelGrade: 'A', photoQuality: 'poor', stockCondition: 'clean', garmentTypeSeen: 'yes', brandLabel: 'ok' });
    expect(run(STRONG, 196, Array.from({ length: 29 }, (_, i) => mk(i))).verdict).toBe('READY');
  });
  it('no data is NOT READY with a reason, never a pass', () => {
    const g = run([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    expect(g.verdict).toBe('NOT READY');
    expect(g.reasons[0]).toMatch(/No graded pieces/);
  });
});

describe('synthetic demo sets (regression: fixed seeds)', () => {
  const need = sampleSizeForProportion(0.85, 0.05, 0.95);
  const verdictFor = (id: string) => {
    const bet = CATEGORIES.find((c) => c.id === id)!;
    const ps = syntheticPieces(bet);
    const m = confusionMatrix(ps);
    return evaluateGate(agreement(m, 0.95), leakage(m, bet.costs), slices(ps, 0.95), T, need).verdict;
  };
  it('sportswear READY, denim PILOT-ONLY, kidswear NOT READY', () => {
    expect(verdictFor('vintage-sportswear')).toBe('READY');
    expect(verdictFor('y2k-denim')).toBe('PILOT-ONLY');
    expect(verdictFor('kidswear')).toBe('NOT READY');
  });
  it('is deterministic and every piece id is marked synthetic', () => {
    const bet = CATEGORIES[0];
    const a = syntheticPieces(bet);
    expect(syntheticPieces(bet)).toEqual(a);
    expect(a.every((p) => p.pieceId.startsWith('SYN-'))).toBe(true);
    expect(new Set(a.map((p) => p.pieceId)).size).toBe(a.length);
  });
});
