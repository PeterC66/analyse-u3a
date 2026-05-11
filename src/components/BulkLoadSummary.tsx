import styles from './BulkLoad.module.css';

export interface BulkLoadResult {
  loaded: string[];
  replaced: string[];
  skippedNoDate: string[];
  skippedMismatch: { filename: string; u3aName: string | null }[];
  failed: { filename: string; message: string }[];
}

interface Props {
  result: BulkLoadResult;
  onClose: () => void;
}

function Section({
  title,
  items,
}: {
  title: string;
  items: React.ReactNode[];
}) {
  if (items.length === 0) return null;
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {title} ({items.length})
      </h3>
      <ul className={styles.list}>
        {items.slice(0, 12).map((node, i) => (
          <li key={i}>{node}</li>
        ))}
        {items.length > 12 && (
          <li className={styles.more}>…and {items.length - 12} more</li>
        )}
      </ul>
    </div>
  );
}

export default function BulkLoadSummary({ result, onClose }: Props) {
  const { loaded, replaced, skippedNoDate, skippedMismatch, failed } = result;
  const total =
    loaded.length +
    replaced.length +
    skippedNoDate.length +
    skippedMismatch.length +
    failed.length;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Bulk load finished</h2>
        <p className={styles.message}>
          Processed {total} file{total === 1 ? '' : 's'}.
        </p>

        <Section
          title="Loaded"
          items={loaded.map((f) => (
            <code>{f}</code>
          ))}
        />
        <Section
          title="Replaced existing snapshot"
          items={replaced.map((f) => (
            <code>{f}</code>
          ))}
        />
        <Section
          title="Skipped — filename has no date prefix"
          items={skippedNoDate.map((f) => (
            <code>{f}</code>
          ))}
        />
        <Section
          title="Skipped — different u3a tag"
          items={skippedMismatch.map((m) => (
            <>
              <code>{m.filename}</code>
              {' — '}
              {m.u3aName ?? <em>no u3a tag</em>}
            </>
          ))}
        />
        <Section
          title="Failed to parse"
          items={failed.map((f) => (
            <>
              <code>{f.filename}</code> — {f.message}
            </>
          ))}
        />

        <div className={styles.buttons}>
          <button type="button" className={styles.primary} onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
