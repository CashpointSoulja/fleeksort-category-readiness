# Eval methodology

Independent concept by Ayomide Ahmed. Not an official Fleek product. This describes how the tool reads a labelled evaluation set; it does not describe how Fleek evaluates FleekSort.

## 1. The unit of evaluation

One row per piece: the **grader's grade** (treated as ground truth), the **model's grade** for the same piece, the category, and four failure-mode tags (`photo_quality`, `stock_condition`, `garment_type_seen`, `brand_label`). Grades follow Fleek's public definitions: **A** excellent condition, **B** minor wear, **C** noticeable flaws but still wearable.

## 2. How big the set must be

Agreement is a proportion, so the sample needed to estimate it within a margin \(E\) at confidence \(z\) is

\[ n = \left\lceil \frac{z^2\,p(1-p)}{E^2} \right\rceil \]

with \(z\) = 1.645 / 1.96 / 2.576 for 90 / 95 / 99%. The tool applies this **per grade**, because each grade is a separate promise to the buyer and a grade can fail while the total passes.

| Expected agreement \(p\) | Margin | Confidence | Per grade | Working |
|---|---|---|---|---|
| 85% | ±5 pts | 95% | **196** | 1.96² × 0.85 × 0.15 / 0.05² = 195.92 |
| 50% (worst case) | ±5 pts | 95% | 385 | 1.96² × 0.25 / 0.0025 = 384.16 |
| 90% | ±3 pts | 90% | 271 | 1.645² × 0.09 / 0.0009 = 270.60 |
| 80% | ±5 pts | 99% | 425 | 2.576² × 0.16 / 0.0025 = 424.68 |

Start from a conservative \(p\): the only public figure is "82% accuracy" overall, and a new category may sit below it.

**Rare failure modes.** To see a miss that happens at rate \(r\) at least once with probability \(P\): \(n = \lceil \ln(1-P) / \ln(1-r) \rceil\). At \(r\) = 2% and \(P\) = 95% that is 149 pieces per slice.

## 3. Agreement metrics

From the 3×3 confusion matrix (rows = grader, columns = model):

- **Exact agreement** = diagonal ÷ all pieces.
- **Within one grade** = all pieces except A↔C misses ÷ all pieces.
- **Over-grade rate** = pieces the model graded better than the grader (B→A, C→A, C→B) ÷ all pieces.
- **Under-grade rate** = pieces graded worse (A→B, A→C, B→C) ÷ all pieces.
- **Per-grade agreement** = diagonal cell ÷ row total.

Every rate is shown with its numerator and denominator and a **Wilson score interval**, which behaves at rates near 0% or 100% and at small \(n\), where the normal approximation gives impossible bounds.

## 4. Cost of each miss

Inputs per category (all labelled in the UI): price per piece by grade, pieces per bundle, dispute chance when over by one or two grades, refund share, handling cost per dispute.

- **Over-grade** (model better than grader): expected cost = P(dispute | steps) × (refund share × listed price at the model's grade + handling cost).
- **Under-grade** (model worse): cost = price at the true grade − price at the model's grade. The buyer never complains; Fleek and the supplier just sell for less.

Hand example (prices A £10 / B £7 / C £4, dispute 20% one step, 50% two steps, refund 50%, handling £2): B graded A costs 0.2 × (0.5 × 10 + 2) = £1.40; C graded A 0.5 × (0.5 × 10 + 2) = £3.50; A graded B £3; A graded C £6.

## 5. Leakage and price realisation per bundle

- **Ideal value** = Σ share of pieces at each true grade × price at that grade × pieces per bundle.
- **Dispute leakage** = Σ over-grade cells: share × expected dispute cost × pieces per bundle.
- **Under-grade leakage** = Σ under-grade cells: share × price gap × pieces per bundle.
- **Realised value** = ideal − dispute leakage − under-grade leakage. **Price realisation** = realised ÷ ideal.
- **Undisputed overpayment** is shown separately and **not** counted as a gain: an over-graded piece nobody disputes still sold above its true grade, to a buyer who may not come back.

## 6. The gate

Thresholds are set and locked before the pilot. Defaults are a proposal, not Fleek policy:

| Line | READY (on the confidence bound) | PILOT-ONLY (point estimate) |
|---|---|---|
| Pieces per grade | ≥ required \(n\) (196 at defaults) | Shortfall allowed, flagged |
| Exact agreement | lower bound ≥ 85% | ≥ 75% |
| Within one grade | lower bound ≥ 97% | ≥ 93% |
| Over-grade rate | upper bound ≤ 6% | ≤ 10% |
| Grading leakage ÷ ideal bundle value | ≤ 3% | ≤ 6% |
| Failure-mode slices | every slice with ≥ 30 pieces ≥ 75% exact | Weak slices allowed, inspected |

**READY** needs every READY line. **PILOT-ONLY** needs every PILOT line. Anything else, including no data, is **NOT READY**. Each blocked line is listed as a reason.

## 7. Failure modes

| Mode | Tag | What to inspect |
|---|---|---|
| Lighting and photo quality | `photo_quality = poor` | Re-shoot a sample under the hub lightbox; check whether misses cluster by station or time of day |
| Dirty stock | `stock_condition = dirty` | Grade a sample before and after washing |
| Unseen garment types | `garment_type_seen = no` | List the garment types behind the misses; add labelled examples |
| Mislabelled brand | `brand_label = mislabelled` | Cross-check brand against care labels and logos |

Each slice is compared with the rest of the set. Slices under 30 pieces are shown but not judged.

## 8. Known limits

- The grader label is treated as truth. Real graders disagree with each other; v2 adds a second grader and Cohen's kappa.
- Pieces are assumed independent. Pieces from the same supplier lot are correlated, so the real interval is wider; v2 adds lot-clustered intervals.
- The cost model is linear and the dispute inputs are placeholders until joined to real dispute data.
- Slices are tested one at a time; with four slices some false alarms are expected.
