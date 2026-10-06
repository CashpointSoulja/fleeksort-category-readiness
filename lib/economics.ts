import { GRADES, gradeSteps, type Grade } from './grades';
import type { Matrix } from './agreement';

export interface CostInputs {
  /** Buyer price per piece by grade, £. */
  price: Record<Grade, number>;
  piecesPerBundle: number;
  /** Probability a buyer disputes a piece that was over-graded by one step / two steps. */
  disputeProbOneStep: number;
  disputeProbTwoSteps: number;
  /** Share of the over-graded piece's price refunded when a dispute is upheld. */
  refundShare: number;
  /** Ops cost to handle one dispute, £. */
  handlingCostPerDispute: number;
}

export interface MissCost {
  grader: Grade;
  model: Grade;
  kind: 'over' | 'under';
  steps: number;
  count: number;
  /** Share of all evaluated pieces that fall in this cell. */
  share: number;
  /** Expected £ lost each time this miss happens. */
  costPerMiss: number;
  /** share × costPerMiss: expected £ per evaluated piece. */
  evPerPiece: number;
}

/**
 * Over-grade (model says better than the grader): the buyer pays the model-grade price,
 * may dispute, and is refunded part of it, plus handling.
 *   cost = P(dispute | steps) × (refundShare × price[model] + handling)
 * Under-grade (model says worse): the piece sells at the lower grade's price.
 *   cost = price[grader] − price[model]  (money left on the table)
 */
export function costPerMiss(grader: Grade, model: Grade, c: CostInputs): number {
  const steps = gradeSteps(grader, model);
  if (steps > 0) {
    const pd = steps === 1 ? c.disputeProbOneStep : c.disputeProbTwoSteps;
    return pd * (c.refundShare * c.price[model] + c.handlingCostPerDispute);
  }
  if (steps < 0) return c.price[grader] - c.price[model];
  return 0;
}

export function missCosts(m: Matrix, c: CostInputs): MissCost[] {
  const n = m.flat().reduce((a, b) => a + b, 0);
  const out: MissCost[] = [];
  GRADES.forEach((g, i) =>
    GRADES.forEach((h, j) => {
      const steps = gradeSteps(g, h);
      if (steps === 0) return;
      const cost = costPerMiss(g, h, c);
      const share = n ? m[i][j] / n : 0;
      out.push({ grader: g, model: h, kind: steps > 0 ? 'over' : 'under', steps: Math.abs(steps), count: m[i][j], share, costPerMiss: cost, evPerPiece: share * cost });
    }),
  );
  return out;
}

export interface Leakage {
  disputesPerBundle: number;
  disputeLeakPerBundle: number;
  underGradeLeakPerBundle: number;
  totalLeakPerBundle: number;
  /** £ a bundle would realise if every piece were priced at the grader's grade. */
  idealValuePerBundle: number;
  /** ideal − dispute leakage − under-grade leakage. Over-grade premiums are not counted as a gain. */
  realisedValuePerBundle: number;
  /** realised / ideal. */
  priceRealisation: number;
  /** Premium buyers paid on over-graded pieces they did not dispute: a trust cost, not revenue. */
  undisputedOverpayPerBundle: number;
}

export function leakage(m: Matrix, c: CostInputs): Leakage {
  const n = m.flat().reduce((a, b) => a + b, 0);
  if (!n) return { disputesPerBundle: 0, disputeLeakPerBundle: 0, underGradeLeakPerBundle: 0, totalLeakPerBundle: 0, idealValuePerBundle: 0, realisedValuePerBundle: 0, priceRealisation: NaN, undisputedOverpayPerBundle: 0 };
  let disputes = 0, disputeLeak = 0, underLeak = 0, ideal = 0, overpay = 0;
  GRADES.forEach((g, i) =>
    GRADES.forEach((h, j) => {
      const share = m[i][j] / n;
      const steps = gradeSteps(g, h);
      ideal += share * c.price[g];
      if (steps > 0) {
        const pd = steps === 1 ? c.disputeProbOneStep : c.disputeProbTwoSteps;
        disputes += share * pd;
        disputeLeak += share * costPerMiss(g, h, c);
        overpay += share * (1 - pd) * (c.price[h] - c.price[g]);
      } else if (steps < 0) {
        underLeak += share * costPerMiss(g, h, c);
      }
    }),
  );
  const k = c.piecesPerBundle;
  const idealB = ideal * k;
  const realisedB = (ideal - disputeLeak - underLeak) * k;
  return {
    disputesPerBundle: disputes * k,
    disputeLeakPerBundle: disputeLeak * k,
    underGradeLeakPerBundle: underLeak * k,
    totalLeakPerBundle: (disputeLeak + underLeak) * k,
    idealValuePerBundle: idealB,
    realisedValuePerBundle: realisedB,
    priceRealisation: realisedB / idealB,
    undisputedOverpayPerBundle: overpay * k,
  };
}
