import { describe, expect, it } from 'vitest';
import { agreement, confusionMatrix, slices, type Piece } from '@/lib/agreement';
import { costPerMiss, leakage, missCosts, type CostInputs } from '@/lib/economics';

// Rows = grader grade A, B, C; columns = model grade A, B, C. 100 pieces.
const M = [
  [40, 8, 2],
  [5, 30, 5],
  [1, 4, 5],
];
const C: CostInputs = { price: { A: 10, B: 7, C: 4 }, piecesPerBundle: 10, disputeProbOneStep: 0.2, disputeProbTwoSteps: 0.5, refundShare: 0.5, handlingCostPerDispute: 2 };

describe('confusion matrix and agreement rates (hand-counted 100-piece case)', () => {
  const a = agreement(M, 0.95);
  it('exact agreement = diagonal 40 + 30 + 5 = 75 of 100', () => {
    expect(a.n).toBe(100);
    expect(a.exact).toBe(75);
    expect(a.exactRate.point).toBe(0.75);
  });
  it('within one grade excludes only A↔C misses (2 + 1): 97 of 100', () => {
    expect(a.withinOne).toBe(97);
  });
  it('over-grades (model better than grader) = B→A 5 + C→A 1 + C→B 4 = 10', () => {
    expect(a.overGraded).toBe(10);
  });
  it('under-grades = A→B 8 + A→C 2 + B→C 5 = 15', () => {
    expect(a.underGraded).toBe(15);
  });
  it('per-grade rows: A 40/50, B 30/40, C 5/10', () => {
    expect(a.perGrade.A).toMatchObject({ n: 50, exact: 40 });
    expect(a.perGrade.B).toMatchObject({ n: 40, exact: 30 });
    expect(a.perGrade.C).toMatchObject({ n: 10, exact: 5 });
  });
  it('builds the same matrix from pieces', () => {
    const ps = [
      { graderGrade: 'A', modelGrade: 'A' },
      { graderGrade: 'A', modelGrade: 'C' },
      { graderGrade: 'C', modelGrade: 'B' },
    ] as const;
    expect(confusionMatrix([...ps])).toEqual([[1, 0, 1], [0, 0, 0], [0, 1, 0]]);
  });
});

describe('expected-value cost of each miss type', () => {
  it('B graded A (over by one): 0.2 × (0.5 × £10 + £2) = £1.40', () => {
    expect(costPerMiss('B', 'A', C)).toBeCloseTo(1.4, 10);
  });
  it('C graded A (over by two): 0.5 × (0.5 × £10 + £2) = £3.50', () => {
    expect(costPerMiss('C', 'A', C)).toBeCloseTo(3.5, 10);
  });
  it('C graded B (over by one): 0.2 × (0.5 × £7 + £2) = £1.10', () => {
    expect(costPerMiss('C', 'B', C)).toBeCloseTo(1.1, 10);
  });
  it('A graded B (under): £10 − £7 = £3 left on the table; A graded C: £6', () => {
    expect(costPerMiss('A', 'B', C)).toBe(3);
    expect(costPerMiss('A', 'C', C)).toBe(6);
    expect(costPerMiss('B', 'C', C)).toBe(3);
  });
  it('a correct grade costs nothing', () => {
    expect(costPerMiss('B', 'B', C)).toBe(0);
  });
  it('EV per evaluated piece = share × cost: B→A 0.05 × £1.40 = £0.07', () => {
    const ba = missCosts(M, C).find((x) => x.grader === 'B' && x.model === 'A')!;
    expect(ba.kind).toBe('over');
    expect(ba.evPerPiece).toBeCloseTo(0.07, 10);
    expect(missCosts(M, C)).toHaveLength(6);
  });
});

describe('dispute leakage and price realisation per bundle (10 pieces)', () => {
  const l = leakage(M, C);
  it('disputes: (0.05 × 0.2 + 0.01 × 0.5 + 0.04 × 0.2) × 10 = 0.23 per bundle', () => {
    expect(l.disputesPerBundle).toBeCloseTo(0.23, 10);
  });
  it('dispute leakage: (0.07 + 0.035 + 0.044) × 10 = £1.49', () => {
    expect(l.disputeLeakPerBundle).toBeCloseTo(1.49, 10);
  });
  it('under-grade leakage: (0.08 × 3 + 0.02 × 6 + 0.05 × 3) × 10 = £5.10', () => {
    expect(l.underGradeLeakPerBundle).toBeCloseTo(5.1, 10);
  });
  it('total £6.59; ideal (0.5 × 10 + 0.4 × 7 + 0.1 × 4) × 10 = £82; realised £75.41; realisation 91.96%', () => {
    expect(l.totalLeakPerBundle).toBeCloseTo(6.59, 10);
    expect(l.idealValuePerBundle).toBeCloseTo(82, 10);
    expect(l.realisedValuePerBundle).toBeCloseTo(75.41, 10);
    expect(l.priceRealisation).toBeCloseTo(75.41 / 82, 10);
  });
  it('undisputed overpayment: (0.05 × 0.8 × 3 + 0.01 × 0.5 × 6 + 0.04 × 0.8 × 3) × 10 = £2.46', () => {
    expect(l.undisputedOverpayPerBundle).toBeCloseTo(2.46, 10);
  });
  it('a perfect model leaks nothing and realises 100%', () => {
    const p = leakage([[5, 0, 0], [0, 5, 0], [0, 0, 5]], C);
    expect(p.totalLeakPerBundle).toBe(0);
    expect(p.priceRealisation).toBe(1);
  });
  it('an empty matrix returns zeros, not a fake realisation', () => {
    expect(Number.isNaN(leakage([[0, 0, 0], [0, 0, 0], [0, 0, 0]], C).priceRealisation)).toBe(true);
  });
});

describe('failure-mode slices expose what the aggregate hides', () => {
  const mk = (i: number, g: Piece['graderGrade'], m: Piece['modelGrade'], poor: boolean): Piece => ({ pieceId: `T${i}`, graderGrade: g, modelGrade: m, photoQuality: poor ? 'poor' : 'good', stockCondition: 'clean', garmentTypeSeen: 'yes', brandLabel: 'ok' });
  // 80 good photos all right; 20 poor photos, 10 right and 10 over-graded. Aggregate 90%, poor slice 50%.
  const ps = [
    ...Array.from({ length: 80 }, (_, i) => mk(i, 'B', 'B', false)),
    ...Array.from({ length: 10 }, (_, i) => mk(100 + i, 'B', 'B', true)),
    ...Array.from({ length: 10 }, (_, i) => mk(200 + i, 'B', 'A', true)),
  ];
  it('aggregate 90% exact, poor-photo slice 50%, good-photo slice 100%', () => {
    expect(agreement(confusionMatrix(ps), 0.95).exactRate.point).toBe(0.9);
    const photo = slices(ps, 0.95).find((s) => s.key === 'photoQuality')!;
    expect(photo.risky.n).toBe(20);
    expect(photo.risky.exact.point).toBe(0.5);
    expect(photo.risky.overGrade.point).toBe(0.5);
    expect(photo.rest.exact.point).toBe(1);
  });
});
