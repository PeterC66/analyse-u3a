import type { AnalysisDefinition } from '../types.js';

export const countByClass: AnalysisDefinition = {
  id: 'membership-count-by-class',
  categoryId: 'membership-patterns',
  title: 'Members by Class',
  description: 'Count of members in each membership class.',
  run: (snapshots) => {
    const snap = snapshots[0];
    const counts = new Map<string, number>();
    for (const m of snap.backup.members) {
      counts.set(m.class, (counts.get(m.class) ?? 0) + 1);
    }

    const rows = Array.from(counts.entries())
      .map(([className, count]) => ({ class: className, count }))
      .sort((a, b) => b.count - a.count);

    return {
      columns: [
        { key: 'class', label: 'Membership Class' },
        { key: 'count', label: 'Members', align: 'right' },
      ],
      rows,
      chart: {
        type: 'bar',
        xKey: 'class',
        yKey: 'count',
        xLabel: 'Membership Class',
        yLabel: 'Members',
      },
    };
  },
};
