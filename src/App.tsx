import { useMemo, useState } from 'react';
import FileDropzone from './components/FileDropzone.js';
import ManualDatePrompt from './components/ManualDatePrompt.js';
import ConfirmU3aPrompt from './components/ConfirmU3aPrompt.js';
import BulkLoadProgress from './components/BulkLoadProgress.js';
import BulkU3aPrompt from './components/BulkU3aPrompt.js';
import BulkLoadSummary, {
  type BulkLoadResult,
} from './components/BulkLoadSummary.js';
import SnapshotList from './components/SnapshotList.js';
import SummaryPanel from './components/SummaryPanel.js';
import GroupExclusionSettings from './components/GroupExclusionSettings.js';
import AnalysisMenu from './components/AnalysisMenu.js';
import CategoryPage from './components/CategoryPage.js';
import AnalysisPage from './components/AnalysisPage.js';
import { parseBackupFilename } from './ingest/parseFilename.js';
import { loadBackup } from './ingest/loadBackup.js';
import {
  partitionByFilename,
  runBulkLoad,
  type ParsedBulkFile,
} from './ingest/bulkLoad.js';
import { getAnalysis } from './analyses/registry.js';
import {
  loadExcludedPrefixes,
  saveExcludedPrefixes,
} from './state/preferences.js';
import type { Snapshot } from './state/types.js';
import releaseMessage from '../docs/message.json' with { type: 'json' };
import styles from './App.module.css';

type State =
  | 'idle'
  | 'loading'
  | 'date-prompt'
  | 'u3a-prompt'
  | 'bulk-u3a-prompt'
  | 'bulk-loading'
  | 'bulk-summary'
  | 'loaded'
  | 'error';
type View =
  | { kind: 'menu' }
  | { kind: 'category'; categoryId: string }
  | { kind: 'analysis'; analysisId: string };

interface PendingLoad {
  file: File;
  date: string;
  time: string;
  u3aName: string | null;
}

interface PendingBulk {
  parsed: ParsedBulkFile[];
  skippedNoDate: string[];
  mismatches: ParsedBulkFile[];
  expectedU3a: string | null;
}

interface BulkProgress {
  current: number;
  total: number;
  currentFilename: string;
}

function compareSnapshots(a: Snapshot, b: Snapshot): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.time !== b.time) return a.time < b.time ? -1 : 1;
  return 0;
}

function canonicalU3aName(snapshots: Snapshot[]): string | null {
  for (const s of snapshots) {
    if (s.u3aName) return s.u3aName;
  }
  return null;
}

