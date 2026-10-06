# Brand sheet: mirroring Fleek's live product UI

FleekSort Category Readiness Eval is an independent concept. It reuses the brand sheet written for the companion [Category Bet Desk](https://github.com/CashpointSoulja/category-bet-desk/blob/build/category-bet-desk/docs/brand-sheet.md), so the two read as one family of internal tools that could sit inside Fleek's product. It is not a Fleek product and is not affiliated with Fleek.

Source inspection (6 October 2026): joinfleek.com home (1366 px and 390 px), `/careers`, `/category/denim`, the site's CSS custom properties and logo assets.

## Logo
- The official black "FLEEK" starburst wordmark on a transparent background, served by the live site as `/_next/static/media/black_logo_transparent_background.webp`. Used unmodified at `public/brand/fleek-logo.webp`, top-left of the sticky white header, 30 px high on desktop and 22 px on mobile. Never recoloured, cropped or placed on yellow.
- The black top strip carries "Independent concept by Ayomide Ahmed · not an official Fleek product · demo numbers are synthetic, not FleekSort output".

## Colour (from the live site's `--cf-*` properties)
| Token | Hex | Use here |
|---|---|---|
| `--cf-black` | `#0f0f0f` | Text, primary buttons, the SYNTHETIC DEMO badge |
| `--cf-yellow` | `#f8c642` | Accent words, eyebrow pill, Upload results button, section numbers (darker shade) |
| `--cf-cream` | `#f6f1e7` | Hero and alternating section bands, KPI tiles |
| `--cf-orange` | `#f25c2a` | Fail / NOT READY accents |
| `--cf-blue` | `#0d2bff` | Links and SOURCED labels |
| `#eaecf0`, `#98a2b3`, `#475467` | | Borders and secondary text |

Status colour is always paired with a word: green READY / Pass, amber PILOT-ONLY / under-grade cells, red NOT READY / Fail / over-grade cells.

## Type
- Montserrat throughout (SIL OFL), self-hosted via `@fontsource/montserrat`. Headings 700-800 weight, sentence case, one phrase in yellow. Tracked caps for eyebrow labels and table headers. Tabular figures for every number; formulas in a monospace block.

## Components
- **Category tiles = listing cards.** A flat colour tile where Fleek shows the product photo, a SYNTHETIC badge where Fleek shows a grade badge, then the title, the big exact-agreement figure with its piece count chip, leakage per bundle in grey and the verdict chip.
- **Grade pills.** A / B / C with Fleek's public definitions, beside a link to the source.
- **Stat tiles.** Big number, caption, numerator / denominator and interval underneath.
- **Assumption labels.** Blue outlined `SOURCED ↗`, yellow `ESTIMATED`, dashed grey `PLACEHOLDER`.
- **Buttons.** Pill shape, 2 px black border, 44 px touch height.
- **Footer.** Black, "independent concept by Ayomide Ahmed", sources and non-affiliation line.
