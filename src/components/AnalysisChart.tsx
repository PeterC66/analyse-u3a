import { forwardRef } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CellValue, ChartConfig } from '../analyses/types.js';
import styles from './AnalysisChart.module.css';

interface Props {
  config: ChartConfig;
  rows: Record<string, CellValue>[];
}

const AnalysisChart = forwardRef<HTMLDivElement, Props>(function AnalysisChart(
  { config, rows },
  ref,
) {
  return (
    <div ref={ref} className={styles.container}>
      <ResponsiveContainer width="100%" height={320}>
        {config.type === 'bar' ? (
          <BarChart data={rows} margin={{ top: 16, right: 24, bottom: 32, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey={config.xKey}
              label={
                config.xLabel
                  ? { value: config.xLabel, position: 'insideBottom', offset: -16 }
                  : undefined
              }
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={
                config.yLabel
                  ? { value: config.yLabel, angle: -90, position: 'insideLeft' }
                  : undefined
              }
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey={config.yKey} fill="#0066cc" />
          </BarChart>
        ) : (
          <LineChart data={rows} margin={{ top: 16, right: 24, bottom: 32, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey={config.xKey}
              label={
                config.xLabel
                  ? { value: config.xLabel, position: 'insideBottom', offset: -16 }
                  : undefined
              }
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={
                config.yLabel
                  ? { value: config.yLabel, angle: -90, position: 'insideLeft' }
                  : undefined
              }
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Line type="monotone" dataKey={config.yKey} stroke="#0066cc" dot />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
});

export default AnalysisChart;
