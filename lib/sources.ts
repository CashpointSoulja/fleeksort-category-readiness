export interface Source { label: string; url: string }

export const SOURCES = {
  jobPost: { label: 'YC job post: Special Projects Lead, Category Expansion', url: 'https://www.ycombinator.com/companies/fleek/jobs/Iopbt9d-special-projects-lead-category-expansion' },
  home: { label: 'joinfleek.com: grade definitions (FAQ)', url: 'https://www.joinfleek.com/' },
  careers: { label: 'joinfleek.com/careers: FleekSort, "82% accuracy"', url: 'https://www.joinfleek.com/careers' },
  fortune: { label: 'Fortune, 8 Jul 2026: $25M Series B', url: 'https://fortune.com/2026/07/08/fleek-an-online-marketplace-connecting-vintage-clothing-wholesalers-and-retailers-raises-25-million-in-new-funding/' },
  tnw: { label: 'The Next Web, 8 Jul 2026: Series B', url: 'https://thenextweb.com/news/fleek-25m-series-b-secondhand-fashion-ai' },
  columbia: { label: 'Fleek listing: Columbia Fleece, Grade A/B, 10 pcs', url: 'https://www.joinfleek.com/collections/columbia' },
  tnf: { label: 'Fleek listings: The North Face', url: 'https://www.joinfleek.com/collections/the-north-face' },
  flares: { label: 'Fleek listings: Y2K flared jeans, AB grade', url: 'https://www.joinfleek.com/collections/y2k-flared-jeans' },
  kidswear: { label: 'Fleek listings: kidswear', url: 'https://www.joinfleek.com/category/kidswear' },
  trustpilot: { label: 'Trustpilot: Fleek reviews', url: 'https://uk.trustpilot.com/review/joinfleek.com' },
  betDesk: { label: 'Category Bet Desk (companion concept)', url: 'https://github.com/CashpointSoulja/category-bet-desk' },
} satisfies Record<string, Source>;
