import { useMemo, useRef } from 'react';
import { getAnalysis, getCategory } from '../analyses/registry.js';
import type { Snapshot } from '../state/types.js';
import AnalysisChart from './AnalysisChart.js';
import DataTable from './DataTable.js';
import DownloadBar from './DownloadBar.js';
import styles from './AnalysisPage.module.css';

interface Props {
  analysisId: string;
  snapshot: Snapshot;
  onBack: () => void;
}

export default function AnalysisPage({ analysisId, snapshot, onBack }: Props) {
  const analysis = getAnalysis(analysisId);
  const chartRef = useRef<HTMLDivElement>(null);

  const result = useMemo(
    () => (analysis ? analysis.run([snapshot]) : null),
    [analysis, snapshot],
  );

  if (!analysis || !result) {
    return (
      <div className={styles.page}>
        <button className={styles.backButton} onClick={onBack}>← Back</button>
        <p>Unknown analysis.</p>
      </div>
    );
  }

  const category = getCategory(analysis.categoryId);
  const filenameStem = `${snapshot.date}_${analysis.id}`;

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={onBack}>
        ← {category ? category.title : 'Back'}
      </button>
      <header className={styles.header}>
        <h2 className={styles.title}>{analysis.title}</h2>
        <p className={styles.description}>{analysis.description}</p>
        <p className={styles.scope}>
          {(analysis.scope ?? 'current') === 'current'
            ? 'Current members only (status = Current or Honorary).'
            : 'All members (including lapsed, resigned, deceased).'}
        </p>
      </header>

      <section className={styles.chartSection}>
        <AnalysisChart ref={chartRef} config={result.chart} rows={result.rows} />
      </section>

      <DownloadBar
        filenameStem={filenameStem}
        columns={result.columns}
        rows={result.rows}
        chartRef={chartRef}
      />

      <section className={styles.tableSection}>
        <DataTable columns={result.columns} rows={result.rows} />
      </section>
    </div>
  );
}
