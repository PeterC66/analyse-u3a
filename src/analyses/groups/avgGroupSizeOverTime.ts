import type { AnalysisDefinition } from '../types.js';

export const avgGroupSizeOverTime: AnalysisDefinition = {
  id: 'groups-avg-size-over-time',
  categoryId: 'group-popularity',
  title: 'Average group size over time',
  description:
    'Mean roster size across active groups at each loaded snapshot — needs at least 2 backups loaded.',
  scope: 'all',
  snapshots: 'all',
  run: (snapshots) => {
    const rows = snapshots.map((s) => {
      const activeGkeys = new Set(
        s.backup.groups.filter((g) => g.status).map((g) => g.gkey),
      );

      const sizesByGkey = new Map<string, number>();
      for (const gm of s.backup.groupMembers) {
        if (activeGkeys.has(gm.gkey)) {
          sizesByGkey.set(gm.gkey, (sizesByGkey.get(gm.gkey) ?? 0) + 1);
        }
      }

      const total = Array.from(sizesByGkey.values()).reduce(
        (acc, n) => acc + n,
        0,
      );
      const avg =
        activeGkeys.size === 0 ? 0 : Math.round((total / activeGkeys.size) * 10) / 10;

      return { date: s.date, avgSize: avg };
    });

    return {
      columns: [
        { key: 'date', label: 'Snapshot date' },
        { key: 'avgSize', label: 'Avg members per group', align: 'right' },
      ],
      rows,
      chart: {
        type: 'line',
        xKey: 'date',
        yKey: 'avgSize',
        xLabel: 'Snapshot date',
        yLabel: 'Average members per active group',
      },
    };
  },
};
