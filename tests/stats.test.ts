import { describe, expect, it } from 'vitest';
import { marginForSample, sampleSizeForProportion, sampleSizeToObserve, wilson } from '@/lib/stats';

describe('sample size for a defensible agreement read', () => {
  it('85% expected agreement, ±5 pts, 95%: 1.96² × 0.85 × 0.15 / 0.05² = 195.92 → 196 per grade', () => {
    expect(sampleSizeForProportion(0.85, 0.05, 0.95)).toBe(196);
  });
  it('worst case p = 0.5, ±5 pts, 95%: 3.8416 × 0.25 / 0.0025 = 384.16 → 385', () => {
    expect(sampleSizeForProportion(0.5, 0.05, 0.95)).toBe(385);
  });
  it('90% expected, ±3 pts, 90% confidence: 1.645² × 0.09 / 0.0009 = 270.60 → 271', () => {
    expect(sampleSizeForProportion(0.9, 0.03, 0.9)).toBe(271);
  });
  it('99% confidence, 80% expected, ±5 pts: 2.576² × 0.16 / 0.0025 = 424.68 → 425', () => {
    expect(sampleSizeForProportion(0.8, 0.05, 0.99)).toBe(425);
  });
  it('refuses impossible inputs', () => {
    expect(() => sampleSizeForProportion(1, 0.05, 0.95)).toThrow();
    expect(() => sampleSizeForProportion(0.85, 0, 0.95)).toThrow();
  });
});

describe('pieces needed to see a rare miss at least once', () => {
  it('5% miss rate, 95% chance: ln(0.05) / ln(0.95) = 58.40 → 59', () => {
    expect(sampleSizeToObserve(0.05, 0.95)).toBe(59);
  });
  it('1% miss rate, 95% chance: ln(0.05) / ln(0.99) = 298.07 → 299', () => {
    expect(sampleSizeToObserve(0.01, 0.95)).toBe(299);
  });
});

describe('margin you get from a given sample', () => {
  it('196 pieces at 85%: 1.96 × √(0.1275 / 196) = 0.04999', () => {
    expect(marginForSample(0.85, 196, 0.95)).toBeCloseTo(0.04999, 5);
  });
});

describe('Wilson score interval', () => {
  it('8 of 10 at 95%: centre 0.99208 / 1.38416 = 0.71674, half-width 0.31362 / 1.38416 = 0.22658', () => {
    const w = wilson(8, 10, 0.95);
    expect(w.point).toBe(0.8);
    expect(w.low).toBeCloseTo(0.4902, 4);
    expect(w.high).toBeCloseTo(0.9433, 4);
  });
  it('0 of 10 stays inside [0, 1]: low 0, high 2 × 0.19208 / 1.38416 = 0.27754', () => {
    const w = wilson(0, 10, 0.95);
    expect(w.low).toBe(0);
    expect(w.high).toBeCloseTo(0.27754, 4);
  });
  it('no pieces gives no point estimate and the widest interval', () => {
    const w = wilson(0, 0, 0.95);
    expect(Number.isNaN(w.point)).toBe(true);
    expect([w.low, w.high]).toEqual([0, 1]);
  });
});
