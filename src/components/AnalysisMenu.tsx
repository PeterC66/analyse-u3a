import { useState } from 'react';
import styles from './AnalysisMenu.module.css';

interface Analysis {
  id: string;
  title: string;
  description: string;
  notes?: string;
}

const ANALYSES: Analysis[] = [
  {
    id: 'membership-patterns',
    title: 'Membership Patterns',
    description: 'Member growth, decline, and demographics by class',
  },
  {
    id: 'group-popularity',
    title: 'Group Popularity',
    description: 'Group subscription levels, trends, and waitlists',
  },
  {
    id: 'attendance-patterns',
    title: 'Attendance Patterns',
    description: 'Inferred from group membership and calendar',
    notes: 'Note: Beacon does not record per-event attendance.',
  },
  {
    id: 'member-churn',
    title: 'Member Churn',
    description: 'Joiners, leavers, and lapsed renewals',
  },
  {
    id: 'renewal-payments',
    title: 'Renewal Payments',
    description: 'Income trends by year, class, and payment method',
  },
];

interface Props {
  onSelectAnalysis?: (analysisId: string) => void;
}

export default function AnalysisMenu({ onSelectAnalysis }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    setSelectedId(id);
    onSelectAnalysis?.(id);
  };

  return (
    <div className={styles.menu}>
      <div className={styles.header}>
        <h2 className={styles.title}>Select an Analysis</h2>
        <p className={styles.subtitle}>Choose what to explore in your backup data</p>
      </div>

      <div className={styles.grid}>
        {ANALYSES.map((analysis) => (
          <button
            key={analysis.id}
            className={`${styles.card} ${selectedId === analysis.id ? styles.selected : ''}`}
            onClick={() => handleClick(analysis.id)}
          >
            <h3 className={styles.cardTitle}>{analysis.title}</h3>
            <p className={styles.cardDescription}>{analysis.description}</p>
            {analysis.notes && <p className={styles.cardNotes}>{analysis.notes}</p>}
            <div className={styles.placeholder}>Coming Soon</div>
          </button>
        ))}
      </div>
    </div>
  );
}
