import ExcelJS from 'exceljs';
import type { RefObject } from 'react';
import type { CellValue, Column } from '../analyses/types.js';
import styles from './DownloadBar.module.css';

interface Props {
  /** Filename stem, no extension. Receives ".csv" / ".xlsx" / ".svg" suffixes. */
  filenameStem: string;
  columns: Column[];
  rows: Record<string, CellValue>[];
  /** Wrapper div around the chart. We serialise the first <svg> inside it. */
  chartRef: RefObject<HTMLDivElement>;
}

function escapeCsvCell(value: CellValue): string {
  if (value === null) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function DownloadBar({ filenameStem, columns, rows, chartRef }: Props) {
  const downloadCsv = () => {
    const header = columns.map((c) => escapeCsvCell(c.label)).join(',');
    const body = rows
      .map((r) => columns.map((c) => escapeCsvCell(r[c.key] ?? null)).join(','))
      .join('\n');
    const blob = new Blob([`${header}\n${body}\n`], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, `${filenameStem}.csv`);
  };

  const downloadXlsx = async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Analysis');
    ws.columns = columns.map((c) => ({ header: c.label, key: c.key }));
    for (const r of rows) {
      ws.addRow(r);
    }
    ws.getRow(1).font = { bold: true };
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    triggerDownload(blob, `${filenameStem}.xlsx`);
  };

  const downloadSvg = () => {
    const svg = chartRef.current?.querySelector('svg');
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGElement;
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    const source = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${source}`], {
      type: 'image/svg+xml;charset=utf-8',
    });
    triggerDownload(blob, `${filenameStem}.svg`);
  };

  return (
    <div className={styles.bar}>
      <span className={styles.label}>Download:</span>
      <button className={styles.button} onClick={downloadCsv}>CSV</button>
      <button className={styles.button} onClick={downloadXlsx}>XLSX</button>
      <button className={styles.button} onClick={downloadSvg}>SVG (chart)</button>
    </div>
  );
}
