'use client';
import { useMemo, useRef, useState } from 'react';
import { CATEGORIES, getCategory, type Basis, type CategoryBet } from '@/lib/categories';
import { syntheticPieces } from '@/lib/synthetic';
import { agreement, confusionMatrix, slices, type Piece } from '@/lib/agreement';
import { leakage, missCosts, type CostInputs } from '@/lib/economics';
import { DEFAULT_THRESHOLDS, evaluateGate, type Thresholds } from '@/lib/gate';
import { CSV_TEMPLATE, parseResultsCsv, piecesToCsv, type ParseResult } from '@/lib/csv';
import { marginForSample, sampleSizeForProportion, sampleSizeToObserve, Z, type Confidence } from '@/lib/stats';
import { GRADES, GRADE_DEFINITIONS, gradeSteps } from '@/lib/grades';
import { gbp, num } from '@/lib/format';
import { asset } from '@/lib/asset';
import { SOURCES } from '@/lib/sources';

const pc = (x: number, dp = 1) => (Number.isFinite(x) ? `${(x * 100).toFixed(dp)}%` : '—');

const INSPECT: Record<string, string> = {
  photoQuality: 'Re-shoot a sample under the hub lightbox; check whether misses cluster by station or time of day.',
  stockCondition: 'Grade a sample before and after washing; stains and dirt should be graded as condition, not hidden.',
  garmentTypeSeen: 'List the garment types behind the misses and add labelled examples before the next read.',
  brandLabel: 'Cross-check brand against care labels and logos; a wrong brand can drag the grade with it.',
};

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function BasisChip({ basis, href }: { basis: Basis; href?: string }) {
  const label = basis === 'sourced' ? 'Sourced ↗' : basis === 'estimated' ? 'Estimated' : 'Placeholder';
  return href && basis !== 'placeholder' ? (
    <a className={`basis basis-${basis}`} href={href} target="_blank" rel="noreferrer">{label}</a>
  ) : (
    <span className={`basis basis-${basis}`}>{label}</span>
  );
}

export default function Workbench() {
  const [betId, setBetId] = useState(CATEGORIES[0].id);
  const bet = getCategory(betId);
  return <Desk key={bet.id} bet={bet} onPick={setBetId} />;
}

