import { describe, it, expect } from 'vitest';
import {
  zString,
  zStringNullable,
  zInt,
  zBool,
  zDate,
  zDateNullable,
  zDecimal,
} from './_coerce.js';

describe('zString', () => {
  it('trims and accepts non-empty strings', () => {
    expect(zString.parse('  hello  ')).toBe('hello');
  });
  it('rejects empty / null / whitespace-only', () => {
    expect(zString.safeParse('').success).toBe(false);
    expect(zString.safeParse(null).success).toBe(false);
    expect(zString.safeParse('   ').success).toBe(false);
  });
});

describe('zStringNullable', () => {
  it('returns null for empty / null / whitespace-only', () => {
    expect(zStringNullable.parse('')).toBeNull();
    expect(zStringNullable.parse(null)).toBeNull();
    expect(zStringNullable.parse('   ')).toBeNull();
  });
  it('passes through trimmed non-empty strings', () => {
    expect(zStringNullable.parse('  hi  ')).toBe('hi');
  });
});

describe('zInt', () => {
  it('coerces numeric strings', () => {
    expect(zInt.parse('42')).toBe(42);
  });
  it('truncates floats to integers', () => {
    expect(zInt.parse(42.7)).toBe(42);
  });
  it('rejects non-numeric strings', () => {
    expect(zInt.safeParse('not-a-number').success).toBe(false);
  });
});

describe('zDecimal', () => {
  it('parses numeric strings to numbers', () => {
    expect(zDecimal.parse('12.5')).toBe(12.5);
  });
  it('preserves negative values (relevant for Ledger.amount)', () => {
    expect(zDecimal.parse('-3.25')).toBe(-3.25);
  });
});

describe('zBool', () => {
  it('treats 1 / "1" / true / "true" as true', () => {
    expect(zBool.parse(1)).toBe(true);
    expect(zBool.parse('1')).toBe(true);
    expect(zBool.parse(true)).toBe(true);
    expect(zBool.parse('TRUE')).toBe(true);
  });
  it('treats other values as false', () => {
    expect(zBool.parse(0)).toBe(false);
    expect(zBool.parse('no')).toBe(false);
    expect(zBool.parse(null)).toBe(false);
  });
});

describe('zDate / zDateNullable', () => {
  it('passes through ISO YYYY-MM-DD', () => {
    expect(zDate.parse('2026-03-31')).toBe('2026-03-31');
  });
  it('parses UK DD/MM/YYYY', () => {
    expect(zDate.parse('31/03/2026')).toBe('2026-03-31');
  });
  it('parses Excel Date objects', () => {
    expect(zDate.parse(new Date('2026-03-31T00:00:00Z'))).toBe('2026-03-31');
  });
  it('returns null for empty in nullable variant', () => {
    expect(zDateNullable.parse('')).toBeNull();
    expect(zDateNullable.parse(null)).toBeNull();
  });
  it('rejects garbage in non-nullable variant', () => {
    expect(zDate.safeParse('not-a-date').success).toBe(false);
  });
});
