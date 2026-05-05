import type { AnalysisDefinition } from '../types.js';

export const groupSizes: AnalysisDefinition = {
  id: 'groups-sizes',
  categoryId: 'group-popularity',
  title: 'Group sizes',
  description:
    'Roster size of each active group in the latest backup, ordered largest first.',
  scope: 'all',
  run: (snapshots) => {
    const snap = snapshots[0];

    const activeGroups = snap.backup.groups.filter((g) => g.status);
    const nameByGkey = new Map(activeGroups.map((g) => [g.gkey, g.group_name]));
    const facultyByGkey = new Map(
      activeGroups.map((g) => [g.gkey, g.faculty ?? '']),
    );

    const sizesByGkey = new Map<string, number>();
    for (const gm of snap.backup.groupMembers) {
      if (nameByGkey.has(gm.gkey)) {
        sizesByGkey.set(gm.gkey, (sizesByGkey.get(gm.gkey) ?? 0) + 1);
      }
    }

    const rows = activeGroups
      .map((g) => ({
        group: nameByGkey.get(g.gkey) ?? g.gkey,
        faculty: facultyByGkey.get(g.gkey) ?? '',
        members: sizesByGkey.get(g.gkey) ?? 0,
      }))
      .sort((a, b) => b.members - a.members || a.group.localeCompare(b.group));

    return {
      columns: [
        { key: 'group', label: 'Group' },
        { key: 'faculty', label: 'Faculty' },
        { key: 'members', label: 'Members', align: 'right' },
      ],
      rows,
      chart: {
        type: 'bar',
        xKey: 'group',
        yKey: 'members',
        xLabel: 'Group',
        yLabel: 'Members',
      },
    };
  },
};