function Desk({ bet, onPick }: { bet: CategoryBet; onPick: (id: string) => void }) {
  const [mode, setMode] = useState<'synthetic' | 'upload'>('synthetic');
  const [upload, setUpload] = useState<{ name: string; result: ParseResult } | null>(null);
  const [p, setP] = useState(0.85);
  const [margin, setMargin] = useState(0.05);
  const [conf, setConf] = useState<Confidence>(0.95);
  const [rareRate, setRareRate] = useState(0.02);
  const [costs, setCosts] = useState<CostInputs>(bet.costs);
  const [t, setT] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [locked, setLocked] = useState(true);
  const [postHoc, setPostHoc] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const synthetic = useMemo(() => syntheticPieces(bet), [bet]);
  const pieces: Piece[] = mode === 'synthetic' ? synthetic : upload?.result.pieces ?? [];
  const required = useMemo(() => sampleSizeForProportion(p, margin, conf), [p, margin, conf]);
  const rareN = useMemo(() => sampleSizeToObserve(rareRate, 0.95), [rareRate]);
  const m = useMemo(() => confusionMatrix(pieces), [pieces]);
  const a = useMemo(() => agreement(m, conf), [m, conf]);
  const l = useMemo(() => leakage(m, costs), [m, costs]);
  const misses = useMemo(() => missCosts(m, costs), [m, costs]);
  const sl = useMemo(() => slices(pieces, conf), [pieces, conf]);
  const gate = useMemo(() => evaluateGate(a, l, sl, t, required), [a, l, sl, t, required]);
  const has = a.n > 0;
  const isSyn = mode === 'synthetic';

  const readFile = (f: File) => f.text().then((txt) => { setUpload({ name: f.name, result: parseResultsCsv(txt, bet.id) }); setMode('upload'); });
  const setTh = (k: keyof Thresholds, v: number) => { if (has) setPostHoc(true); setT((x) => ({ ...x, [k]: v })); };
  const setCost = (patch: Partial<CostInputs>) => setCosts((c) => ({ ...c, ...patch }));

  const dataLabel = isSyn ? <span className="syn-badge">Synthetic demo</span> : <span className="syn-badge" style={{ background: 'var(--blue)', color: '#fff' }}>Your upload</span>;

  return (
    <>
      <div className="strip">
        <strong>Independent concept</strong> by Ayomide Ahmed · not an official Fleek product · demo numbers are synthetic, not FleekSort output
      </div>
      <header className="header">
        <div className="wrap header-inner">
          <a className="brand" href="#top" aria-label="FleekSort Category Readiness Eval, top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/brand/fleek-logo.webp')} alt="Fleek logo" width={113} height={30} />
            <span className="brand-divider" />
            <span>
              <span className="brand-name">Category Readiness Eval</span>
              <br />
              <span className="brand-sub">Grading-agreement gate · Category Bet Desk</span>
            </span>
          </a>
          <nav className="nav" aria-label="Sections">
            <a href="#builder">Eval set</a>
            <a href="#scorecard">Scorecard</a>
            <a href="#leakage">£ per bundle</a>
            <a href="#gate">Gate</a>
            <a href="#upload">Upload</a>
          </nav>
          <a className="btn btn-yellow" href="#upload">
            <span className="lbl-long">Upload results</span>
            <span className="lbl-short">Upload</span>
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap">
            <span className="eyebrow">FleekSort · category readiness</span>
            <h1>
              A new category only scales <span className="accent">if grading holds there.</span>
            </h1>
            <p className="lede">
              Pick a candidate category, size a labelled evaluation set, compare model grades against grader labels, turn the misses into pounds per bundle, and apply READY / PILOT-ONLY / NOT READY lines that were fixed before the pilot.
            </p>
            <div className="picker" role="group" aria-label="Candidate categories">
              {CATEGORIES.map((c) => {
                const ps = c.id === bet.id ? pieces : syntheticPieces(c);
                const cm = confusionMatrix(ps);
                const ca = agreement(cm, conf);
                const cl = leakage(cm, c.id === bet.id ? costs : c.costs);
                const cg = c.id === bet.id ? gate : evaluateGate(ca, cl, slices(ps, conf), t, required);
                return (
                  <button key={c.id} className="bet-card" aria-pressed={c.id === bet.id} onClick={() => onPick(c.id)} data-testid={`pick-${c.id}`}>
                    <div className="bet-tile" style={{ background: c.tile }}>
                      <span className="status">{c.id === bet.id && !isSyn ? 'YOUR UPLOAD' : 'SYNTHETIC'}</span>
                    </div>
                    <div className="bet-body">
                      <div className="bet-name">{c.name}</div>
                      <div className="price-row">
                        <span className="price">{ca.n ? pc(ca.exactRate.point) : '—'}</span>
                        <span className="ppc">exact agreement</span>
                        <span className="chip chip-ship">{num(ca.n)} pieces</span>
                      </div>
                      <div className="small muted">{ca.n ? `${gbp(cl.totalLeakPerBundle)} grading leakage / bundle of ${c.costs.piecesPerBundle}` : 'No results loaded'}</div>
                      <div><span className={`chip chip-${cg.verdict === 'READY' ? 'scale' : cg.verdict === 'PILOT-ONLY' ? 'hold' : 'kill'}`}>{cg.verdict}</span></div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="grade-defs" aria-label="Fleek grade definitions">
              {GRADES.map((g) => (
                <span key={g} className="grade-def"><span className={`grade-pill g-${g}`}>{g}</span>{GRADE_DEFINITIONS[g]}</span>
              ))}
              <a className="basis basis-sourced" href={SOURCES.home.url} target="_blank" rel="noreferrer">Fleek&apos;s public definitions ↗</a>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: 0, borderBottom: 0 }}>
          <div className="wrap">
            <div className={`syn-banner ${isSyn ? '' : 'upl-banner'}`} role="status">
              {dataLabel}
              {isSyn ? (
                <span>Showing a <strong>synthetic</strong> {num(synthetic.length)}-piece set for {bet.name}, generated from a fixed seed. It is not Fleek data and not output from FleekSort; nothing here calls any model.</span>
              ) : (
                <span>Showing {num(a.n)} pieces from <strong>{upload?.name}</strong>. The file stays in this browser.</span>
              )}
              <span className="source-toggle" role="group" aria-label="Data source" style={{ marginLeft: 'auto' }}>
                <button aria-pressed={isSyn} onClick={() => setMode('synthetic')}>Synthetic demo</button>
                <button aria-pressed={!isSyn} onClick={() => (upload ? setMode('upload') : document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' }))}>Your results</button>
              </span>
            </div>
          </div>
        </section>

        {/* 1. builder */}
        <section className="section" id="builder">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2><span className="step">1</span>Evaluation set builder</h2>
                <p className="muted">How many grader-labelled pieces each grade needs before an agreement read is defensible. Each grade is read on its own, so the requirement applies per grade, not to the total.</p>
              </div>
            </div>
            <div className="grid-econ">
              <div className="card">
                <div className="fields">
                  <label className="field">Expected agreement
                    <select value={p} onChange={(e) => setP(+e.target.value)} data-testid="p-select">
                      {[0.7, 0.75, 0.8, 0.82, 0.85, 0.9, 0.95].map((x) => <option key={x} value={x}>{pc(x, 0)}</option>)}
                    </select>
                  </label>
                  <label className="field">Margin of error
                    <select value={margin} onChange={(e) => setMargin(+e.target.value)} data-testid="margin-select">
                      {[0.02, 0.03, 0.04, 0.05, 0.07, 0.1].map((x) => <option key={x} value={x}>± {(x * 100).toFixed(0)} pts</option>)}
                    </select>
                  </label>
                  <label className="field">Confidence
                    <select value={conf} onChange={(e) => setConf(+e.target.value as Confidence)}>
                      {([0.9, 0.95, 0.99] as Confidence[]).map((x) => <option key={x} value={x}>{pc(x, 0)}</option>)}
                    </select>
                  </label>
                </div>
                <div className="math" data-testid="n-math">
                  n = z² · p(1 − p) / E²<br />
                  = {Z[conf]}² × {p} × {(1 - p).toFixed(2)} / {margin}²<br />
                  = {((Z[conf] ** 2 * p * (1 - p)) / margin ** 2).toFixed(2)} → <strong>{required} pieces per grade</strong>, {required * 3} in total
                </div>
                <p className="small muted" style={{ margin: '10px 0 0' }}>
                  The public FleekSort figure is <a href={SOURCES.careers.url} target="_blank" rel="noreferrer">“82% accuracy”</a> overall; a new category may sit well below that, so start from a conservative expectation.
                </p>
                <div className="math" style={{ marginTop: 12 }}>
                  To see a rare miss at least once (95% chance):<br />
                  n = ln(0.05) / ln(1 − r), r =&nbsp;
                  <select className="select" value={rareRate} onChange={(e) => setRareRate(+e.target.value)} style={{ minHeight: 28, padding: '2px 4px' }}>
                    {[0.01, 0.02, 0.05, 0.1].map((x) => <option key={x} value={x}>{pc(x, 0)}</option>)}
                  </select>
                  <br />→ <strong>{rareN} pieces</strong> per failure-mode slice
                </div>
              </div>
              <div className="card">
                <h3 style={{ marginBottom: 6 }}>This set against the requirement {dataLabel}</h3>
                {GRADES.map((g) => {
                  const have = a.perGrade[g].n;
                  const short = have < required;
                  const scale = Math.max(required * 1.5, have);
                  const got = has ? marginForSample(Math.min(0.99, Math.max(0.01, a.perGrade[g].rate.point || p)), have, conf) : Infinity;
                  return (
                    <div className="need-row" key={g}>
                      <span><span className={`grade-pill g-${g}`}>{g}</span><span className="tiny muted">grade</span></span>
                      <span className="need-bar" aria-hidden><i className={short ? 'short' : ''} style={{ width: `${(have / scale) * 100}%` }} /><b style={{ left: `${(required / scale) * 100}%` }} /></span>
                      <span className="r num" style={{ fontWeight: 800 }}>{num(have)}</span>
                      <span className={`chip ${short ? 'chip-kill' : 'chip-scale'}`}>{short ? `−${required - have}` : 'OK'}</span>
                      <span className="tiny muted" style={{ gridColumn: '2 / -1', marginTop: -6 }}>
                        {have ? `gives ± ${(got * 100).toFixed(1)} pts at ${pc(conf, 0)}` : 'no pieces'} · need {required}
                      </span>
                    </div>
                  );
                })}
                <p className="small" style={{ marginTop: 12 }}>
                  {gate.sampleShort.length
                    ? <><strong>Short:</strong> {gate.sampleShort.map((s) => `${s.grade} needs ${s.need - s.have} more`).join(', ')}. The gate cannot return READY until every grade is covered.</>
                    : <>Every grade meets the per-grade requirement.</>}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. scorecard */}
        <section className="section" id="scorecard" style={{ background: 'var(--cream)' }}>
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2><span className="step">2</span>Grading-agreement scorecard</h2>
                <p className="muted">Model grade against the grader&apos;s label for the same piece. Intervals are Wilson {pc(conf, 0)} bounds. Red cells are over-grades (buyer disputes and refunds); amber cells are under-grades (money left on the table).</p>
              </div>
              {dataLabel}
            </div>
            {!has ? <div className="card muted">No graded pieces loaded.</div> : (
              <>
                <div className="big-kpis">
                  <div className="kpi" style={{ background: 'var(--white)' }} data-testid="kpi-exact">
                    <div className="kpi-label">Exact agreement</div>
                    <div className="kpi-value">{pc(a.exactRate.point)}</div>
                    <div className="ci">{num(a.exact)} / {num(a.n)} · {pc(a.exactRate.low)}–{pc(a.exactRate.high)}</div>
                  </div>
                  <div className="kpi" style={{ background: 'var(--white)' }} data-testid="kpi-within">
                    <div className="kpi-label">Within one grade</div>
                    <div className="kpi-value">{pc(a.withinOneRate.point)}</div>
                    <div className="ci">{num(a.withinOne)} / {num(a.n)} · {pc(a.withinOneRate.low)}–{pc(a.withinOneRate.high)}</div>
                  </div>
                  <div className="kpi" style={{ background: 'var(--white)' }}>
                    <div className="kpi-label">Over-graded</div>
                    <div className="kpi-value neg">{pc(a.overGradeRate.point)}</div>
                    <div className="ci">{num(a.overGraded)} / {num(a.n)} · up to {pc(a.overGradeRate.high)}</div>
                  </div>
                  <div className="kpi" style={{ background: 'var(--white)' }}>
                    <div className="kpi-label">Under-graded</div>
                    <div className="kpi-value">{pc(a.underGradeRate.point)}</div>
                    <div className="ci">{num(a.underGraded)} / {num(a.n)} · up to {pc(a.underGradeRate.high)}</div>
                  </div>
                </div>
                <div className="grid-2" style={{ alignItems: 'start' }}>
                  <div className="card" data-testid="confusion">
                    <h3 style={{ marginBottom: 8 }}>Confusion matrix</h3>
                    <div className="table-wrap">
                      <table className="cm">
                        <thead>
                          <tr><th /><th colSpan={3} className="axis-note">Model grade →</th><th /></tr>
                          <tr><th className="axis-note">Grader ↓</th>{GRADES.map((g) => <th key={g}>{g}</th>)}<th>Row</th></tr>
                        </thead>
                        <tbody>
                          {GRADES.map((g, i) => (
                            <tr key={g}>
                              <th>{g}</th>
                              {GRADES.map((h, j) => {
                                const s = gradeSteps(g, h);
                                return <td key={h} className={s === 0 ? 'diag' : s > 0 ? 'over' : 'under'}>{num(m[i][j])}<small>{pc(a.perGrade[g].n ? m[i][j] / a.perGrade[g].n : NaN, 0)}</small></td>;
                              })}
                              <th className="num">{num(a.perGrade[g].n)}</th>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="tiny muted" style={{ margin: '6px 0 0' }}>Percentages are shares of each grader-grade row.</p>
                  </div>
                  <div className="card">
                    <h3 style={{ marginBottom: 8 }}>Expected cost of each miss</h3>
                    <div className="table-wrap">
                      <table data-testid="miss-table">
                        <thead><tr><th>Grader → model</th><th>Type</th><th className="r">Pieces</th><th className="r">£ per miss</th><th className="r">£ / piece EV</th></tr></thead>
                        <tbody>
                          {[...misses].sort((x, y) => y.evPerPiece - x.evPerPiece).map((x) => (
                            <tr key={x.grader + x.model}>
                              <td><strong>{x.grader} → {x.model}</strong></td>
                              <td><span className={`kind kind-${x.kind}`}>{x.kind === 'over' ? 'Over' : 'Under'}{x.steps === 2 ? ' ×2' : ''}</span></td>
                              <td className="r">{num(x.count)}</td>
                              <td className="r">{gbp(x.costPerMiss)}</td>
                              <td className="r"><strong>{gbp(x.evPerPiece, 3)}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="tiny muted" style={{ margin: '6px 0 0' }}>Over: P(dispute) × (refund share × price at model grade + handling). Under: price at true grade − price at model grade.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 3. leakage */}
        <section className="section" id="leakage">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2><span className="step">3</span>Dispute leakage and price realisation</h2>
                <p className="muted">The same misses, priced for one bundle of {costs.piecesPerBundle} pieces. Inputs are labelled: none of them is Fleek internal data.</p>
              </div>
            </div>
            <div className="grid-econ">
              <div className="card">
                <div className="a-group">Price per piece by grade</div>
                {GRADES.map((g) => (
                  <div className="a-row" key={g}>
                    <div><div className="a-label">Grade {g}</div></div>
                    <div className="a-input"><input type="number" step="0.1" min="0" value={costs.price[g]} onChange={(e) => setCost({ price: { ...costs.price, [g]: Math.max(0, +e.target.value) } })} aria-label={`Grade ${g} price`} /><span>£/pc</span></div>
                    <div className="a-basis"><BasisChip basis={bet.costBasis.price.basis} href={bet.costBasis.price.source?.url} /></div>
                  </div>
                ))}
                <p className="a-note">{bet.costBasis.price.note}</p>
                <div className="a-group">Bundle and disputes</div>
                {([
                  ['piecesPerBundle', 'Pieces per bundle', 'pcs', 1, bet.costBasis.piecesPerBundle],
                  ['disputeProbOneStep', 'Dispute chance, over by one grade', '%', 100, bet.costBasis.dispute],
                  ['disputeProbTwoSteps', 'Dispute chance, over by two grades', '%', 100, bet.costBasis.dispute],
                  ['refundShare', 'Refund share of piece price', '%', 100, bet.costBasis.refundShare],
                  ['handlingCostPerDispute', 'Handling cost per dispute', '£', 1, bet.costBasis.handling],
                ] as const).map(([k, label, unit, mult, basis]) => (
                  <div className="a-row" key={k}>
                    <div><div className="a-label">{label}</div></div>
                    <div className="a-input"><input type="number" step={unit === '£' ? 0.1 : 1} min="0" value={+(costs[k] * mult).toFixed(2)} onChange={(e) => setCost({ [k]: Math.max(0, +e.target.value) / mult } as Partial<CostInputs>)} aria-label={label} /><span>{unit}</span></div>
                    <div className="a-basis"><BasisChip basis={basis.basis} href={basis.source?.url} /></div>
                  </div>
                ))}
                <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => setCosts(bet.costs)}>Reset inputs</button>
              </div>
              <div>
                {!has ? <div className="card muted">No graded pieces loaded.</div> : (
                  <>
                    <div className="kpis" data-testid="leak-kpis">
                      <div className="kpi"><div className="kpi-label">Leakage / bundle</div><div className="kpi-value neg">{gbp(l.totalLeakPerBundle)}</div><div className="kpi-sub">{pc(l.totalLeakPerBundle / l.idealValuePerBundle)} of value</div></div>
                      <div className="kpi"><div className="kpi-label">Price realisation</div><div className="kpi-value">{pc(l.priceRealisation)}</div><div className="kpi-sub">{gbp(l.realisedValuePerBundle)} of {gbp(l.idealValuePerBundle)}</div></div>
                      <div className="kpi"><div className="kpi-label">Disputes / bundle</div><div className="kpi-value">{l.disputesPerBundle.toFixed(2)}</div><div className="kpi-sub">1 in {l.disputesPerBundle ? Math.round(1 / l.disputesPerBundle) : '∞'} bundles</div></div>
                      <div className="kpi"><div className="kpi-label">Undisputed overpay</div><div className="kpi-value">{gbp(l.undisputedOverpayPerBundle)}</div><div className="kpi-sub">buyer trust cost</div></div>
                    </div>
                    <div className="card">
                      <table>
                        <tbody>
                          <tr><td>Bundle value if every piece carried the grader&apos;s grade</td><td className="r">{gbp(l.idealValuePerBundle)}</td></tr>
                          <tr className="sub"><td>− Refunds and handling on disputed over-grades</td><td className="r neg">−{gbp(l.disputeLeakPerBundle)}</td></tr>
                          <tr className="sub"><td>− Under-graded pieces sold at the lower grade&apos;s price</td><td className="r neg">−{gbp(l.underGradeLeakPerBundle)}</td></tr>
                          <tr className="total"><td>Realised value per bundle</td><td className="r">{gbp(l.realisedValuePerBundle)}</td></tr>
                        </tbody>
                      </table>
                      <p className="small muted" style={{ marginBottom: 0 }}>
                        Over-graded pieces nobody disputes still sell above their true grade. That premium ({gbp(l.undisputedOverpayPerBundle)} a bundle here) is not counted as a gain: it is a buyer who overpaid and may not come back.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. gate */}
        <section className="section" id="gate" style={{ background: 'var(--cream)' }}>
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2><span className="step">4</span>Readiness gate</h2>
                <p className="muted">READY needs every line to hold on the confidence bound, with enough pieces per grade. PILOT-ONLY needs the point estimates to clear the pilot lines. Anything else is NOT READY.</p>
              </div>
              {dataLabel}
            </div>
            <div className={`verdict verdict-${gate.verdict.replace(' ', '-')}`} data-testid="verdict">
              <div className="verdict-word">{gate.verdict}</div>
              <ul>{gate.reasons.slice(0, 5).map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
            {postHoc && <div className="posthoc" role="alert">Thresholds were edited after results were on screen. This read is no longer pre-registered; record why before using the verdict.</div>}
            <div className="grid-econ grid-gate">
              <div className="card">
                <div className="table-wrap">
                  <table data-testid="gate-table">
                    <thead><tr><th>Check</th><th>Observed</th><th>READY line</th><th>PILOT line</th></tr></thead>
                    <tbody>
                      {gate.checks.map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.label}</strong></td>
                          <td className="num">{c.observed}</td>
                          <td><span className={`chip chip-${c.ready}`}>{c.ready === 'pass' ? 'Pass' : 'Fail'}</span> <span className="tiny muted">{c.readyRule}</span></td>
                          <td><span className={`chip chip-${c.pilot === 'n/a' ? 'na' : c.pilot}`}>{c.pilot === 'n/a' ? '—' : c.pilot === 'pass' ? 'Pass' : 'Fail'}</span> <span className="tiny muted">{c.pilotRule}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="lock">
                  {locked
                    ? <span className="lock-on">Thresholds locked before the pilot</span>
                    : <span className="lock-off">Unlocked: edits after results are flagged</span>}
                  <button className="btn btn-sm" onClick={() => setLocked((x) => !x)}>{locked ? 'Unlock' : 'Lock'}</button>
                </div>
                <div className="th-grid">
                  {([
                    ['readyExactLow', 'READY exact, lower bound ≥'],
                    ['readyWithinOneLow', 'READY within-one, lower bound ≥'],
                    ['readyOverGradeHigh', 'READY over-grade, upper bound ≤'],
                    ['readyLeakShare', 'READY leakage share ≤'],
                    ['pilotExact', 'PILOT exact ≥'],
                    ['pilotWithinOne', 'PILOT within-one ≥'],
                    ['pilotOverGrade', 'PILOT over-grade ≤'],
                    ['pilotLeakShare', 'PILOT leakage share ≤'],
                    ['sliceExactFloor', 'Slice exact floor ≥'],
                  ] as const).map(([k, label]) => (
                    <label className="field" key={k} style={{ fontSize: 12 }}>{label}
                      <input type="number" step="0.5" disabled={locked} value={+(t[k] * 100).toFixed(1)} onChange={(e) => setTh(k, +e.target.value / 100)} />
                    </label>
                  ))}
                </div>
                <p className="tiny muted" style={{ marginBottom: 0 }}>Values in %. <BasisChip basis="placeholder" /> Defaults are a proposal for agreement with the founders, set relative to the public 82% figure, not Fleek policy.</p>
              </div>
            </div>

            <div className="card" style={{ marginTop: 18 }} data-testid="failure-modes">
              <h3 style={{ marginBottom: 4 }}>Failure modes to inspect</h3>
              <p className="small muted" style={{ marginTop: 0 }}>The aggregate can hide a weak slice. Slices with at least {t.minSliceN} pieces are judged against the {pc(t.sliceExactFloor, 0)} floor; smaller ones are shown but not judged.</p>
              <div className="fm fm-head"><span>Failure mode</span><span>Risk slice exact</span><span className="fm-rest">Rest exact</span><span>Over-grade in slice</span><span className="fm-flag-h">Read</span></div>
              {sl.map((s) => {
                const judged = s.risky.n >= t.minSliceN;
                const weak = judged && s.risky.exact.point < t.sliceExactFloor;
                return (
                  <div className="fm" key={s.key}>
                    <span><strong>{s.label}</strong><div className="inspect">{INSPECT[s.key]}</div></span>
                    <span className="num"><strong>{pc(s.risky.exact.point)}</strong> <span className="ci">n={s.risky.n}</span></span>
                    <span className="num fm-rest">{pc(s.rest.exact.point)} <span className="ci">n={s.rest.n}</span></span>
                    <span className="num">{pc(s.risky.overGrade.point)}</span>
                    <span className="fm-flag"><span className={`chip ${!judged ? 'chip-na' : weak ? 'chip-fail' : 'chip-pass'}`}>{!judged ? `Too few (<${t.minSliceN})` : weak ? 'Inspect' : 'Holds'}</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. upload */}
        <section className="section" id="upload">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2><span className="step">5</span>Upload your own results</h2>
                <p className="muted">One row per piece: the grader&apos;s grade, the model&apos;s grade and four failure-mode tags. Rows with bad values are listed and left out; a repeated piece_id is left out entirely.</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-sm" onClick={() => download('readiness-results-template.csv', CSV_TEMPLATE)} data-testid="dl-template">Download template</button>
                <button className="btn btn-sm" onClick={() => download(`synthetic-${bet.id}.csv`, piecesToCsv(synthetic, bet.id))}>Download synthetic set</button>
              </div>
            </div>
            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div
                className={`drop ${drag ? 'over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) readFile(f); }}
              >
                <p style={{ marginTop: 0, fontWeight: 700 }}>Drop a CSV here or</p>
                <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>Choose CSV file</button>
                <input ref={fileRef} type="file" accept=".csv,text/csv" hidden data-testid="file-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ''; }} />
                <p className="tiny muted" style={{ marginBottom: 0 }}>Parsed in your browser; nothing is uploaded to a server. Rows for other categories are skipped.</p>
              </div>
              <div className="card" data-testid="upload-report">
                {!upload ? (
                  <p className="muted" style={{ margin: 0 }}>No file yet. Columns: <code>piece_id, category, grader_grade, model_grade, photo_quality, stock_condition, garment_type_seen, brand_label</code>.</p>
                ) : (
                  <>
                    <h3 style={{ marginBottom: 6 }}>{upload.name}</h3>
                    <p className="small" style={{ margin: 0 }}>
                      {upload.result.totalRows} rows · <strong>{upload.result.pieces.length} loaded</strong> · {upload.result.errors.length} rejected · {upload.result.skippedOtherCategory} other category
                      {upload.result.duplicateIds.length > 0 && <> · duplicate ids: {upload.result.duplicateIds.slice(0, 5).join(', ')}</>}
                    </p>
                    {upload.result.errors.length > 0 && (
                      <ul className="err-list">{upload.result.errors.slice(0, 50).map((e, i) => <li key={i}>Line {e.line}{e.pieceId ? ` (${e.pieceId})` : ''}: {e.message}</li>)}</ul>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      <button className="btn btn-sm btn-yellow" onClick={() => { setMode('upload'); document.getElementById('scorecard')?.scrollIntoView({ behavior: 'smooth' }); }}>Score this upload</button>
                      <button className="btn btn-sm" onClick={() => { setUpload(null); setMode('synthetic'); }}>Clear upload</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-grid">
          <div>
            <div className="footer-main">independent concept by Ayomide Ahmed</div>
            <p>
              Not an official Fleek product and not affiliated with or endorsed by Fleek. The Fleek name and logo belong to Fleek and are used only to show how the concept would sit in its product. FleekSort is Fleek&apos;s model; this page does not call it. Every demo result is synthetic; prices are labelled estimates from public listings, and dispute inputs are placeholders.
            </p>
          </div>
          <div>
            <strong style={{ color: 'var(--white)' }}>Public sources</strong>
            <ul>
              {[SOURCES.jobPost, SOURCES.home, SOURCES.careers, SOURCES.fortune, SOURCES.tnw, SOURCES.betDesk].map((x) => (
                <li key={x.url}><a href={x.url} target="_blank" rel="noreferrer">{x.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}

