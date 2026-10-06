import { GRADES, type Grade } from './grades';
import type { Piece } from './agreement';

export const CSV_COLUMNS = ['piece_id', 'category', 'grader_grade', 'model_grade', 'photo_quality', 'stock_condition', 'garment_type_seen', 'brand_label'] as const;

const ALLOWED: Record<string, readonly string[]> = {
  grader_grade: GRADES,
  model_grade: GRADES,
  photo_quality: ['good', 'poor'],
  stock_condition: ['clean', 'dirty'],
  garment_type_seen: ['yes', 'no'],
  brand_label: ['ok', 'mislabelled'],
};

export const CSV_TEMPLATE = [
  CSV_COLUMNS.join(','),
  'EXAMPLE-0001,vintage-sportswear,A,A,good,clean,yes,ok',
  'EXAMPLE-0002,vintage-sportswear,B,A,poor,clean,yes,ok',
  'EXAMPLE-0003,vintage-sportswear,C,B,good,dirty,no,mislabelled',
].join('\n') + '\n';

export interface RowError {
  line: number;
  pieceId: string;
  message: string;
}

export interface ParseResult {
  pieces: Piece[];
  errors: RowError[];
  skippedOtherCategory: number;
  duplicateIds: string[];
  totalRows: number;
}

/** Splits one CSV line, honouring double-quoted fields and "" escapes. */
export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/**
 * Parses grader-vs-model results. Rows with any invalid field are listed and excluded.
 * A piece_id that appears more than once is excluded entirely: the read cannot know which
 * grade is right, and counting it twice would inflate the sample.
 */
export function parseResultsCsv(text: string, categoryId?: string): ParseResult {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const nonEmpty = lines.map((l, i) => ({ l, line: i + 1 })).filter((x) => x.l.trim() !== '');
  const result: ParseResult = { pieces: [], errors: [], skippedOtherCategory: 0, duplicateIds: [], totalRows: Math.max(0, nonEmpty.length - 1) };
  if (!nonEmpty.length) {
    result.errors.push({ line: 1, pieceId: '', message: 'File is empty.' });
    return result;
  }
  const header = splitCsvLine(nonEmpty[0].l).map((h) => h.toLowerCase());
  const missing = CSV_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) {
    result.errors.push({ line: nonEmpty[0].line, pieceId: '', message: `Missing column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. Download the template for the exact header.` });
    return result;
  }
  const col = (name: string) => header.indexOf(name);
  const candidates: { line: number; piece: Piece }[] = [];
  const seen = new Map<string, number>();
  for (const { l, line } of nonEmpty.slice(1)) {
    const f = splitCsvLine(l);
    const get = (c: string) => f[col(c)] ?? '';
    const pieceId = get('piece_id');
    if (!pieceId) { result.errors.push({ line, pieceId: '', message: 'piece_id is blank.' }); continue; }
    const cat = get('category');
    if (categoryId && cat && cat !== categoryId) { result.skippedOtherCategory++; continue; }
    const rowErrors: string[] = [];
    const norm: Record<string, string> = {};
    for (const [c, allowed] of Object.entries(ALLOWED)) {
      const raw = get(c);
      const v = c.endsWith('_grade') ? raw.toUpperCase() : raw.toLowerCase();
      if (!allowed.includes(v)) rowErrors.push(`${c} "${raw}" is not one of ${allowed.join('/')}`);
      norm[c] = v;
    }
    if (rowErrors.length) { result.errors.push({ line, pieceId, message: rowErrors.join('; ') + '.' }); continue; }
    seen.set(pieceId, (seen.get(pieceId) ?? 0) + 1);
    candidates.push({
      line,
      piece: {
        pieceId,
        graderGrade: norm.grader_grade as Grade,
        modelGrade: norm.model_grade as Grade,
        photoQuality: norm.photo_quality as Piece['photoQuality'],
        stockCondition: norm.stock_condition as Piece['stockCondition'],
        garmentTypeSeen: norm.garment_type_seen as Piece['garmentTypeSeen'],
        brandLabel: norm.brand_label as Piece['brandLabel'],
      },
    });
  }
  for (const [id, count] of seen) if (count > 1) result.duplicateIds.push(id);
  for (const c of candidates) {
    if (result.duplicateIds.includes(c.piece.pieceId)) result.errors.push({ line: c.line, pieceId: c.piece.pieceId, message: 'Duplicate piece_id; every copy excluded.' });
    else result.pieces.push(c.piece);
  }
  return result;
}

export function piecesToCsv(pieces: Piece[], categoryId: string): string {
  const rows = pieces.map((p) => [p.pieceId, categoryId, p.graderGrade, p.modelGrade, p.photoQuality, p.stockCondition, p.garmentTypeSeen, p.brandLabel].join(','));
  return [CSV_COLUMNS.join(','), ...rows].join('\n') + '\n';
}
