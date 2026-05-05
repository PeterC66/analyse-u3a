import type { AnalysisDefinition } from '../types.js';
import { isCurrentMember } from '../members.js';

export const joinersLeavers: AnalysisDefinition = {
  id: 'churn-joiners-leavers',
  categoryId: 'member-churn',
  title: 'Joiners and leavers between backups',
  description:
    'For each consecutive pair of snapshots, members who became current (joiners) and members who stopped being current (leavers).',
  scope: 'all',
  snapshots: 'pairs',
  run: (snapshots) => {
    const rows: Array<{
      from: string;
      to: string;
      joiners: number;
      leavers: number;
      net: number;
    }> = [];

    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];

      const prevCurrent = new Set(
        prev.backup.members.filter(isCurrentMember).map((m) => m.mkey),
      );
      const currCurrent = new Set(
        curr.backup.members.filter(isCurrentMember).map((m) => m.mkey),
      );

      let joiners = 0;
      for (const mkey of currCurrent) {
        if (!prevCurrent.has(mkey)) joiners++;
      }
      let leavers = 0;
      for (const mkey of prevCurrent) {
        if (!currCurrent.has(mkey)) leavers++;
      }

      rows.push({
        from: prev.date,
        to: curr.date,
        joiners,
        leavers,
        net: joiners - leavers,
      });
    }

    return {
      columns: [
        { key: 'from', label: 'From' },
        { key: 'to', label: 'To' },
        { key: 'joiners', label: 'Joiners', align: 'right' },
        { key: 'leavers', label: 'Leavers', align: 'right' },
        { key: 'net', label: 'Net change', align: 'right' },
      ],
      rows,
      chart: {
        type: 'bar',
        xKey: 'to',
        yKey: 'net',
        xLabel: 'To snapshot',
        yLabel: 'Net change in current members',
      },
    };
  },
};
