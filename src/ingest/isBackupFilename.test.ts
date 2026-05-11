import { describe, it, expect } from 'vitest';
import { isBackupFilename } from './isBackupFilename.js';

describe('isBackupFilename', () => {
  it('accepts well-formed Beacon backup filenames', () => {
    expect(isBackupFilename('202603170140_St Ives Cambridge u3abackup.xlsx')).toBe(true);
    expect(isBackupFilename('202101010000_anytown_u3abackup.xlsx')).toBe(true);
  });

  it('accepts when the date prefix is missing — parser will skip later with a reason', () => {
    expect(isBackupFilename('renamed u3abackup.xlsx')).toBe(true);
  });

  it('is case-insensitive on extension and sentinel', () => {
    expect(isBackupFilename('202603170140_acme U3ABACKUP.XLSX')).toBe(true);
  });

  it('rejects non-xlsx files', () => {
    expect(isBackupFilename('202603170140_acme u3abackup.txt')).toBe(false);
    expect(isBackupFilename('notes.xls')).toBe(false);
  });

  it('rejects xlsx files without the u3abackup sentinel', () => {
    expect(isBackupFilename('budget.xlsx')).toBe(false);
    expect(isBackupFilename('202603170140_summary.xlsx')).toBe(false);
  });
});
