# PRD: FleekSort Category Readiness Eval

Independent concept by Ayomide Ahmed. Not an official Fleek product. No Fleek data; synthetic demo results only.

## Problem

Fleek's Special Projects Lead, Category Expansion takes "new category bets from thesis to proven economics", with win and kill metrics set before the work starts ([job post](https://www.ycombinator.com/companies/fleek/jobs/Iopbt9d-special-projects-lead-category-expansion)). Fleek sells graded bundles, and its grading runs on FleekSort, which the [careers page](https://www.joinfleek.com/careers) describes with "82% accuracy". A new category only scales if grading holds there: buyers pay for Grade A, and a Grade B piece sold as A becomes a dispute.

The [Category Bet Desk](https://github.com/CashpointSoulja/category-bet-desk) treats grading agreement as one of four gate metrics, but a single agreement number hides the questions that matter:

1. Was the evaluation set big enough, per grade, to trust the number?
2. Which way are the misses going? Over-grading and under-grading cost different amounts.
3. What does the error cost in pounds per bundle?
4. Does the number hold on the hard pieces (poor photos, dirty stock, unseen garment types, wrong brand), or only on average?
5. Were the pass lines set before the result was known?

These are risks I expect in any new-category grading read. They are inferred from public information, not observed Fleek problems.

## User

One seat: the Special Projects Lead, Category Expansion (the bet owner). Secondary readers: the founders who sign off a scale call, the grading and operations leads who own the labelled sample, and whoever owns FleekSort quality.

## Goal

For one candidate category, turn a labelled evaluation set into a READY / PILOT-ONLY / NOT READY call on grading, with the sample size, denominators, cost of error and pre-set thresholds visible, so the call can be defended in the decision meeting.

## Scope (v1)

| # | Requirement | Built |
|---|---|---|
| R1 | Pick a candidate category from three preloaded bets (vintage sportswear & branded outdoor, Y2K & 90s denim, kidswear) | Yes |
| R2 | Evaluation set builder: labelled pieces needed per grade, with the formula and working shown; editable expected agreement, margin and confidence | Yes |
| R3 | Rare-miss slice sizing: pieces needed to see a failure mode at least once | Yes |
| R4 | Confusion matrix of grader grade × model grade with row totals and row percentages | Yes |
| R5 | Exact agreement, within-one-grade agreement, over-grade and under-grade rates, each with numerator / denominator and a Wilson interval | Yes |
| R6 | Agreement per grade, so a strong Grade B cannot hide a weak Grade A | Yes |
| R7 | Expected-value cost of each miss type (over by one, over by two, under) | Yes |
| R8 | Dispute leakage, under-grade leakage and price realisation in £ per bundle, with labelled inputs | Yes |
| R9 | Readiness gate with explicit READY, PILOT-ONLY and NOT READY thresholds, locked before the pilot, warning when unlocked | Yes |
| R10 | Failure-mode table: lighting and photo quality, dirty stock, unseen garment types, mislabelled brand; slices with enough pieces are judged, small ones shown but not judged | Yes |
| R11 | CSV upload with a downloadable template; row-level validation; duplicates excluded; other categories skipped | Yes |
| R12 | Clearly labelled synthetic demo dataset, downloadable as CSV | Yes |
| R13 | No call to FleekSort or any model; nothing leaves the browser | Yes |
| R14 | Fleek look: official logo top-left, Montserrat, Fleek colours, listing-card category tiles, mobile layout at 390 px | Yes |
| R15 | Footer "independent concept by Ayomide Ahmed"; independence strip on every screen | Yes |

## Out of scope (v1)

- Calling FleekSort, storing results or sharing a read with others (see [roadmap](roadmap-v2.md)).
- Inter-grader agreement (two humans on the same piece). The grader label is treated as ground truth here; methodology explains the limit.
- Grades beyond A/B/C, and attribute checks (brand, size, garment type) other than as failure-mode tags.

## Requirements on behaviour

- **No data is never a pass.** An empty set is NOT READY with a reason.
- **Thin samples cannot be READY.** Any grade below the required count holds the call at PILOT-ONLY at best, and the shortfall is listed.
- **READY uses the cautious end of the interval.** Lower bound for agreement, upper bound for over-grading.
- **Every rate shows its denominator.**
- **Every £ input is labelled** Sourced, Estimated or Placeholder.
- **Synthetic is always labelled.** A badge on every section that shows synthetic results, and `SYN-` piece IDs.

## Acceptance

All maths is tested against hand-calculated cases ([test plan](test-plan.md)); the three synthetic sets return READY, PILOT-ONLY and NOT READY respectively; the page has no horizontal scroll at 390 px and no console errors.
