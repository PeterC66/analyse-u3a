import type { BeaconBackup } from '../../schemas/zod/index.js';

/**
 * A single Beacon backup snapshot with its metadata. The app holds a
 * `Snapshot[]` (sorted by date+time, deduped by instant) so trend / churn
 * analyses can run across multiple backups of the same u3a.
 *
 * `u3aName` is extracted from the filename's ` u3abackup` sentinel; it's
 * null when the file has been renamed and the sentinel is missing.
 *
 * `errors` are the row-level validation errors collected while parsing
 * this snapshot. They live with the snapshot so removing a snapshot also
 * removes its errors.
 */
export interface Snapshot {
  backup: BeaconBackup;
  filename: string;
  date: string;
  time: string;
  u3aName: string | null;
  errors: ValidationError[];
}

export interface ValidationError {
  sheet: string;
  rowIndex: number;
  message: string;
}
