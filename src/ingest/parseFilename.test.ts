import { describe, it, expect } from 'vitest';
import { parseBackupFilename, formatBackupDateTime } from './parseFilename.js';

describe('parseBackupFilename', () => {
  it('extracts date and time from a well-formed filename', () => {
    expect(parseBackupFilename('202603311930_backup.xlsx')).toEqual({
      date: '2026-03-31',
      time: '19:30',
    });
  });

  it('accepts any prefix shape after the underscore', () => {
    expect(parseBackupFilename('202101010000_anything-goes_here.xlsx')).toEqual({
      date: '2021-01-01',
      time: '00:00',
    });
  });

  it('returns null when the timestamp prefix is missing or wrong length', () => {
    expect(parseBackupFilename('backup.xlsx')).toBeNull();
    expect(parseBackupFilename('20260331_backup.xlsx')).toBeNull();
    expect(parseBackupFilename('2026033119_backup.xlsx')).toBeNull();
  });

  it('returns null when there is no underscore separator', () => {
    expect(parseBackupFilename('202603311930backup.xlsx')).toBeNull();
  });

  it('returns null for an impossible date (month 13)', () => {
    expect(parseBackupFilename('202613311930_backup.xlsx')).toBeNull();
  });
});

describe('formatBackupDateTime', () => {
  it('formats as "DD Month YYYY, HH:MM"', () => {
    expect(formatBackupDateTime('2026-03-31', '19:30')).toBe('31 March 2026, 19:30');
  });
});
