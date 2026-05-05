import { describe, it, expect } from 'vitest';
import { parseBackupFilename, formatBackupDateTime } from './parseFilename.js';

describe('parseBackupFilename', () => {
  it('extracts date and time from a well-formed filename', () => {
    expect(parseBackupFilename('202603311930_backup.xlsx')).toEqual({
      date: '2026-03-31',
      time: '19:30',
      u3aName: null,
    });
  });

  it('accepts any prefix shape after the underscore', () => {
    expect(parseBackupFilename('202101010000_anything-goes_here.xlsx')).toEqual({
      date: '2021-01-01',
      time: '00:00',
      u3aName: null,
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

  it('extracts the u3a name when the " u3abackup" sentinel is present', () => {
    expect(
      parseBackupFilename('202603170140_St Ives Cambridge Demo24 u3abackup.xlsx'),
    ).toEqual({
      date: '2026-03-17',
      time: '01:40',
      u3aName: 'St Ives Cambridge Demo24',
    });
  });

  it('accepts an underscore between the name and the sentinel', () => {
    expect(parseBackupFilename('202101010000_My U3A_u3abackup.xlsx')).toEqual({
      date: '2021-01-01',
      time: '00:00',
      u3aName: 'My U3A',
    });
  });

  it('treats the sentinel case-insensitively', () => {
    expect(parseBackupFilename('202101010000_Foobar U3ABACKUP.XLSX')).toEqual({
      date: '2021-01-01',
      time: '00:00',
      u3aName: 'Foobar',
    });
  });

  it('returns null u3aName when the sentinel is missing', () => {
    expect(parseBackupFilename('202101010000_some-renamed-file.xlsx')).toEqual({
      date: '2021-01-01',
      time: '00:00',
      u3aName: null,
    });
  });
});

describe('formatBackupDateTime', () => {
  it('formats as "DD Month YYYY, HH:MM"', () => {
    expect(formatBackupDateTime('2026-03-31', '19:30')).toBe('31 March 2026, 19:30');
  });
});
