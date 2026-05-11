import { useRef } from 'react';
import { isBackupFilename } from '../ingest/isBackupFilename.js';
import { collectDroppedFiles } from '../ingest/collectDroppedFiles.js';
import styles from './FileDropzone.module.css';

interface Props {
  /**
   * Called with the list of selected backup files. Length 1 = the
   * original single-file flow (prompts for date / u3a as needed);
   * length > 1 = bulk flow (skip problem files, single u3a-confirm).
   * Empty array means the user picked something but nothing matched
   * `*u3abackup.xlsx` — the dropzone alerts in that case so the
   * caller doesn't need to.
   */
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export default function FileDropzone({ onFilesSelected, disabled = false }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const deliver = (raw: File[]) => {
    if (raw.length === 0) return;
    const matched = raw.filter((f) => isBackupFilename(f.name));
    if (matched.length === 0) {
      alert(
        raw.length === 1
          ? 'That file is not a Beacon backup (expected name ending in “ u3abackup.xlsx”).'
          : 'No Beacon backup files were found (expected names ending in “ u3abackup.xlsx”).',
      );
      return;
    }
    onFilesSelected(matched);
  };

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const handlePickFolder = () => {
    folderInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    deliver(files ? Array.from(files) : []);
    e.currentTarget.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      dropZoneRef.current?.classList.add(styles.dragOver);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove(styles.dragOver);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove(styles.dragOver);
    if (disabled) return;

    const files = await collectDroppedFiles(
      e.dataTransfer.items,
      e.dataTransfer.files,
    );
    deliver(files);
  };

  return (
    <div
      ref={dropZoneRef}
      className={styles.dropzone}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.content}>
        <p className={styles.title}>Open Beacon Backup(s)</p>
        <p className={styles.subtitle}>
          Drag and drop one or more backup files (or a folder), or use the buttons
        </p>
        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.button}
            onClick={handlePickFiles}
            disabled={disabled}
          >
            Choose file(s)…
          </button>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={handlePickFolder}
            disabled={disabled}
          >
            Choose folder…
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        multiple
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </div>
  );
}
