import type { Snapshot } from '../state/types.js';

export type CellValue = string | number | null;

export interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right';
  format?: (v: CellValue) => string;
}

export interface AnalysisResult {
  columns: Column[];
  rows: Record<string, CellValue>[];
  chart: ChartConfig;
}

export type ChartConfig =
  | {
      type: 'bar';
      xKey: string;
      yKey: string;
      xLabel?: string;
      yLabel?: string;
    }
  | {
      type: 'line';
      xKey: string;
      yKey: string;
      xLabel?: string;
      yLabel?: string;
    };

export interface AnalysisCategory {
  id: string;
  title: string;
  description: string;
  notes?: string;
}

export interface AnalysisDefinition {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  /**
   * Member-population scope. Defaults to 'current' — analyses operate on
   * `status === 'Current' | 'Honorary'` members only. Set to 'all' for
   * analyses that intentionally include lapsed/resigned/deceased members
   * (e.g. churn, lifetime-history reports).
   */
  scope?: 'current' | 'all';
  /**
   * Snapshot-set the analysis consumes.
   * - 'latest' (default): receives only the most recent snapshot — every
   *   single-snapshot analysis stays this shape.
   * - 'all': receives every loaded snapshot, sorted oldest → newest. For
   *   time-series analyses.
   * - 'pairs': also receives every loaded snapshot. Reserved for
   *   consecutive-snapshot diff analyses (joiners/leavers); the analysis
   *   walks pairs itself.
   *
   * NOTE: cumulative sheets (Ledger, Detail, Group Ledgers, Calendar)
   * already contain full history in *every* backup — read them from the
   * latest snapshot only. Do not aggregate them across snapshots or you
   * will double-count.
   */
  snapshots?: 'latest' | 'all' | 'pairs';
  /** Always called with at least one snapshot. */
  run: (snapshots: Snapshot[]) => AnalysisResult;
}
