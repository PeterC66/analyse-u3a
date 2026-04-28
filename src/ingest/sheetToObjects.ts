import type * as ExcelJS from 'exceljs';

/**
 * Convert an ExcelJS worksheet to an array of objects keyed by header row.
 * ExcelJS returns cells as Date / number / string / { text } / { result } / null.
 * Flatten hyperlinks and rich text to plain values.
 */
export function sheetToObjects(ws: ExcelJS.Worksheet): Record<string, unknown>[] {
  const headers: string[] = [];

  // Read header row (row 1)
  const headerRow = ws.getRow(1);
  if (!headerRow) return [];

  headerRow.eachCell({ includeEmpty: false }, (cell, col) => {
    const val = cell.value;
    headers[col - 1] = String(val ?? '');
  });

  // Read data rows (rows 2+)
  const rows: Record<string, unknown>[] = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    if (!row || row.actualCellCount === 0) continue;

    const obj: Record<string, unknown> = {};
    for (let c = 1; c <= headers.length; c++) {
      const key = headers[c - 1];
      if (!key) continue;

      const cell = row.getCell(c);
      let v: unknown = cell.value;

      // ExcelJS may wrap rich text or hyperlinks in objects.
      if (v && typeof v === 'object' && 'text' in v) {
        v = (v as { text: unknown }).text;
      } else if (v && typeof v === 'object' && 'result' in v) {
        v = (v as { result: unknown }).result;
      }

      obj[key] = v;
    }

    rows.push(obj);
  }

  return rows;
}
