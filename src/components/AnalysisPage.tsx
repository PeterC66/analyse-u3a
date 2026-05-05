import { useMemo, useRef } from 'react';
import { getAnalysis, getCategory } from '../analyses/registry.js';
import type { Snapshot } from '../state/types.js';
import { formatBackupDateTime } from '../ingest/parseFilename.js';
import AnalysisChart from './AnalysisChart.js';
import DataTable from './DataTable.js';
import DownloadBar from './DownloadBar.js';
import styles from './AnalysisPage.module.css';

interface Props {
  analysisId: string;
  snapshots: Snapshot[];
  onBack: () => void;
}

export default function AnalysisPage({ analysisId, snapshots, onBack }: Props) {
  const analysis = getAnalysis(analysisId);
  const chartRef = useRef<HTMLDivElement>(null);

  const mode = analysis?.snapshots ?? 'latest';
  const input = useMemo<Snapshot[]>(() => {
    if (snapshots.length === 0) return [];
    return mode === 'latest' ? snapshots.slice(-1) : snapshots;
  }, [snapshots, mode]);

  const needsMultiple = mode !== 'latest' && snapshots.length < 2;

  const result = useMemo(
    () => (analysis && !needsMultiple && input.length > 0 ? analysis.run(input) : null),
    [analysis, input, needsMultiple],
  );

  if (!analysis) {
    return (
      <div className={styles.page}>
        <button className={styles.backButton} onClick={onBack}>← Back</button>
        <p>Unknown analysis.</p>
      </div>
    );
  }

  const category = getCategory(analysis.categoryId);
  const latest = snapshots[snapshots.length - 1];
  const earliest = snapshots[0];
  const filenameStem = latest ? `${latest.date}_${analysis.id}` : analysis.id;

  const coverage =
    mode === 'latest' && latest
      ? `As of ${formatBackupDateTime(latest.date, latest.time)}.`
      : earliest && latest
        ? `Covers ${snapshots.length} snapshot${snapshots.length === 1 ? '' : 's'} from ${earliest.date} to ${latest.date}.`
        : '';

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
        {coverage && <p className={styles.scope}>{coverage}</p>}
      </header>

      {needsMultiple ? (
        <section className={styles.empty}>
          <p>
            This analysis needs at least 2 snapshots. Load another backup to see
            it.
          </p>
        </section>
      ) : result ? (
        <>
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
        </>
      ) : (
        <p>No data.</p>
      )}
    </div>
  );
}
