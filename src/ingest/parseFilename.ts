/**
 * Extract backup date and time from filename pattern YYYYMMDDHHMM_*.xlsx
 * Returns { date: 'YYYY-MM-DD', time: 'HH:MM' } or null if no match.
 */
export function parseBackupFilename(
  filename: string,
): { date: string; time: string } | null {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})_/.exec(filename);
  if (!m) return null;

  const [, y, mo, d, h, mi] = m;
  const dateStr = `${y}-${mo}-${d}`;
  const timeStr = `${h}:${mi}`;

  // Validate it's a real date (at least roughly).
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(dt.getTime())) return null;

  return { date: dateStr, time: timeStr };
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
