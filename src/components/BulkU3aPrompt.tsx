import styles from './BulkLoad.module.css';

interface Props {
  loadedU3a: string | null;
  mismatches: { filename: string; u3aName: string | null }[];
  onLoadAll: () => void;
  onSkipMismatches: () => void;
  onCancel: () => void;
}

export default function BulkU3aPrompt({
  loadedU3a,
  mismatches,
  onLoadAll,
  onSkipMismatches,
  onCancel,
}: Props) {
  const expected = loadedU3a ?? '(unknown — no loaded snapshot has a u3a tag)';
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>
          {mismatches.length === 1
            ? '1 file is tagged for a different u3a'
            : `${mismatches.length} files are tagged for a different u3a`}
        </h2>
        <p className={styles.message}>
          Expected u3a: <strong>{expected}</strong>
        </p>
        <ul className={styles.list}>
          {mismatches.slice(0, 8).map((m) => (
            <li key={m.filename}>
              <code>{m.filename}</code>
              {' — '}
              {m.u3aName ?? <em>no u3a tag</em>}
            </li>
          ))}
          {mismatches.length > 8 && (
            <li className={styles.more}>
              …and {mismatches.length - 8} more
            </li>
          )}
        </ul>
        <p className={styles.note}>
          Load them anyway only if you're sure these are the same u3a (e.g. the
          files were renamed). Analyses must run against a single u3a.
        </p>
        <div className={styles.buttons}>
          <button type="button" className={styles.primary} onClick={onLoadAll}>
            Load all
          </button>
          <button type="button" className={styles.secondary} onClick={onSkipMismatches}>
            Skip mismatches
          </button>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
