import ExcelJS from 'exceljs';
import {
  SHEET_SCHEMAS,
  parseSheet,
  type BeaconBackup,
  type SheetName,
} from '../../schemas/zod/index.js';
import { sheetToObjects } from './sheetToObjects.js';
import type { ValidationError } from '../state/types.js';

/**
 * Load and validate a Beacon backup file (`.xlsx`).
 *
 * Structural errors (missing sheet, wrong columns, empty sheet that
 * is required to have at least one row) throw immediately. Row-level
 * validation errors are collected and returned.
 *
 * Some sheets — Faculties, Venues, Calendar, Group Ledgers, Ledger,
 * Detail, Finance Categories, u3a Officers — may legitimately have no
 * data rows and are accepted empty.
 *
 * @param arrayBuffer - the file bytes
 * @throws if the file is corrupt or structurally invalid
 * @returns { backup, errors } where backup is the parsed data and errors
 *          is a list of row-level validation failures
 */
export async function loadBackup(
  arrayBuffer: ArrayBuffer,
): Promise<{ backup: BeaconBackup; errors: ValidationError[] }> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(arrayBuffer);

  const backup: Partial<BeaconBackup> = {};
  const errors: ValidationError[] = [];

  // Load and validate each required sheet.
  const sheets: SheetName[] = [
    'Member Statuses',
    'Membership Classes',
    'Membership Fees',
    'Members',
    'Faculties',
    'Venues',
    'Groups',
    'Group members',
    'Group Ledgers',
    'Calendar',
    'Finance Accounts',
    'Finance Categories',
    'Ledger',
    'Detail',
    'u3a Officers',
  ];

  // These sheets may legitimately have no data rows in some u3as
  // (e.g. a u3a that has not yet entered any venues, scheduled any
  // calendar events, recorded any ledger transactions, etc.).
  const sheetsThatMayBeEmpty: ReadonlySet<SheetName> = new Set<SheetName>([
    'Faculties',
    'Venues',
    'Calendar',
    'Group Ledgers',
    'Ledger',
    'Detail',
    'Finance Categories',
    'u3a Officers',
  ]);

  for (const sheetName of sheets) {
    const ws = wb.getWorksheet(sheetName);
    if (!ws) {
      throw new Error(`Backup is missing sheet "${sheetName}"`);
    }

    const rows = sheetToObjects(ws);
    if (rows.length === 0 && !sheetsThatMayBeEmpty.has(sheetName)) {
      throw new Error(`Sheet "${sheetName}" is empty (no data rows)`);
    }

    // Validate each row and collect errors.
    const schema = SHEET_SCHEMAS[sheetName];
    const validRows: unknown[] = [];

    for (let i = 0; i < rows.length; i++) {
      const result = schema.safeParse(rows[i]);
      if (result.success) {
        validRows.push(result.data);
      } else {
        errors.push({
          sheet: sheetName,
          rowIndex: i + 2, // +1 for header, +1 for 1-indexed
          message: result.error.message,
        });
      }
    }

    // Assign the valid rows to the backup object.
    // @ts-expect-error - assigning to partial via computed property
    backup[
      sheetName === 'Member Statuses'
        ? 'memberStatuses'
        : sheetName === 'Membership Classes'
          ? 'membershipClasses'
          : sheetName === 'Membership Fees'
            ? 'membershipFees'
            : sheetName === 'Members'
              ? 'members'
              : sheetName === 'Faculties'
                ? 'faculties'
                : sheetName === 'Venues'
                  ? 'venues'
                  : sheetName === 'Groups'
                    ? 'groups'
                    : sheetName === 'Group members'
                      ? 'groupMembers'
                      : sheetName === 'Group Ledgers'
                        ? 'groupLedgers'
                        : sheetName === 'Calendar'
                          ? 'calendar'
                          : sheetName === 'Finance Accounts'
                            ? 'financeAccounts'
                            : sheetName === 'Finance Categories'
                              ? 'financeCategories'
                              : sheetName === 'Ledger'
                                ? 'ledger'
                                : sheetName === 'Detail'
                                  ? 'detail'
                                  : sheetName === 'u3a Officers'
                                    ? 'officers'
                                    : sheetName
    ] = validRows;
  }

  return {
    backup: backup as BeaconBackup,
    errors,
  };
}
