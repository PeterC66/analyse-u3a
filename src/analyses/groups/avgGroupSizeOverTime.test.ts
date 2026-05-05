import { describe, it, expect } from 'vitest';
import { avgGroupSizeOverTime } from './avgGroupSizeOverTime.js';
import { fakeGroup, fakeGroupMember, fakeSnapshot } from '../_test-helpers.js';

describe('avgGroupSizeOverTime', () => {
  it('averages roster size across active groups, ignoring inactive ones', () => {
    const result = avgGroupSizeOverTime.run([
      fakeSnapshot('2024-04-01', {
        groups: [
          fakeGroup('A', 'Active'),
          fakeGroup('B', 'Active'),
          fakeGroup('C', 'Closed'),
        ],
        groupMembers: [
          fakeGroupMember('A', 1),
          fakeGroupMember('A', 2),
          fakeGroupMember('A', 3),
          fakeGroupMember('B', 4),
          fakeGroupMember('B', 5),
          fakeGroupMember('C', 6),
          fakeGroupMember('C', 7),
        ],
      }),
      fakeSnapshot('2025-04-01', {
        groups: [fakeGroup('A', 'Active')],
        groupMembers: [
          fakeGroupMember('A', 1),
          fakeGroupMember('A', 2),
          fakeGroupMember('A', 3),
          fakeGroupMember('A', 4),
        ],
      }),
    ]);

    expect(result.rows).toEqual([
      { date: '2024-04-01', avgSize: 2.5 },
      { date: '2025-04-01', avgSize: 4 },
    ]);
  });

  it('returns 0 when there are no active groups', () => {
    const result = avgGroupSizeOverTime.run([
      fakeSnapshot('2024-04-01', {
        groups: [fakeGroup('A', 'Closed')],
        groupMembers: [fakeGroupMember('A', 1)],
      }),
    ]);
    expect(result.rows).toEqual([{ date: '2024-04-01', avgSize: 0 }]);
  });
});
