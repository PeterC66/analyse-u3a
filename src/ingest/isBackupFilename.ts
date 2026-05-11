/**
 * Recognise a Beacon backup filename by the trailing ` u3abackup.xlsx` (or
 * `_u3abackup.xlsx`) sentinel. Used to filter folder loads / multi-file
 * drops to just the files that look like Beacon exports — anything else
 * in the folder (year summaries, ad-hoc spreadsheets) is silently skipped.
 *
 * The companion `parseBackupFilename` is stricter (also requires the
 * `YYYYMMDDHHMM_` date prefix); this predicate is intentionally lenient so
 * renamed-but-still-tagged backups still appear and reach the bulk-load
 * "no date prefix" skip pile, where the user is told why they were left
 * out.
 */
export function isBackupFilename(name: string): boolean {
  if (!/\.xlsx$/i.test(name)) return false;
  const base = name.replace(/\.xlsx$/i, '');
  return /[ _]u3abackup$/i.test(base);
}
