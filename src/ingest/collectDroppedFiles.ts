/**
 * Walk a DataTransferItemList from a drop event and collect every file,
 * recursing into any folder entries via the (non-standard but universally
 * supported) `webkitGetAsEntry` API.
 *
 * Falls back to `DataTransfer.files` when entries are unavailable (very
 * old browsers, or items without the `webkitGetAsEntry` extension), in
 * which case folder drops are silently dropped.
 */
export async function collectDroppedFiles(
  items: DataTransferItemList | null,
  files: FileList | null,
): Promise<File[]> {
  const entries: FileSystemEntry[] = [];
  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind !== 'file') continue;
      const entry = item.webkitGetAsEntry?.();
      if (entry) entries.push(entry);
    }
  }

  if (entries.length === 0) {
    return files ? Array.from(files) : [];
  }

  const out: File[] = [];
  for (const entry of entries) {
    await walkEntry(entry, out);
  }
  return out;
}

async function walkEntry(entry: FileSystemEntry, out: File[]): Promise<void> {
  if (entry.isFile) {
    const file = await fileFromEntry(entry as FileSystemFileEntry);
    if (file) out.push(file);
    return;
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const children = await readAllEntries(reader);
    for (const child of children) {
      await walkEntry(child, out);
    }
  }
}

function fileFromEntry(entry: FileSystemFileEntry): Promise<File | null> {
  return new Promise((resolve) => {
    entry.file(
      (file) => resolve(file),
      () => resolve(null),
    );
  });
}

async function readAllEntries(
  reader: FileSystemDirectoryReader,
): Promise<FileSystemEntry[]> {
  const out: FileSystemEntry[] = [];
  // readEntries returns at most ~100 entries per call; loop until empty.
  for (;;) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });
    if (batch.length === 0) return out;
    out.push(...batch);
  }
}
