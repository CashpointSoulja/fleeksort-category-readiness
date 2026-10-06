# Success metrics

How we would judge the readiness gate if it were used for real. Targets are proposals, not benchmarks.

## North star

**Share of scaled categories whose grading still clears its READY lines 90 days after scale-up**, measured on a fresh labelled sample. Target: ≥ 90%. A category that passed the gate and then fails in production is the failure this tool exists to prevent.

## Input metrics

| Metric | Definition | Target |
|---|---|---|
| Thresholds locked before pilot | Category reads whose thresholds were saved before the first labelled piece ÷ all reads | 100% |
| Sample sufficiency | Reads with every grade at or above the required count ÷ reads used for a scale call | 100% |
| Slice coverage | Failure-mode slices with ≥ 30 pieces ÷ the four slices, per read | ≥ 3 of 4 |
| Time to read | Days from "labelling starts" to a gate verdict | ≤ 5 days |

## Outcome metrics

| Metric | Definition | Target |
|---|---|---|
| Dispute rate gap | Production dispute rate on the category ÷ disputes per bundle predicted at the gate | 0.7-1.3 |
| Leakage forecast error | Production grading leakage per bundle vs the gate estimate | Within ±30% |
| Over-grade rate after scale | Over-graded pieces ÷ audited pieces, 90 days after scale | ≤ READY line (6%) |
| Kill cost avoided | Categories stopped at NOT READY before supplier ramp | Tracked, not targeted |

## Guardrails

- No READY verdict on a grade below the required sample (enforced by the gate).
- No READY verdict with a judged failure-mode slice below the floor (enforced).
- Thresholds edited after the pilot are flagged on screen and in the read.
- No synthetic result is presented as measured.
