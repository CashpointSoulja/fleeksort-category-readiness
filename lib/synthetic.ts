import type { Piece } from './agreement';
import { GRADES, type Grade } from './grades';
import type { CategoryBet } from './categories';

/** Small deterministic PRNG so the synthetic demo is identical on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PREFIX: Record<string, string> = { 'vintage-sportswear': 'SYN-SPT', 'y2k-denim': 'SYN-DNM', kidswear: 'SYN-KID' };

/** SYNTHETIC. Generates made-up grader and model grades for the demo. Not Fleek data or model output. */
export function syntheticPieces(bet: CategoryBet): Piece[] {
  const s = bet.synthetic;
  const r = mulberry32(s.seed);
  const out: Piece[] = [];
  let i = 0;
  for (const g of GRADES) {
    for (let k = 0; k < s.perGrade[g]; k++) {
      const poor = r() < s.poorPhoto;
      const dirty = r() < s.dirty;
      const unseen = r() < s.unseen;
      const mis = r() < s.mislabelled;
      const pMiss = Math.min(0.9, s.baseMiss + (poor ? s.extraMiss.poorPhoto : 0) + (dirty ? s.extraMiss.dirty : 0) + (unseen ? s.extraMiss.unseen : 0) + (mis ? s.extraMiss.mislabelled : 0));
      let model: Grade = g;
      if (r() < pMiss) {
        const gi = GRADES.indexOf(g);
        let dir = r() < s.overShare ? -1 : 1;
        if (gi + dir < 0 || gi + dir > 2) dir = -dir;
        let target = gi + dir;
        if (r() < s.twoStepShare && target + dir >= 0 && target + dir <= 2) target += dir;
        model = GRADES[target];
      }
      i++;
      out.push({
        pieceId: `${PREFIX[bet.id] ?? 'SYN'}-${String(i).padStart(4, '0')}`,
        graderGrade: g,
        modelGrade: model,
        photoQuality: poor ? 'poor' : 'good',
        stockCondition: dirty ? 'dirty' : 'clean',
        garmentTypeSeen: unseen ? 'no' : 'yes',
        brandLabel: mis ? 'mislabelled' : 'ok',
      });
    }
  }
  return out;
}
