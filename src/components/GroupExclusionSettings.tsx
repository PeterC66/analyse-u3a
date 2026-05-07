import { useMemo, useState } from 'react';
import type { GroupRow } from '../../schemas/zod/index.js';
import { isRealGroup } from '../analyses/groups.js';
import styles from './GroupExclusionSettings.module.css';

interface Props {
  groups: GroupRow[];
  prefixes: string[];
  onChange: (prefixes: string[]) => void;
}

function parsePrefixes(text: string): string[] {
  return text
    .split(/[,\n]/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export default function GroupExclusionSettings({
  groups,
  prefixes,
  onChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(prefixes.join(', '));

  const draftPrefixes = useMemo(() => parsePrefixes(draft), [draft]);
  const dirty = useMemo(() => {
    if (draftPrefixes.length !== prefixes.length) return true;
    return draftPrefixes.some((p, i) => p !== prefixes[i]);
  }, [draftPrefixes, prefixes]);

  const excludedFromDraft = useMemo(
    () => groups.filter((g) => !isRealGroup(g, draftPrefixes)),
    [groups, draftPrefixes],
  );
  const excludedFromSaved = useMemo(
    () => groups.filter((g) => !isRealGroup(g, prefixes)),
    [groups, prefixes],
  );

  const handleSave = () => {
    onChange(draftPrefixes);
  };

  const handleReset = () => {
    setDraft(prefixes.join(', '));
  };

  const handleClear = () => {
    setDraft('');
    onChange([]);
  };

  const summary =
    prefixes.length === 0
      ? 'No group exclusions — all groups are included in group reporting.'
      : `${prefixes.length} prefix${prefixes.length === 1 ? '' : 'es'} excluding ${excludedFromSaved.length} of ${groups.length} groups.`;

  return (
    <div className={styles.panel}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className={styles.headerText}>
          <span className={styles.title}>Group exclusions</span>
          <span className={styles.summary}>{summary}</span>
        </span>
        <span className={styles.chevron} aria-hidden="true">
          {expanded ? '▾' : '▸'}
        </span>
      </button>

      {expanded && (
        <div className={styles.body}>
          <p className={styles.help}>
            Some entries in the Groups sheet aren't real interest groups —
            for example outings, theatre trips, or proposed groups. List
            the name prefixes (case-insensitive) you want excluded from
            group analyses, separated by commas or new lines.
          </p>

          <textarea
            className={styles.input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Outing, Theatres, Events, POSS"
            rows={3}
            spellCheck={false}
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={handleSave}
              disabled={!dirty}
            >
              Save
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={handleReset}
              disabled={!dirty}
            >
              Reset
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={handleClear}
              disabled={prefixes.length === 0 && draft.trim().length === 0}
            >
              Clear all
            </button>
          </div>

          <div className={styles.preview}>
            <h4 className={styles.previewTitle}>
              {dirty ? 'Preview — would exclude' : 'Currently excluding'} (
              {excludedFromDraft.length} of {groups.length})
            </h4>
            {excludedFromDraft.length === 0 ? (
              <p className={styles.previewEmpty}>No groups match these prefixes.</p>
            ) : (
              <ul className={styles.previewList}>
                {excludedFromDraft
                  .slice()
                  .sort((a, b) => a.group_name.localeCompare(b.group_name))
                  .map((g) => (
                    <li key={g.gkey}>{g.group_name}</li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
