import type { ValidationError } from '../state/types.js';
import styles from './ValidationDetails.module.css';

interface Props {
  errors: ValidationError[];
  onClose: () => void;
}

export default function ValidationDetails({ errors, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Validation Errors</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.summary}>
            {errors.length} row(s) could not be parsed:
          </p>

          <div className={styles.list}>
            {errors.map((error, idx) => (
              <div key={idx} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.sheet}>{error.sheet}</span>
                  <span className={styles.row}>Row {error.rowIndex}</span>
                </div>
                <p className={styles.message}>{error.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.button} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
