import type { AnalysisDefinition } from '../types.js';
import { currentMembers } from '../members.js';

const BANDS: { label: string; min: number; max: number }[] = [
  { label: '<1', min: 0, max: 1 },
  { label: '1-4', min: 1, max: 5 },
  { label: '5-9', min: 5, max: 10 },
  { label: '10-14', min: 10, max: 15 },
  { label: '15-19', min: 15, max: 20 },
  { label: '20+', min: 20, max: Infinity },
];

function yearsBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const diffMs = to.getTime() - from.getTime();
  return diffMs / (365.25 * 24 * 60 * 60 * 1000);
}

export const tenureDistribution: AnalysisDefinition = {
  id: 'membership-tenure-distribution',
  categoryId: 'membership-patterns',
  title: 'Tenure Distribution',
  description:
    'Current members grouped by years since they joined (relative to the backup date).',
  run: (snapshots) => {
    const snap = snapshots[0];
    const asOf = snap.date;

    const counts = new Map<string, number>(BANDS.map((b) => [b.label, 0]));
    let unknown = 0;

    for (const m of currentMembers(snap.backup.members)) {
      if (!m.joined) {
        unknown += 1;
        continue;
      }
      const years = yearsBetween(m.joined, asOf);
      const band = BANDS.find((b) => years >= b.min && years < b.max);
      if (band) counts.set(band.label, (counts.get(band.label) ?? 0) + 1);
    }

    const rows = BANDS.map((b) => ({
      band: b.label,
      count: counts.get(b.label) ?? 0,
    }));
    if (unknown > 0) rows.push({ band: 'Unknown', count: unknown });

    return {
      columns: [
        { key: 'band', label: 'Years as Member' },
        { key: 'count', label: 'Members', align: 'right' },
      ],
      rows,
      chart: {
        type: 'bar',
        xKey: 'band',
        yKey: 'count',
        xLabel: 'Years as Member',
        yLabel: 'Members',
      },
    };
  },
};
