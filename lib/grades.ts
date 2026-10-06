export const GRADES = ['A', 'B', 'C'] as const;
export type Grade = (typeof GRADES)[number];

/** Fleek's public grade definitions (joinfleek.com FAQ, read 6 October 2026). */
export const GRADE_DEFINITIONS: Record<Grade, string> = {
  A: 'Excellent condition',
  B: 'Minor wear',
  C: 'Noticeable flaws but still wearable',
};

export const gradeIndex = (g: Grade) => GRADES.indexOf(g);

/** Positive = the model graded the piece better than the grader did (over-grade). */
export const gradeSteps = (grader: Grade, model: Grade) => gradeIndex(grader) - gradeIndex(model);
