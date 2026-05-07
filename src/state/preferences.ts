/**
 * Per-u3a, locally-persisted preferences. Currently just the prefix list
 * used to exclude non-real "groups" (outings, theatre trips, proposed
 * groups) from group analyses.
 *
 * Persistence is `localStorage` only and contains *no member data* —
 * just user-typed prefix strings about group naming conventions, keyed
 * by a normalised u3a name. See CLAUDE.md "Privacy invariants".
 */

const STORAGE_KEY = 'analyse-u3a:prefs:v1';
const UNKNOWN_KEY = '__unknown__';

interface U3aPrefs {
  excludedGroupPrefixes: string[];
}

type PrefsByU3a = Record<string, U3aPrefs>;

function normaliseKey(u3aName: string | null): string {
  if (!u3aName) return UNKNOWN_KEY;
  const trimmed = u3aName.trim().toLowerCase();
  return trimmed.length === 0 ? UNKNOWN_KEY : trimmed;
}

function readAll(): PrefsByU3a {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as PrefsByU3a;
    }
    return {};
  } catch {
    return {};
  }
}

function writeAll(prefs: PrefsByU3a): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage may be disabled or quota exceeded — silently ignore.
  }
}

export function loadExcludedPrefixes(u3aName: string | null): string[] {
  const all = readAll();
  const entry = all[normaliseKey(u3aName)];
  if (!entry || !Array.isArray(entry.excludedGroupPrefixes)) return [];
  return entry.excludedGroupPrefixes.filter(
    (p): p is string => typeof p === 'string' && p.trim().length > 0,
  );
}

export function saveExcludedPrefixes(
  u3aName: string | null,
  prefixes: string[],
): void {
  const cleaned = prefixes
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const all = readAll();
  all[normaliseKey(u3aName)] = { excludedGroupPrefixes: cleaned };
  writeAll(all);
}
