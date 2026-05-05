import type { AnalysisDefinition } from '../types.js';

export const activeGroupsOverTime: AnalysisDefinition = {
  id: 'groups-active-over-time',
  categoryId: 'group-popularity',
  title: 'Active groups over time',
  description:
    'Number of groups with status "Active" at each loaded snapshot — needs at least 2 backups loaded.',
  scope: 'all',
  snapshots: 'all',
  run: (snapshots) => {
    const rows = snapshots.map((s) => ({
      date: s.date,
      groups: s.backup.groups.filter((g) => g.status).length,
    }));

    return {
      columns: [
        { key: 'date', label: 'Snapshot date' },
        { key: 'groups', label: 'Active groups', align: 'right' },
      ],
      rows,
      chart: {
        type: 'line',
        xKey: 'date',
        yKey: 'groups',
        xLabel: 'Snapshot date',
        yLabel: 'Active groups',
      },
    };
  },
};