function sameU3a(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export default function App() {
  const [state, setState] = useState<State>('idle');
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [view, setView] = useState<View>({ kind: 'menu' });
  const [pending, setPending] = useState<PendingLoad | null>(null);
  const [pendingBulk, setPendingBulk] = useState<PendingBulk | null>(null);
  const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkLoadResult | null>(null);
  const [excludedPrefixes, setExcludedPrefixes] = useState<string[]>([]);
  const [prefsLoadedFor, setPrefsLoadedFor] = useState<string | null>(null);

  const analysisOptions = useMemo(
    () => ({ excludedGroupPrefixes: excludedPrefixes }),
    [excludedPrefixes],
  );

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setErrorMessage(null);
    if (files.length === 1) {
      await handleSingleFile(files[0]);
      return;
    }
    await startBulkLoad(files);
  };

  const handleSingleFile = async (file: File) => {
    const parsed = parseBackupFilename(file.name);
    if (!parsed) {
      setPending({ file, date: '', time: '', u3aName: null });
      setState('date-prompt');
      return;
    }

    if (snapshots.length === 0) {
      await loadAndAddSnapshot(file, parsed.date, parsed.time, parsed.u3aName);
      return;
    }

    const canonical = canonicalU3aName(snapshots);
    if (sameU3a(canonical, parsed.u3aName)) {
      await loadAndAddSnapshot(file, parsed.date, parsed.time, parsed.u3aName);
      return;
    }

    setPending({
      file,
      date: parsed.date,
      time: parsed.time,
      u3aName: parsed.u3aName,
    });
    setState('u3a-prompt');
  };

  const startBulkLoad = async (files: File[]) => {
    const { parsed, skippedNoDate } = partitionByFilename(files);
    if (parsed.length === 0) {
      // Nothing parseable — go straight to the summary so the user sees why.
      setBulkResult({
        loaded: [],
        replaced: [],
        skippedNoDate,
        skippedMismatch: [],
        failed: [],
      });
      setState('bulk-summary');
      return;
    }

    const existing = canonicalU3aName(snapshots);
    const fallback = parsed.find((p) => p.u3aName)?.u3aName ?? null;
    const expectedU3a = existing ?? fallback;

    const mismatches = expectedU3a
      ? parsed.filter(
          (p) => p.u3aName && !sameU3a(expectedU3a, p.u3aName),
        )
      : [];

    if (mismatches.length > 0) {
      setPendingBulk({ parsed, skippedNoDate, mismatches, expectedU3a });
      setState('bulk-u3a-prompt');
      return;
    }

    await runAndShowBulk(parsed, skippedNoDate, []);
  };

  const runAndShowBulk = async (
    toLoad: ParsedBulkFile[],
    skippedNoDate: string[],
    skippedMismatch: ParsedBulkFile[],
  ) => {
    setBulkProgress({
      current: 0,
      total: toLoad.length,
      currentFilename: toLoad[0]?.file.name ?? '',
    });
    setState('bulk-loading');

    const outcome = await runBulkLoad(toLoad, snapshots, (current, total, name) => {
      setBulkProgress({ current, total, currentFilename: name });
    });

    setSnapshots(outcome.snapshots);

    const canonical = canonicalU3aName(outcome.snapshots);
    const key = canonical ?? '__unknown__';
    if (key !== prefsLoadedFor) {
      setExcludedPrefixes(loadExcludedPrefixes(canonical));
      setPrefsLoadedFor(key);
    }

    setBulkProgress(null);
    setBulkResult({
      loaded: outcome.loaded,
      replaced: outcome.replaced,
      skippedNoDate,
      skippedMismatch: skippedMismatch.map((m) => ({
        filename: m.file.name,
        u3aName: m.u3aName,
      })),
      failed: outcome.failed,
    });
    setView({ kind: 'menu' });
    setState('bulk-summary');
  };

  const handleBulkLoadAll = async () => {
    if (!pendingBulk) return;
    const { parsed, skippedNoDate } = pendingBulk;
    setPendingBulk(null);
    await runAndShowBulk(parsed, skippedNoDate, []);
  };

  const handleBulkSkipMismatches = async () => {
    if (!pendingBulk) return;
    const { parsed, skippedNoDate, mismatches } = pendingBulk;
    setPendingBulk(null);
    const mismatchNames = new Set(mismatches.map((m) => m.file.name));
    const remaining = parsed.filter((p) => !mismatchNames.has(p.file.name));
    await runAndShowBulk(remaining, skippedNoDate, mismatches);
  };

  const handleBulkCancel = () => {
    setPendingBulk(null);
    setState(snapshots.length > 0 ? 'loaded' : 'idle');
  };

  const handleBulkSummaryClose = () => {
    setBulkResult(null);
    setState(snapshots.length > 0 ? 'loaded' : 'idle');
  };

  const handleManualDateSubmit = async (date: string, time: string) => {
    if (!pending) return;
    const file = pending.file;
    const parsedName = parseBackupFilename(file.name)?.u3aName ?? null;
    setPending(null);

    const canonical = canonicalU3aName(snapshots);
    if (snapshots.length > 0 && !sameU3a(canonical, parsedName)) {
      setPending({ file, date, time, u3aName: parsedName });
      setState('u3a-prompt');
      return;
    }
    await loadAndAddSnapshot(file, date, time, parsedName);
  };

  const handleDatePromptCancel = () => {
    setPending(null);
    setState(snapshots.length > 0 ? 'loaded' : 'idle');
  };

  const handleU3aConfirm = async () => {
    if (!pending) return;
    const { file, date, time, u3aName } = pending;
    setPending(null);
    await loadAndAddSnapshot(file, date, time, u3aName);
  };

  const handleU3aCancel = () => {
    setPending(null);
    setState(snapshots.length > 0 ? 'loaded' : 'idle');
  };

  const handleClearAll = () => {
    setSnapshots([]);
    setPending(null);
    setPendingBulk(null);
    setBulkProgress(null);
    setBulkResult(null);
    setView({ kind: 'menu' });
    setState('idle');
    setExcludedPrefixes([]);
    setPrefsLoadedFor(null);
  };

  const handleExcludedPrefixesChange = (prefixes: string[]) => {
    setExcludedPrefixes(prefixes);
    const canonical = canonicalU3aName(snapshots);
    saveExcludedPrefixes(canonical, prefixes);
  };

  const handleRemoveSnapshot = (filename: string) => {
    setSnapshots((prev) => {
      const next = prev.filter((s) => s.filename !== filename);
      if (next.length === 0) {
        setView({ kind: 'menu' });
        setState('idle');
      }
      return next;
    });
  };

  const loadAndAddSnapshot = async (
    file: File,
    date: string,
    time: string,
    u3aName: string | null,
  ) => {
    setState('loading');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const { backup, errors } = await loadBackup(arrayBuffer);
      const snap: Snapshot = {
        backup,
        filename: file.name,
        date,
        time,
        u3aName,
        errors,
      };
      const filtered = snapshots.filter(
        (s) => !(s.date === snap.date && s.time === snap.time),
      );
      const next = [...filtered, snap].sort(compareSnapshots);
      setSnapshots(next);

      const canonical = canonicalU3aName(next);
      const key = canonical ?? '__unknown__';
      if (key !== prefsLoadedFor) {
        setExcludedPrefixes(loadExcludedPrefixes(canonical));
        setPrefsLoadedFor(key);
      }

      setView({ kind: 'menu' });
      setState('loaded');
    } catch (err) {
      setState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load backup file',
      );
    }
  };

  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Analyse u3a</h1>
        <p className={styles.subtitle}>
          Local analysis tool for Beacon membership backups
        </p>
        {releaseMessage.message && (
          <p className={styles.releaseMessage}>
            {releaseMessage.message.replace('{version}', __APP_VERSION__)}
          </p>
        )}
      </header>

      <main className={styles.main}>
        {state === 'idle' && (
          <FileDropzone onFilesSelected={handleFilesSelected} />
        )}

        {state === 'loading' && (
          <div className={styles.loading}>
            <p>Loading and validating backup...</p>
            <div className={styles.spinner}></div>
          </div>
        )}

        {state === 'date-prompt' && pending && (
          <ManualDatePrompt
            filename={pending.file.name}
            onSubmit={handleManualDateSubmit}
            onCancel={handleDatePromptCancel}
          />
        )}

        {state === 'u3a-prompt' && pending && (
          <ConfirmU3aPrompt
            filename={pending.file.name}
            loadedU3a={canonicalU3aName(snapshots)}
            newU3a={pending.u3aName}
            onConfirm={handleU3aConfirm}
            onCancel={handleU3aCancel}
          />
        )}

        {state === 'bulk-u3a-prompt' && pendingBulk && (
          <BulkU3aPrompt
            loadedU3a={pendingBulk.expectedU3a}
            mismatches={pendingBulk.mismatches.map((m) => ({
              filename: m.file.name,
              u3aName: m.u3aName,
            }))}
            onLoadAll={handleBulkLoadAll}
            onSkipMismatches={handleBulkSkipMismatches}
            onCancel={handleBulkCancel}
          />
        )}

        {state === 'bulk-loading' && bulkProgress && (
          <BulkLoadProgress
            current={bulkProgress.current}
            total={bulkProgress.total}
            currentFilename={bulkProgress.currentFilename}
          />
        )}

        {state === 'bulk-summary' && bulkResult && (
          <BulkLoadSummary result={bulkResult} onClose={handleBulkSummaryClose} />
        )}

        {(state === 'loaded' ||
          state === 'bulk-loading' ||
          state === 'bulk-summary' ||
          state === 'bulk-u3a-prompt') &&
          latestSnapshot && (
            <div className={styles.loadedContent}>
              {view.kind === 'menu' && (
                <>
                  <SnapshotList
                    snapshots={snapshots}
                    onFilesSelected={handleFilesSelected}
                    onRemove={handleRemoveSnapshot}
                    onClearAll={handleClearAll}
                  />
                  <SummaryPanel snapshot={latestSnapshot} />
                  <GroupExclusionSettings
                    groups={latestSnapshot.backup.groups}
                    prefixes={excludedPrefixes}
                    onChange={handleExcludedPrefixesChange}
                  />
                  <AnalysisMenu
                    onSelectCategory={(categoryId) => setView({ kind: 'category', categoryId })}
                  />
                </>
              )}

              {view.kind === 'category' && (
                <CategoryPage
                  categoryId={view.categoryId}
                  snapshotCount={snapshots.length}
                  onBack={() => setView({ kind: 'menu' })}
                  onSelectAnalysis={(analysisId) => setView({ kind: 'analysis', analysisId })}
                />
              )}

              {view.kind === 'analysis' && (
                <AnalysisPage
                  analysisId={view.analysisId}
                  snapshots={snapshots}
                  options={analysisOptions}
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
                setErrorMessage(null);
                setPending(null);
                setState(snapshots.length > 0 ? 'loaded' : 'idle');
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
