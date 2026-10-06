import { GRADES, gradeIndex, gradeSteps, type Grade } from './grades';
import { wilson, type Confidence, type Interval } from './stats';

export interface Piece {
  pieceId: string;
  graderGrade: Grade;
  modelGrade: Grade;
  photoQuality: 'good' | 'poor';
  stockCondition: 'clean' | 'dirty';
  garmentTypeSeen: 'yes' | 'no';
  brandLabel: 'ok' | 'mislabelled';
}

/** matrix[graderIdx][modelIdx] = count. Rows are the grader's grade, columns the model's. */
export type Matrix = number[][];

export function confusionMatrix(pieces: Pick<Piece, 'graderGrade' | 'modelGrade'>[]): Matrix {
  const m = GRADES.map(() => GRADES.map(() => 0));
  for (const p of pieces) m[gradeIndex(p.graderGrade)][gradeIndex(p.modelGrade)]++;
  return m;
}

export interface Agreement {
  n: number;
  exact: number;
  withinOne: number;
  overGraded: number;
  underGraded: number;
  exactRate: Interval;
  withinOneRate: Interval;
  overGradeRate: Interval;
  underGradeRate: Interval;
  /** Pieces per grader grade (row totals). */
  perGrade: Record<Grade, { n: number; exact: number; rate: Interval }>;
  matrix: Matrix;
}

export function agreement(m: Matrix, confidence: Confidence): Agreement {
  let n = 0, exact = 0, withinOne = 0, over = 0, under = 0;
  const perGrade = {} as Agreement['perGrade'];
  GRADES.forEach((g, i) => {
    let rowN = 0;
    GRADES.forEach((h, j) => {
      const c = m[i][j];
      rowN += c;
      n += c;
      const steps = gradeSteps(g, h);
      if (steps === 0) exact += c;
      if (Math.abs(steps) <= 1) withinOne += c;
      if (steps > 0) over += c;
      if (steps < 0) under += c;
    });
    perGrade[g] = { n: rowN, exact: m[i][i], rate: wilson(m[i][i], rowN, confidence) };
  });
  return {
    n,
    exact,
    withinOne,
    overGraded: over,
    underGraded: under,
    exactRate: wilson(exact, n, confidence),
    withinOneRate: wilson(withinOne, n, confidence),
    overGradeRate: wilson(over, n, confidence),
    underGradeRate: wilson(under, n, confidence),
    perGrade,
    matrix: m,
  };
}

export const FAILURE_MODES = [
  { key: 'photoQuality', label: 'Lighting and photo quality', risky: 'poor', riskyLabel: 'Poor photo', safeLabel: 'Good photo' },
  { key: 'stockCondition', label: 'Dirty stock', risky: 'dirty', riskyLabel: 'Dirty / unwashed', safeLabel: 'Clean' },
  { key: 'garmentTypeSeen', label: 'Unseen garment types', risky: 'no', riskyLabel: 'Type not in training', safeLabel: 'Seen type' },
  { key: 'brandLabel', label: 'Mislabelled brand', risky: 'mislabelled', riskyLabel: 'Brand mislabelled', safeLabel: 'Brand label OK' },
] as const;
export type FailureKey = (typeof FAILURE_MODES)[number]['key'];

export interface Slice {
  key: FailureKey;
  label: string;
  riskyLabel: string;
  risky: { n: number; exact: Interval; overGrade: Interval };
  rest: { n: number; exact: Interval; overGrade: Interval };
}

export function slices(pieces: Piece[], confidence: Confidence): Slice[] {
  return FAILURE_MODES.map((f) => {
    const risky = pieces.filter((p) => p[f.key] === f.risky);
    const rest = pieces.filter((p) => p[f.key] !== f.risky);
    const read = (ps: Piece[]) => {
      const a = agreement(confusionMatrix(ps), confidence);
      return { n: a.n, exact: a.exactRate, overGrade: a.overGradeRate };
    };
    return { key: f.key, label: f.label, riskyLabel: f.riskyLabel, risky: read(risky), rest: read(rest) };
  });
}
