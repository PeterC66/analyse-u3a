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
  /** Always called with at least one snapshot. Multi-snapshot mode passes more. */
  run: (snapshots: Snapshot[]) => AnalysisResult;
}
