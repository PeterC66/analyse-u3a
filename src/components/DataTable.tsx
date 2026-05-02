import { useMemo, useState } from 'react';
import type { CellValue, Column } from '../analyses/types.js';
import styles from './DataTable.module.css';

interface Props {
  columns: Column[];
  rows: Record<string, CellValue>[];
}

type SortDir = 'asc' | 'desc';

export default function DataTable({ columns, rows }: Props) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const handleHeaderClick = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const renderCell = (col: Column, value: CellValue) => {
    if (col.format) return col.format(value);
    return value === null ? '' : String(value);
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sortKey === col.key;
              const indicator = active ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
              return (
                <th
                  key={col.key}
                  className={`${styles.th} ${col.align === 'right' ? styles.right : ''}`}
                  onClick={() => handleHeaderClick(col.key)}
                  aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  {col.label}
                  <span className={styles.sortIndicator}>{indicator}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={i} className={styles.tr}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`${styles.td} ${col.align === 'right' ? styles.right : ''}`}
                >
                  {renderCell(col, row[col.key] ?? null)}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td className={styles.empty} colSpan={columns.length}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
