import styles from './BulkLoad.module.css';

interface Props {
  current: number;
  total: number;
  currentFilename: string;
}

export default function BulkLoadProgress({ current, total, currentFilename }: Props) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Loading backups</h2>
        <p className={styles.message}>
          Loading {current} of {total}
        </p>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
        <p className={styles.filename}>{currentFilename}</p>
      </div>
    </div>
  );
}
