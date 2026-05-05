import { useState } from 'react';
import type { Snapshot } from '../state/types.js';
import { formatBackupDateTime } from '../ingest/parseFilename.js';
import FileDropzone from './FileDropzone.js';
import ValidationDetails from './ValidationDetails.js';
import styles from './SnapshotList.module.css';

interface Props {
  snapshots: Snapshot[];
  onAddFile: (file: File) => void;
  onRemove: (filename: string) => void;
  onClearAll: () => void;
}

export default function SnapshotList({
  snapshots,
  onAddFile,
  onRemove,
  onClearAll,
}: Props) {
  const [errorsForFilename, setErrorsForFilename] = useState<string | null>(null);
  const errorsSnapshot = snapshots.find((s) => s.filename === errorsForFilename);

  const canonical = snapshots.find((s) => s.u3aName)?.u3aName ?? null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>
            {snapshots.length === 1
              ? '1 backup loaded'
              : `${snapshots.length} backups loaded`}
          </h2>
          {canonical && <p className={styles.u3a}>{canonical}</p>}
        </div>
        <button
          type="button"
          className={styles.clearButton}
          onClick={onClearAll}
        >
          Clear all
        </button>
      </div>

      <ul className={styles.list}>
        {snapshots.map((s) => (
          <li key={s.filename} className={styles.row}>
            <div className={styles.rowMain}>
              <div className={styles.rowDate}>
                {formatBackupDateTime(s.date, s.time)}
              </div>
              <div className={styles.rowFilename}>{s.filename}</div>
              <div className={styles.rowMeta}>
                <span>{s.backup.members.length} members</span>
                <span>{s.backup.groups.length} groups</span>
                {s.errors.length > 0 ? (
                  <button
                    type="button"
                    className={styles.errorsButton}
                    onClick={() => setErrorsForFilename(s.filename)}
                  >
                    ⚠ {s.errors.length} validation issue
                    {s.errors.length === 1 ? '' : 's'}
                  </button>
                ) : (
                  <span className={styles.clean}>✓ clean</span>
                )}
              </div>
            </div>
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => onRemove(s.filename)}
              aria-label={`Remove ${s.filename}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.add}>
        <FileDropzone onFileSelected={onAddFile} />
      </div>

      {errorsSnapshot && (
        <ValidationDetails
          errors={errorsSnapshot.errors}
          onClose={() => setErrorsForFilename(null)}
        />
      )}
    </div>
  );
}
