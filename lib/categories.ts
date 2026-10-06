import type { CostInputs } from './economics';
import type { Grade } from './grades';
import { SOURCES, type Source } from './sources';

export type Basis = 'sourced' | 'estimated' | 'placeholder';

export interface SyntheticProfile {
  seed: number;
  /** Pieces per grader grade in the synthetic set. */
  perGrade: Record<Grade, number>;
  /** Share of pieces carrying each risk attribute. */
  poorPhoto: number;
  dirty: number;
  unseen: number;
  mislabelled: number;
  /** Base chance the model misses on a clean, well-photographed, seen piece. */
  baseMiss: number;
  /** Extra miss chance per risk attribute present. */
  extraMiss: { poorPhoto: number; dirty: number; unseen: number; mislabelled: number };
  /** When the model misses, the chance it errs upwards (over-grades). */
  overShare: number;
  /** Of misses, the chance the miss is two steps where possible. */
  twoStepShare: number;
}

export interface CategoryBet {
  id: string;
  name: string;
  short: string;
  tile: string;
  why: string;
  watch: string;
  costs: CostInputs;
  costBasis: Record<'price' | 'piecesPerBundle' | 'dispute' | 'refundShare' | 'handling', { basis: Basis; note: string; source?: Source }>;
  synthetic: SyntheticProfile;
}

const DISPUTE_NOTE = 'Not public. Stand-in until dispute data is joined to grading misses.';

export const CATEGORIES: CategoryBet[] = [
  {
    id: 'vintage-sportswear',
    name: 'Vintage sportswear & branded outdoor',
    short: 'Sportswear & outdoor',
    tile: '#f8c642',
    why: 'Logos, fleece and shell fabrics photograph clearly; grade mostly turns on pilling, cuffs and zips.',
    watch: 'Faded logos and pilled fleece read as Grade A in flat light.',
    costs: { price: { A: 16.5, B: 12.4, C: 6.6 }, piecesPerBundle: 10, disputeProbOneStep: 0.2, disputeProbTwoSteps: 0.55, refundShare: 0.5, handlingCostPerDispute: 2.5 },
    costBasis: {
      price: { basis: 'estimated', note: 'Anchored on public Columbia fleece A/B at $14.10/pc and North Face fleece at $21.98/pc, converted at 0.75 £/$; the A/B/C split is an estimate.', source: SOURCES.columbia },
      piecesPerBundle: { basis: 'sourced', note: '"Columbia Fleece – Grade A/B – 10 Pcs" listing.', source: SOURCES.columbia },
      dispute: { basis: 'placeholder', note: DISPUTE_NOTE },
      refundShare: { basis: 'placeholder', note: 'Assumes a partial refund of half the piece price.' },
      handling: { basis: 'placeholder', note: 'Ops time per dispute; not public.' },
    },
    synthetic: { seed: 11, perGrade: { A: 230, B: 240, C: 210 }, poorPhoto: 0.12, dirty: 0.06, unseen: 0.05, mislabelled: 0.04, baseMiss: 0.045, extraMiss: { poorPhoto: 0.1, dirty: 0.08, unseen: 0.07, mislabelled: 0.05 }, overShare: 0.45, twoStepShare: 0.05 },
  },
  {
    id: 'y2k-denim',
    name: 'Y2K & 90s denim',
    short: 'Y2K & 90s denim',
    tile: '#7aa2d6',
    why: 'Large, liquid demand; silhouette and brand are easy to read from a photo.',
    watch: 'Intentional fading and distressing look like wear; washes shift under warm light.',
    costs: { price: { A: 15.0, B: 11.25, C: 6.0 }, piecesPerBundle: 20, disputeProbOneStep: 0.2, disputeProbTwoSteps: 0.55, refundShare: 0.5, handlingCostPerDispute: 2.5 },
    costBasis: {
      price: { basis: 'estimated', note: 'Anchored on public Y2K flare jeans, AB grade, at $17.52/pc, converted at 0.75 £/$; the A/B/C split is an estimate.', source: SOURCES.flares },
      piecesPerBundle: { basis: 'estimated', note: 'Typical bundle size assumed; check against live denim listings.' },
      dispute: { basis: 'placeholder', note: DISPUTE_NOTE },
      refundShare: { basis: 'placeholder', note: 'Assumes a partial refund of half the piece price.' },
      handling: { basis: 'placeholder', note: 'Ops time per dispute; not public.' },
    },
    synthetic: { seed: 23, perGrade: { A: 210, B: 250, C: 200 }, poorPhoto: 0.3, dirty: 0.05, unseen: 0.08, mislabelled: 0.05, baseMiss: 0.09, extraMiss: { poorPhoto: 0.22, dirty: 0.1, unseen: 0.15, mislabelled: 0.05 }, overShare: 0.42, twoStepShare: 0.04 },
  },
  {
    id: 'kidswear',
    name: 'Kidswear',
    short: 'Kidswear',
    tile: '#f2a07b',
    why: 'Steady demand from resellers; low price per piece needs fast, cheap grading.',
    watch: 'Stains and dirty stock; many small garment types the model may not have seen.',
    costs: { price: { A: 8.5, B: 6.4, C: 3.4 }, piecesPerBundle: 15, disputeProbOneStep: 0.2, disputeProbTwoSteps: 0.55, refundShare: 0.5, handlingCostPerDispute: 2.5 },
    costBasis: {
      price: { basis: 'estimated', note: 'Anchored on public kidswear listings at $6.53-$11.82/pc, converted at 0.75 £/$; the A/B/C split is an estimate.', source: SOURCES.kidswear },
      piecesPerBundle: { basis: 'estimated', note: 'Public kidswear bundles run roughly 12-20 pieces; 15 assumed.', source: SOURCES.kidswear },
      dispute: { basis: 'placeholder', note: DISPUTE_NOTE },
      refundShare: { basis: 'placeholder', note: 'Assumes a partial refund of half the piece price.' },
      handling: { basis: 'placeholder', note: 'Ops time per dispute; not public.' },
    },
    synthetic: { seed: 37, perGrade: { A: 70, B: 95, C: 75 }, poorPhoto: 0.18, dirty: 0.3, unseen: 0.25, mislabelled: 0.06, baseMiss: 0.12, extraMiss: { poorPhoto: 0.15, dirty: 0.28, unseen: 0.22, mislabelled: 0.05 }, overShare: 0.7, twoStepShare: 0.12 },
  },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
