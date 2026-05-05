import styles from './ConfirmU3aPrompt.module.css';

interface Props {
  filename: string;
  loadedU3a: string | null;
  newU3a: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmU3aPrompt({
  filename,
  loadedU3a,
  newU3a,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Same u3a?</h2>
        <p className={styles.message}>
          The u3a name in <code>{filename}</code> doesn't match the snapshots
          already loaded.
        </p>

        <dl className={styles.compare}>
          <dt>Already loaded</dt>
          <dd>{loadedU3a ?? <em>unknown — filename had no u3a tag</em>}</dd>
          <dt>New file</dt>
          <dd>{newU3a ?? <em>unknown — filename had no u3a tag</em>}</dd>
        </dl>

        <p className={styles.note}>
          If these really are the same u3a (e.g. the file was renamed), confirm
          to load it. Otherwise cancel — analyses must run against backups for
          a single u3a.
        </p>

        <div className={styles.buttons}>
          <button type="button" className={styles.primary} onClick={onConfirm}>
            Confirm — same u3a
          </button>
          <button type="button" className={styles.secondary} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
