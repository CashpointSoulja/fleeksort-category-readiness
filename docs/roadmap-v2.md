# v2 roadmap

What would come next if the readiness gate were adopted. Ordered by value to the bet owner.

| # | Item | Why |
|---|---|---|
| 1 | **Second grader and inter-grader agreement (Cohen's kappa)** | The grader label is not perfect truth; the model should be judged against how well two graders agree |
| 2 | **Lot-clustered intervals** | Pieces from one supplier lot are correlated; clustered intervals stop a big lot from overstating confidence |
| 3 | **Join to real dispute data** | Replace the dispute-chance and refund placeholders with measured rates per grade step and category |
| 4 | **Saved, signed reads** | Store each read with its locked thresholds, timestamp and owner, so the scale call has an audit trail |
| 5 | **Push the verdict into Category Bet Desk** | The grading-agreement gate metric fills itself from the latest read |
| 6 | **Drift monitoring after scale** | Weekly audited sample in production; alert when the over-grade rate crosses the READY line |
| 7 | **Attribute checks** | Brand, garment type and size agreement alongside grade |
| 8 | **Sequential reads** | Stop labelling early when the result is clearly READY or clearly NOT READY, with the error rate controlled |
| 9 | **Photo-level drill-down** | Click a matrix cell to see the pieces behind it (needs image storage and access controls) |
