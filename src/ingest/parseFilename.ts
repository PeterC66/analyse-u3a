/**
 * Extract backup date, time, and u3a name from a Beacon backup filename.
 *
 * Beacon's exporter uses `YYYYMMDDHHMM_<u3a name> u3abackup.xlsx` (the
 * trailing ` u3abackup` sentinel is sometimes underscore-separated and the
 * casing varies). The u3a name is only returned when the sentinel is
 * present — if the user has renamed the file we leave it null rather than
 * guessing, so the same-u3a check stays trustworthy.
 *
 * Returns null if the timestamp prefix is missing or invalid.
 */
export function parseBackupFilename(
  filename: string,
): { date: string; time: string; u3aName: string | null } | null {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})_/.exec(filename);
  if (!m) return null;

  const [prefix, y, mo, d, h, mi] = m;
  const dateStr = `${y}-${mo}-${d}`;
  const timeStr = `${h}:${mi}`;

  const dt = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(dt.getTime())) return null;

  const rest = filename.slice(prefix.length).replace(/\.xlsx$/i, '');
  const u3aMatch = /^(.+?)[ _]u3abackup$/i.exec(rest);
  const u3aName = u3aMatch ? u3aMatch[1].trim() || null : null;

  return { date: dateStr, time: timeStr, u3aName };
}

/**
 * Format a date string (YYYY-MM-DD) and time string (HH:MM) as human-readable text.
 * Output: "31 March 2026, 19:30"
 */
export function formatBackupDateTime(date: string, time: string): string {
  const [y, mo, d] = date.split('-');
  const dt = new Date(`${date}T${time}:00`);
  const formatter = new Intl.DateTimeFormat('en-GB', {
    weekday: undefined,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dateFormatted = formatter.format(dt);
  return `${dateFormatted}, ${time}`;
}
