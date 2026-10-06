import { describe, expect, it } from 'vitest';
import { CSV_TEMPLATE, parseResultsCsv, piecesToCsv, splitCsvLine } from '@/lib/csv';
import { CATEGORIES } from '@/lib/categories';
import { syntheticPieces } from '@/lib/synthetic';

const H = 'piece_id,category,grader_grade,model_grade,photo_quality,stock_condition,garment_type_seen,brand_label';

describe('results CSV', () => {
  it('the downloadable template parses cleanly into 3 pieces', () => {
    const r = parseResultsCsv(CSV_TEMPLATE, 'vintage-sportswear');
    expect(r.errors).toEqual([]);
    expect(r.pieces).toHaveLength(3);
    expect(r.pieces[1]).toMatchObject({ graderGrade: 'B', modelGrade: 'A', photoQuality: 'poor' });
  });
  it('names missing columns and loads nothing', () => {
    const r = parseResultsCsv('piece_id,grader_grade\nX,A\n');
    expect(r.pieces).toHaveLength(0);
    expect(r.errors[0].message).toMatch(/Missing columns: category, model_grade/);
  });
  it('lists bad rows by line and keeps good ones; grades are case-insensitive', () => {
    const r = parseResultsCsv(`${H}\nP1,,a,b,good,clean,yes,ok\nP2,,A,D,good,clean,yes,ok\nP3,,B,B,blurry,clean,yes,ok\n`);
    expect(r.pieces.map((p) => p.pieceId)).toEqual(['P1']);
    expect(r.errors.map((e) => e.line)).toEqual([3, 4]);
    expect(r.errors[0].message).toMatch(/model_grade "D"/);
  });
  it('excludes every copy of a duplicated piece_id', () => {
    const r = parseResultsCsv(`${H}\nP1,,A,A,good,clean,yes,ok\nP1,,A,B,good,clean,yes,ok\nP2,,C,C,good,clean,yes,ok\n`);
    expect(r.duplicateIds).toEqual(['P1']);
    expect(r.pieces.map((p) => p.pieceId)).toEqual(['P2']);
    expect(r.errors).toHaveLength(2);
  });
  it('skips rows for another category and counts them', () => {
    const r = parseResultsCsv(`${H}\nP1,kidswear,A,A,good,clean,yes,ok\nP2,y2k-denim,A,A,good,clean,yes,ok\n`, 'kidswear');
    expect(r.pieces).toHaveLength(1);
    expect(r.skippedOtherCategory).toBe(1);
  });
  it('handles quoted fields, a BOM and Windows line endings', () => {
    expect(splitCsvLine('"a,b",c,"say ""hi"""')).toEqual(['a,b', 'c', 'say "hi"']);
    const r = parseResultsCsv(`\uFEFF${H}\r\n"P,1",,A,A,good,clean,yes,ok\r\n`);
    expect(r.pieces[0].pieceId).toBe('P,1');
  });
  it('round-trips the synthetic demo set through CSV', () => {
    const bet = CATEGORIES[1];
    const ps = syntheticPieces(bet);
    const r = parseResultsCsv(piecesToCsv(ps, bet.id), bet.id);
    expect(r.errors).toEqual([]);
    expect(r.pieces).toEqual(ps);
  });
});
