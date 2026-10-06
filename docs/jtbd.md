# Jobs to be done

## Primary: the bet owner (Special Projects Lead, Category Expansion)

**When** I commit to testing a new category, **I want to** know how many pieces per grade the graders must label before the read means anything, **so that** I ask operations for the right sample once, not three times.

**When** the labelled sample comes back, **I want to** see where the model and the graders disagree, by grade and by direction, **so that** I know whether the problem is disputes (over-grading) or margin (under-grading).

**When** I explain the result to the founders, **I want** the error in pounds per bundle, **so that** grading quality sits in the same units as the rest of the bet's economics.

**When** the result is borderline, **I want** a READY / PILOT-ONLY / NOT READY call against lines we agreed before the pilot, **so that** nobody, including me, moves the goalposts.

**When** a category passes on average, **I want to** see whether the hard pieces (poor photos, dirty stock, unseen garment types, wrong brand) also pass, **so that** we don't scale into the slice that generates the disputes.

**When** I have real results, **I want to** drop in a CSV and get the same read, **so that** the tool is useful beyond the demo.

## Secondary

- **Founders:** compare categories on the same yardstick and see the cost of grading error per bundle.
- **Grading operations lead:** see which failure mode to fix first (re-shoot under the lightbox, wash before grading, add labelled examples).
- **FleekSort owner:** get a per-category, per-slice error list instead of one accuracy figure.
- **Category Bet Desk:** receives the grading-agreement metric with its sample size and verdict.

## Forces

| Push (today) | Pull (this tool) |
|---|---|
| One accuracy number per category | Matrix, direction, per-grade split, intervals |
| Sample size guessed | Sample size computed per grade, with working |
| Error discussed in % | Error in £ per bundle |
| Thresholds set late | Thresholds locked before the pilot |

| Anxiety | Habit |
|---|---|
| "The cost inputs are guesses" → they are labelled Placeholder and editable | Reading accuracy off a spreadsheet → CSV upload keeps the same data shape |
| "Grader labels are not perfect either" → methodology states it; v2 adds a second grader | |
