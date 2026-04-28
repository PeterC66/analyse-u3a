import { useRef } from 'react';
import styles from './FileDropzone.module.css';

interface Props {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export default function FileDropzone({ onFileSelected, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    // Reset so selecting the same file again triggers onChange
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove(styles.dragOver);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      onFileSelected(file);
    } else if (file) {
      alert('Please select an .xlsx file');
    }
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
        <p className={styles.title}>Open Beacon Backup</p>
        <p className={styles.subtitle}>Drag and drop your backup file, or click to browse</p>
        <button
          className={styles.button}
          onClick={handleClick}
          disabled={disabled}
        >
          Open File...
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </div>
  );
}
