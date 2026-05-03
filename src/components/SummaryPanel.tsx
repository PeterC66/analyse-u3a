import { useState } from 'react';
import type { Snapshot, ValidationError } from '../state/types.js';
import ValidationDetails from './ValidationDetails.js';
import styles from './SummaryPanel.module.css';

interface Props {
  snapshot: Snapshot;
  validationErrors: ValidationError[];
  onReload: () => void;
}

export default function SummaryPanel({ snapshot, validationErrors, onReload }: Props) {
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  const { backup, filename, date, time } = snapshot;

  const memberCount = backup.members.length;
  const groupCount = backup.groups.length;
  const facultyCount = backup.faculties.length;
  const transactionCount = backup.detail.length;
  const calendarCount = backup.calendar.length;

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dt = new Date(`${date}T${time}:00`);
  const formattedDate = dateFormatter.format(dt);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Backup Loaded</h2>
          <p className={styles.filename}>{filename}</p>
        </div>
        <button
          type="button"
          className={styles.reloadButton}
          onClick={onReload}
        >
          Load another backup…
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.dateSection}>
          <div className={styles.dateLabel}>Backup Date & Time</div>
          <div className={styles.dateValue}>
            {formattedDate} at {time}
          </div>
        </div>

        <div className={styles.countsSection}>
          <h3 className={styles.countsTitle}>Summary</h3>
          <div className={styles.countsGrid}>
            <div className={styles.count}>
              <div className={styles.countValue}>{memberCount}</div>
              <div className={styles.countLabel}>Members</div>
            </div>
            <div className={styles.count}>
              <div className={styles.countValue}>{groupCount}</div>
              <div className={styles.countLabel}>Groups</div>
            </div>
            <div className={styles.count}>
              <div className={styles.countValue}>{facultyCount}</div>
              <div className={styles.countLabel}>Faculties</div>
            </div>
            <div className={styles.count}>
              <div className={styles.countValue}>{transactionCount}</div>
              <div className={styles.countLabel}>Transactions</div>
            </div>
            <div className={styles.count}>
              <div className={styles.countValue}>{calendarCount}</div>
              <div className={styles.countLabel}>Calendar Events</div>
            </div>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className={styles.warningSection}>
            <div className={styles.warningTitle}>⚠️ Validation Issues</div>
            <p className={styles.warningMessage}>
              {validationErrors.length} row(s) could not be parsed and were skipped.
              Analyses will run on valid data only.
            </p>
            <button
              className={styles.detailsButton}
              onClick={() => setShowValidationDetails(true)}
            >
              View Details
            </button>
          </div>
        )}

        {validationErrors.length === 0 && (
          <div className={styles.successSection}>
            ✓ All sheets loaded cleanly
          </div>
        )}
      </div>

      {showValidationDetails && (
        <ValidationDetails
          errors={validationErrors}
          onClose={() => setShowValidationDetails(false)}
        />
      )}
    </div>
  );
}
