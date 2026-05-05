import type { AnalysisDefinition } from '../types.js';
import { currentMembers } from '../members.js';

export const membershipOverTime: AnalysisDefinition = {
  id: 'membership-over-time',
  categoryId: 'membership-patterns',
  title: 'Total membership over time',
  description:
    'Number of current members at each loaded snapshot — needs at least 2 backups loaded.',
  scope: 'current',
  snapshots: 'all',
  run: (snapshots) => {
    const rows = snapshots.map((s) => ({
      date: s.date,
      members: currentMembers(s.backup.members).length,
    }));

    return {
      columns: [
        { key: 'date', label: 'Snapshot date' },
        { key: 'members', label: 'Current members', align: 'right' },
      ],
      rows,
      chart: {
        type: 'line',
        xKey: 'date',
        yKey: 'members',
        xLabel: 'Snapshot date',
        yLabel: 'Current members',
      },
    };
  },
};
