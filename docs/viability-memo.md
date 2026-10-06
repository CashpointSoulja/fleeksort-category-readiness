# Viability memo: the readiness gate and the Special Projects Lead role

Independent concept by Ayomide Ahmed. Not an official Fleek product. Uses public information only; all results shown are synthetic.

## The role, from public sources

The [job post](https://www.ycombinator.com/companies/fleek/jobs/Iopbt9d-special-projects-lead-category-expansion) describes a London-based owner who takes "new category bets from thesis to proven economics", each of which "could add £5M+ in GMV", with win and kill metrics defined before the work starts. Fleek has about 2,000 verified suppliers and more than 50,000 buyers in 100+ countries and raised a $25M Series B in July 2026 ([Fortune](https://fortune.com/2026/07/08/fleek-an-online-marketplace-connecting-vintage-clothing-wholesalers-and-retailers-raises-25-million-in-new-funding/); [The Next Web](https://thenextweb.com/news/fleek-25m-series-b-secondhand-fashion-ai)). Both pieces describe FleekSort as the system that identifies, categorises and grades garments from photos; the [careers page](https://www.joinfleek.com/careers) cites "82% accuracy".

## Why grading is the gate

- **Fleek sells grades.** A bundle is bought on its A/B/C mix. When grading drifts in a new category, buyers get B pieces at A prices; some reviews on [Trustpilot](https://uk.trustpilot.com/review/joinfleek.com) already mention grade or condition mismatch.
- **New categories are where grading is weakest.** Different fabrics, distressing that looks like wear (denim), stains and many small garment types (kidswear). The aggregate figure says little about a category the model has seen less of.
- **The bet owner owns the call.** The role sets win/kill metrics up front; grading agreement is one of them in the [Category Bet Desk](https://github.com/CashpointSoulja/category-bet-desk). This tool is how that metric gets a defensible value.

## What the tool adds

1. **A sample plan before labelling.** 196 pieces per grade at the defaults, so operations labels the right amount once.
2. **Error in pounds.** On the synthetic sets, grading costs £2.27 per sportswear bundle (1.9% of value), £11.76 per denim bundle (5.4%) and £8.37 per kidswear bundle (9.2%). Pounds per bundle sit next to contribution per bundle in the bet's P&L.
3. **A verdict that cannot be argued after the fact.** READY / PILOT-ONLY / NOT READY on locked lines, with reasons.
4. **A fix list.** In the synthetic denim set, poor photos agree 67.0% against 87.3% on the rest; that points at the lightbox, not the model.

## What it would take to use for real

1. A labelled evaluation set per category from the grading hubs, with the four failure-mode tags.
2. Model grades for the same pieces, exported by whoever owns FleekSort. This concept does not call FleekSort.
3. Dispute and refund data joined to grade misses, to replace the placeholders.
4. Thresholds agreed with the founders and grading lead, per category.

## Cost and risk

A static site, no back end, no data leaves the browser; it costs nothing to run. The main risks are treating grader labels as perfect and trusting placeholder cost inputs; the methodology states both and the roadmap addresses them.

## Recommendation

Make the readiness read a required input to every category bet's scale call: size the set with the builder, lock the lines, label, upload, and bring the verdict and the pounds-per-bundle figure to the decision meeting.
