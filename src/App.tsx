import { useState } from 'react';
import FileDropzone from './components/FileDropzone.js';
import ManualDatePrompt from './components/ManualDatePrompt.js';
import SummaryPanel from './components/SummaryPanel.js';
import AnalysisMenu from './components/AnalysisMenu.js';
import CategoryPage from './components/CategoryPage.js';
import AnalysisPage from './components/AnalysisPage.js';
import { parseBackupFilename } from './ingest/parseFilename.js';
import { loadBackup } from './ingest/loadBackup.js';
import { getAnalysis } from './analyses/registry.js';
import type { Snapshot, ValidationError } from './state/types.js';
import releaseMessage from '../docs/message.json' with { type: 'json' };
import styles from './App.module.css';

type State = 'idle' | 'loading' | 'date-prompt' | 'loaded' | 'error';
type View =
  | { kind: 'menu' }
  | { kind: 'category'; categoryId: string }
  | { kind: 'analysis'; analysisId: string };

export default function App() {
  const [state, setState] = useState<State>('idle');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [view, setView] = useState<View>({ kind: 'menu' });

  // Temp state for non-conforming filenames
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelected = async (file: File) => {
    setState('loading');
    setErrorMessage(null);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const parsed = parseBackupFilename(file.name);
      if (!parsed) {
        // Filename doesn't conform; prompt user for date
        setPendingFile(file);
        setState('date-prompt');
        return;
      }

      // Filename conforms; proceed with load
      await loadAndSetSnapshot(file, arrayBuffer, parsed.date, parsed.time);
    } catch (err) {
      setState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load backup file',
      );
    }
  };

  const handleManualDateSubmit = async (date: string, time: string) => {
    if (!pendingFile) return;

    try {
      setState('loading');
      const arrayBuffer = await pendingFile.arrayBuffer();
      await loadAndSetSnapshot(pendingFile, arrayBuffer, date, time);
    } catch (err) {
      setState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load backup file',
      );
    }
  };

  const handleDatePromptCancel = () => {
    setPendingFile(null);
    setState('idle');
  };

  const loadAndSetSnapshot = async (
    file: File,
    arrayBuffer: ArrayBuffer,
    date: string,
    time: string,
  ) => {
    const { backup, errors } = await loadBackup(arrayBuffer);
    const snap: Snapshot = {
      backup,
      filename: file.name,
      date,
      time,
    };
    setSnapshot(snap);
    setValidationErrors(errors);
    setPendingFile(null);
    setView({ kind: 'menu' });
    setState('loaded');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Analyse u3a</h1>
        <p className={styles.subtitle}>
          Local analysis tool for Beacon membership backups
        </p>
        {releaseMessage.message && (
          <p className={styles.releaseMessage}>{releaseMessage.message}</p>
        )}
      </header>

      <main className={styles.main}>
        {state === 'idle' && (
          <FileDropzone onFileSelected={handleFileSelected} />
        )}

        {state === 'loading' && (
          <div className={styles.loading}>
            <p>Loading and validating backup...</p>
            <div className={styles.spinner}></div>
          </div>
        )}

        {state === 'date-prompt' && pendingFile && (
          <ManualDatePrompt
            filename={pendingFile.name}
            onSubmit={handleManualDateSubmit}
            onCancel={handleDatePromptCancel}
          />
        )}

        {state === 'loaded' && snapshot && (
          <div className={styles.loadedContent}>
            {view.kind === 'menu' && (
              <>
                <SummaryPanel snapshot={snapshot} validationErrors={validationErrors} />
                <AnalysisMenu
                  onSelectCategory={(categoryId) => setView({ kind: 'category', categoryId })}
                />
              </>
            )}

            {view.kind === 'category' && (
              <CategoryPage
                categoryId={view.categoryId}
                onBack={() => setView({ kind: 'menu' })}
                onSelectAnalysis={(analysisId) => setView({ kind: 'analysis', analysisId })}
              />
            )}

            {view.kind === 'analysis' && (
              <AnalysisPage
                analysisId={view.analysisId}
                snapshot={snapshot}
                onBack={() => {
                  const parent = getAnalysis(view.analysisId)?.categoryId;
                  setView(parent ? { kind: 'category', categoryId: parent } : { kind: 'menu' });
                }}
              />
            )}
          </div>
        )}

        {state === 'error' && (
          <div className={styles.error}>
            <h2>Error Loading Backup</h2>
            <p>{errorMessage}</p>
            <button
              className={styles.errorButton}
              onClick={() => {
                setState('idle');
                setErrorMessage(null);
                setPendingFile(null);
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <span className={styles.version}>v{__APP_VERSION__}</span>
      </footer>
    </div>
  );
}
