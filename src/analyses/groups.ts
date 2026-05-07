import type { GroupRow } from '../../schemas/zod/index.js';

export function isRealGroup(g: GroupRow, excludedPrefixes: string[]): boolean {
  if (excludedPrefixes.length === 0) return true;
  const name = g.group_name.toLowerCase();
  return !excludedPrefixes.some((p) => {
    const pref = p.trim().toLowerCase();
    return pref.length > 0 && name.startsWith(pref);
  });
}

export function realGroups(
  groups: GroupRow[],
  excludedPrefixes: string[],
): GroupRow[] {
  return groups.filter((g) => isRealGroup(g, excludedPrefixes));
}
