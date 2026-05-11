import { loadBackup } from './loadBackup.js';
import { parseBackupFilename } from './parseFilename.js';
import type { Snapshot } from '../state/types.js';

export interface ParsedBulkFile {
  file: File;
  date: string;
  time: string;
  u3aName: string | null;
}

/**
 * Split a list of selected files into well-formed entries (date prefix
 * present) and entries skipped because the filename had no parseable
 * date. The bulk loader uses the well-formed list as its work queue;
 * the skipped list is reported in the end-of-load summary so the user
 * can rename or load those files individually.
 */
export function partitionByFilename(files: File[]): {
  parsed: ParsedBulkFile[];
  skippedNoDate: string[];
} {
  const parsed: ParsedBulkFile[] = [];
  const skippedNoDate: string[] = [];
  for (const file of files) {
    const p = parseBackupFilename(file.name);
    if (!p) {
      skippedNoDate.push(file.name);
      continue;
    }
    parsed.push({ file, date: p.date, time: p.time, u3aName: p.u3aName });
  }
  return { parsed, skippedNoDate };
}

export interface BulkLoadOutcome {
  snapshots: Snapshot[];
  loaded: string[];
  replaced: string[];
  failed: { filename: string; message: string }[];
}

/**
 * Parse and validate each file in `toLoad`, in order. Calls `onProgress`
 * before each file so the UI can render a progress bar. Dedupes against
 * `initial` by `(date, time)` — a re-loaded backup replaces the prior
 * snapshot at the same instant rather than producing a duplicate. The
 * returned `snapshots` list is sorted oldest → newest.
 *
 * Per-file failures are caught and recorded in `failed`; the rest of
 * the queue continues to load. Only true I/O / structural errors land
 * here (row-level validation issues are stored on the snapshot itself).
 */
export async function runBulkLoad(
  toLoad: ParsedBulkFile[],
  initial: Snapshot[],
  onProgress: (current: number, total: number, currentFilename: string) => void,
): Promise<BulkLoadOutcome> {
  const loaded: string[] = [];
  const replaced: string[] = [];
  const failed: { filename: string; message: string }[] = [];
  let snapshots = [...initial];

  for (let i = 0; i < toLoad.length; i++) {
    const { file, date, time, u3aName } = toLoad[i];
    onProgress(i + 1, toLoad.length, file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { backup, errors } = await loadBackup(arrayBuffer);
      const snap: Snapshot = {
        backup,
        filename: file.name,
        date,
        time,
        u3aName,
        errors,
      };
      const conflict = snapshots.find(
        (s) => s.date === snap.date && s.time === snap.time,
      );
      if (conflict) replaced.push(conflict.filename);
      snapshots = snapshots.filter(
        (s) => !(s.date === snap.date && s.time === snap.time),
      );
      snapshots.push(snap);
      loaded.push(file.name);
    } catch (err) {
      failed.push({
        filename: file.name,
        message: err instanceof Error ? err.message : 'Failed to load',
      });
    }
  }

  snapshots.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    if (a.time !== b.time) return a.time < b.time ? -1 : 1;
    return 0;
  });

  return { snapshots, loaded, replaced, failed };
}
