# Test plan and results

## What is tested

| Area | How | Pass criteria |
|---|---|---|
| Sample size | [`tests/stats.test.ts`](../tests/stats.test.ts): four hand-worked cases, invalid inputs, rare-event sizing | Matches the hand figure; bad inputs throw |
| Wilson intervals | Hand-worked intervals, 0 of n, n of n, n = 0 | Matches the hand figure; bounds stay in [0, 1] |
| Agreement | [`tests/scorecard.test.ts`](../tests/scorecard.test.ts): the hand-counted 100-piece matrix below | Exact, within-one, over, under and per-grade counts match |
| Miss costs and leakage | Same file, hand-worked prices and dispute inputs | Every £ figure matches the hand working |
| Failure-mode slices | A case where the aggregate is 90% but the poor-photo slice is 50% | Slice and rest rates match |
| Gate | [`tests/gate.test.ts`](../tests/gate.test.ts): READY, thin sample, leakage fail, weak slice, small slice, no data | Verdict and reasons match |
| Synthetic regression | Fixed seeds: sportswear READY, denim PILOT-ONLY, kidswear NOT READY; IDs start `SYN-` | Stable across runs |
| CSV | [`tests/csv.test.ts`](../tests/csv.test.ts): template, missing columns, bad rows, case, duplicates, other categories, BOM / quotes / CRLF, round trip | Rows accepted or rejected as stated |
| Type safety and build | `npm run typecheck`, `npm run build:pages` | No errors; static export |
| Visual | Production build served under `/fleeksort-category-readiness/`, captured at 1366 px and 390 px ([screens](screens/)) | Logo visible top-left; no horizontal scroll at 390 px; no console errors |

## Hand-counted reference matrix (100 pieces)

| Grader ↓ / Model → | A | B | C | Row |
|---|---|---|---|---|
| A | 40 | 8 | 2 | 50 |
| B | 5 | 30 | 5 | 40 |
| C | 1 | 4 | 5 | 10 |

- Exact = 40 + 30 + 5 = **75 / 100**. Within one = 100 − (2 + 1) = **97 / 100**.
- Over-graded = 5 + 1 + 4 = **10**. Under-graded = 8 + 2 + 5 = **15**.

Prices A £10 / B £7 / C £4; 10 pieces per bundle; dispute 20% one step, 50% two steps; refund 50%; handling £2.

| Line | Working | Result |
|---|---|---|
| B→A cost | 0.2 × (0.5 × 10 + 2) | £1.40 |
| C→A cost | 0.5 × (0.5 × 10 + 2) | £3.50 |
| C→B cost | 0.2 × (0.5 × 7 + 2) | £1.10 |
| A→B, A→C, B→C | 10 − 7, 10 − 4, 7 − 4 | £3, £6, £3 |
| Disputes / bundle | (0.05 × 0.2 + 0.01 × 0.5 + 0.04 × 0.2) × 10 | 0.23 |
| Dispute leakage | (0.05 × 1.40 + 0.01 × 3.50 + 0.04 × 1.10) × 10 | £1.49 |
| Under-grade leakage | (0.08 × 3 + 0.02 × 6 + 0.05 × 3) × 10 | £5.10 |
| Ideal value | (0.5 × 10 + 0.4 × 7 + 0.1 × 4) × 10 | £82.00 |
| Realised value | 82 − 1.49 − 5.10 | £75.41 (91.96%) |
| Undisputed overpay | (0.05 × 0.8 × 3 + 0.01 × 0.5 × 6 + 0.04 × 0.8 × 3) × 10 | £2.46 |
| Gate | Leakage 6.59 / 82 = 8.0% > 6% pilot line | NOT READY |

## Results

Recorded on 6 October 2026 on Node 22, from my own runs. Output copied from the terminal.

### `npx vitest run --reporter=verbose`

