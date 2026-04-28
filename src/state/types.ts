import type { BeaconBackup } from '../../schemas/zod/index.js';

/**
 * A single Beacon backup snapshot with its metadata.
 * In multi-file mode, app state holds Snapshot[].
 * Currently single-file mode uses Snapshot | null.
 */
export interface Snapshot {
  backup: BeaconBackup;
  filename: string;
  date: string;
  time: string;
}

/**
 * A single row-level validation error collected during ingestion.
 */
export interface ValidationError {
  sheet: string;
  rowIndex: number;
  message: string;
}
