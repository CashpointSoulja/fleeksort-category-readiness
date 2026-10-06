export type Confidence = 0.9 | 0.95 | 0.99;

/** Two-sided normal critical values, rounded the way they appear in textbooks. */
export const Z: Record<Confidence, number> = { 0.9: 1.645, 0.95: 1.96, 0.99: 2.576 };

/**
 * Pieces needed to estimate a proportion p to within ±margin at the given confidence:
 * n = z² · p(1 − p) / margin², rounded up.
 */
export function sampleSizeForProportion(p: number, margin: number, confidence: Confidence): number {
  if (!(p > 0 && p < 1)) throw new Error('Expected agreement must be between 0 and 1 (exclusive).');
  if (!(margin > 0 && margin < 1)) throw new Error('Margin must be between 0 and 1 (exclusive).');
  const z = Z[confidence];
  return Math.ceil(round9((z * z * p * (1 - p)) / (margin * margin)));
}

/**
 * Pieces needed so that a miss type occurring at `rate` shows up at least once
 * with probability `detectProb`: n = ln(1 − detectProb) / ln(1 − rate), rounded up.
 */
export function sampleSizeToObserve(rate: number, detectProb: number): number {
  if (!(rate > 0 && rate < 1)) throw new Error('Rate must be between 0 and 1 (exclusive).');
  if (!(detectProb > 0 && detectProb < 1)) throw new Error('Detection probability must be between 0 and 1 (exclusive).');
  return Math.ceil(round9(Math.log(1 - detectProb) / Math.log(1 - rate)));
}

/** Half-width of the normal-approximation interval you would get from n pieces at agreement p. */
export function marginForSample(p: number, n: number, confidence: Confidence): number {
  if (n <= 0) return Infinity;
  const z = Z[confidence];
  return z * Math.sqrt((p * (1 - p)) / n);
}

export interface Interval {
  point: number;
  low: number;
  high: number;
}

/**
 * Wilson score interval for k successes out of n. Used instead of the normal
 * interval because it stays inside [0, 1] and behaves on small or extreme samples.
 */
export function wilson(k: number, n: number, confidence: Confidence): Interval {
  if (n <= 0) return { point: NaN, low: 0, high: 1 };
  if (k < 0 || k > n) throw new Error('k must be between 0 and n.');
  const z = Z[confidence];
  const p = k / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return { point: p, low: Math.max(0, centre - half), high: Math.min(1, centre + half) };
}

function round9(x: number) {
  return Math.round(x * 1e9) / 1e9;
}