```
✓ tests/stats.test.ts > sample size for a defensible agreement read > 85% expected agreement, ±5 pts, 95%: 1.96² × 0.85 × 0.15 / 0.05² = 195.92 → 196 per grade
✓ tests/stats.test.ts > sample size for a defensible agreement read > worst case p = 0.5, ±5 pts, 95%: 3.8416 × 0.25 / 0.0025 = 384.16 → 385
✓ tests/stats.test.ts > sample size for a defensible agreement read > 90% expected, ±3 pts, 90% confidence: 1.645² × 0.09 / 0.0009 = 270.60 → 271
✓ tests/stats.test.ts > sample size for a defensible agreement read > 99% confidence, 80% expected, ±5 pts: 2.576² × 0.16 / 0.0025 = 424.68 → 425
✓ tests/stats.test.ts > sample size for a defensible agreement read > refuses impossible inputs
✓ tests/stats.test.ts > pieces needed to see a rare miss at least once > 5% miss rate, 95% chance: ln(0.05) / ln(0.95) = 58.40 → 59
✓ tests/stats.test.ts > pieces needed to see a rare miss at least once > 1% miss rate, 95% chance: ln(0.05) / ln(0.99) = 298.07 → 299
✓ tests/stats.test.ts > margin you get from a given sample > 196 pieces at 85%: 1.96 × √(0.1275 / 196) = 0.04999
✓ tests/stats.test.ts > Wilson score interval > 8 of 10 at 95%: centre 0.99208 / 1.38416 = 0.71674, half-width 0.31362 / 1.38416 = 0.22658
✓ tests/stats.test.ts > Wilson score interval > 0 of 10 stays inside [0, 1]: low 0, high 2 × 0.19208 / 1.38416 = 0.27754
✓ tests/stats.test.ts > Wilson score interval > no pieces gives no point estimate and the widest interval
✓ tests/scorecard.test.ts > confusion matrix and agreement rates (hand-counted 100-piece case) > exact agreement = diagonal 40 + 30 + 5 = 75 of 100
✓ tests/scorecard.test.ts > confusion matrix and agreement rates (hand-counted 100-piece case) > within one grade excludes only A↔C misses (2 + 1): 97 of 100
✓ tests/scorecard.test.ts > confusion matrix and agreement rates (hand-counted 100-piece case) > over-grades (model better than grader) = B→A 5 + C→A 1 + C→B 4 = 10
✓ tests/scorecard.test.ts > confusion matrix and agreement rates (hand-counted 100-piece case) > under-grades = A→B 8 + A→C 2 + B→C 5 = 15
✓ tests/scorecard.test.ts > confusion matrix and agreement rates (hand-counted 100-piece case) > per-grade rows: A 40/50, B 30/40, C 5/10
✓ tests/scorecard.test.ts > confusion matrix and agreement rates (hand-counted 100-piece case) > builds the same matrix from pieces
✓ tests/scorecard.test.ts > expected-value cost of each miss type > B graded A (over by one): 0.2 × (0.5 × £10 + £2) = £1.40
✓ tests/scorecard.test.ts > expected-value cost of each miss type > C graded A (over by two): 0.5 × (0.5 × £10 + £2) = £3.50
✓ tests/scorecard.test.ts > expected-value cost of each miss type > C graded B (over by one): 0.2 × (0.5 × £7 + £2) = £1.10
✓ tests/scorecard.test.ts > expected-value cost of each miss type > A graded B (under): £10 − £7 = £3 left on the table; A graded C: £6
✓ tests/scorecard.test.ts > expected-value cost of each miss type > a correct grade costs nothing
✓ tests/scorecard.test.ts > expected-value cost of each miss type > EV per evaluated piece = share × cost: B→A 0.05 × £1.40 = £0.07
✓ tests/scorecard.test.ts > dispute leakage and price realisation per bundle (10 pieces) > disputes: (0.05 × 0.2 + 0.01 × 0.5 + 0.04 × 0.2) × 10 = 0.23 per bundle
✓ tests/scorecard.test.ts > dispute leakage and price realisation per bundle (10 pieces) > dispute leakage: (0.07 + 0.035 + 0.044) × 10 = £1.49
✓ tests/scorecard.test.ts > dispute leakage and price realisation per bundle (10 pieces) > under-grade leakage: (0.08 × 3 + 0.02 × 6 + 0.05 × 3) × 10 = £5.10
✓ tests/scorecard.test.ts > dispute leakage and price realisation per bundle (10 pieces) > total £6.59; ideal (0.5 × 10 + 0.4 × 7 + 0.1 × 4) × 10 = £82; realised £75.41; realisation 91.96%
✓ tests/scorecard.test.ts > dispute leakage and price realisation per bundle (10 pieces) > undisputed overpayment: (0.05 × 0.8 × 3 + 0.01 × 0.5 × 6 + 0.04 × 0.8 × 3) × 10 = £2.46
✓ tests/scorecard.test.ts > dispute leakage and price realisation per bundle (10 pieces) > a perfect model leaks nothing and realises 100%
✓ tests/scorecard.test.ts > dispute leakage and price realisation per bundle (10 pieces) > an empty matrix returns zeros, not a fake realisation
✓ tests/scorecard.test.ts > failure-mode slices expose what the aggregate hides > aggregate 90% exact, poor-photo slice 50%, good-photo slice 100%
✓ tests/gate.test.ts > readiness gate > READY: 890/926 exact (low bound above 85%), 18/926 over-graded, leakage 1.2% of bundle value, ≥196 per grade
✓ tests/gate.test.ts > readiness gate > the same results with too few pieces per grade cannot be READY: PILOT-ONLY with the shortfall listed
✓ tests/gate.test.ts > readiness gate > NOT READY: the hand-counted 100-piece case passes exact (75% = floor), within-one and over-grade pilot lines but leaks £6.59 of £82 = 8.0% > 6%
✓ tests/gate.test.ts > readiness gate > a weak failure-mode slice with ≥30 pieces blocks READY even when the aggregate passes
✓ tests/gate.test.ts > readiness gate > a slice under 30 pieces is shown but not judged
✓ tests/gate.test.ts > readiness gate > no data is NOT READY with a reason, never a pass
✓ tests/gate.test.ts > synthetic demo sets (regression: fixed seeds) > sportswear READY, denim PILOT-ONLY, kidswear NOT READY
✓ tests/gate.test.ts > synthetic demo sets (regression: fixed seeds) > is deterministic and every piece id is marked synthetic
✓ tests/csv.test.ts > results CSV > the downloadable template parses cleanly into 3 pieces
✓ tests/csv.test.ts > results CSV > names missing columns and loads nothing
✓ tests/csv.test.ts > results CSV > lists bad rows by line and keeps good ones; grades are case-insensitive
✓ tests/csv.test.ts > results CSV > excludes every copy of a duplicated piece_id
✓ tests/csv.test.ts > results CSV > skips rows for another category and counts them
✓ tests/csv.test.ts > results CSV > handles quoted fields, a BOM and Windows line endings
✓ tests/csv.test.ts > results CSV > round-trips the synthetic demo set through CSV
Test Files  4 passed (4)
Tests  46 passed (46)
```

### `npm run typecheck` and `npm run build:pages`

```
> tsc --noEmit
(no output: 0 errors)

 ✓ Generating static pages (5/5)
Route (app)                              Size     First Load JS
┌ ○ /                                    13.3 kB         101 kB
└ ○ /_not-found                          873 B          88.3 kB
○  (Static)  prerendered as static content
```

### Browser check (production build, served under `/fleeksort-category-readiness/`)

```
desktop scrollWidth [ 1366, 1366 ] errors []
mobile scrollWidth [ 390, 390 ] errors []
```

At 390 px a first pass found the gate's threshold grid at 437 px wide (an inline grid style overrode the mobile rule). Fixed by moving it to a `.grid-gate` class that collapses to one column; re-run above.

No independent runs by anyone else are recorded here.

### Demo video checks

```
ffprobe: h264 1080x1920 30/1 + aac, duration=78.400000
ffmpeg silencedetect (noise=-40dB, d=1.2): no silent spans reported
container tags: major_brand, handler_name, vendor_id only (no encoder or creation tags)
```
