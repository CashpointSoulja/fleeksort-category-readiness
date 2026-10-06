# Five Whys

Problem statement: **a new category can be scaled before anyone knows whether grading holds in it.**

This is a hypothesis about new-category work at a graded marketplace, built from public information. It is not a reported Fleek problem.

1. **Why could a category scale without grading holding?** Because the grading check is usually one agreement number, and one number can look fine when it should not.
2. **Why can one number look fine when it should not?** Because it is often read off a small or lopsided sample, with no interval and no per-grade split, so 90% on 40 pieces mostly of Grade B looks the same as 90% on 600 pieces.
3. **Why does the direction of the misses matter?** Because over-grading (a B sold as an A) turns into disputes and refunds and erodes buyer trust, while under-grading quietly sells good stock cheap. The same agreement rate can carry very different costs per bundle.
4. **Why doesn't the average catch the hard pieces?** Because the risky pieces in a new category (poor photos, dirty stock, garment types the model has not seen, wrong brand) are a minority, so they barely move the aggregate even when they fail badly.
5. **Why isn't this settled by thresholds?** Because if the pass line is agreed after the result is in, it tends to move to fit the result.

**Root cause:** there is no standard, pre-agreed readiness read for grading per category that sizes the sample first, splits the misses by direction and by failure mode, prices them, and applies fixed lines.

**What the tool does about it:** a sample-size builder before any labelling; a confusion matrix with denominators and intervals; a pounds-per-bundle cost of error; failure-mode slices judged on their own; and a three-way gate with thresholds locked before the pilot.

## Evidence vs assumption

| Claim | Status |
|---|---|
| Fleek grades bundles A / B / C with public definitions | Public ([joinfleek.com](https://www.joinfleek.com/)) |
| FleekSort is described with "82% accuracy" | Public ([careers](https://www.joinfleek.com/careers)) |
| Some buyer reviews complain of grade or condition mismatch | Public ([Trustpilot](https://uk.trustpilot.com/review/joinfleek.com)) |
| Category bets need win/kill metrics set up front | Public ([job post](https://www.ycombinator.com/companies/fleek/jobs/Iopbt9d-special-projects-lead-category-expansion)) |
| Agreement is read off small or unsplit samples today | Assumption |
| Dispute chance per grade step, refund share, handling cost | Assumption (placeholders) |
