import { describe, it, expect } from 'vitest';
import { partitionByFilename } from './bulkLoad.js';

function fakeFile(name: string): File {
  return new File([''], name, { type: 'application/octet-stream' });
}

describe('partitionByFilename', () => {
  it('keeps files with a YYYYMMDDHHMM_ prefix', () => {
    const files = [
      fakeFile('202603170140_acme u3abackup.xlsx'),
      fakeFile('202105011200_acme u3abackup.xlsx'),
    ];
    const { parsed, skippedNoDate } = partitionByFilename(files);
    expect(parsed).toHaveLength(2);
    expect(skippedNoDate).toEqual([]);
    expect(parsed[0]).toMatchObject({ date: '2026-03-17', time: '01:40', u3aName: 'acme' });
  });

  it('skips files without a date prefix and reports them by name', () => {
    const files = [
      fakeFile('202603170140_acme u3abackup.xlsx'),
      fakeFile('renamed u3abackup.xlsx'),
    ];
    const { parsed, skippedNoDate } = partitionByFilename(files);
    expect(parsed).toHaveLength(1);
    expect(skippedNoDate).toEqual(['renamed u3abackup.xlsx']);
  });

  it('returns u3aName=null when the sentinel is absent', () => {
    const files = [fakeFile('202603170140_something-else.xlsx')];
    const { parsed } = partitionByFilename(files);
    expect(parsed[0].u3aName).toBeNull();
  });
});
