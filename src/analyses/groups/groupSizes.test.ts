import { describe, it, expect } from 'vitest';
import { groupSizes } from './groupSizes.js';
import { fakeGroup, fakeGroupMember, fakeSnapshot } from '../_test-helpers.js';

describe('groupSizes', () => {
  it('counts roster per active group, sorted largest first', () => {
    const result = groupSizes.run([
      fakeSnapshot('2025-04-01', {
        groups: [
          fakeGroup('A', true),
          fakeGroup('B', true),
          fakeGroup('C', false),
        ],
        groupMembers: [
          fakeGroupMember('A', 1),
          fakeGroupMember('A', 2),
          fakeGroupMember('B', 3),
          fakeGroupMember('B', 4),
          fakeGroupMember('B', 5),
          fakeGroupMember('C', 6),
        ],
      }),
    ]);

    expect(result.rows).toEqual([
      { group: 'Group B', faculty: '', members: 3 },
      { group: 'Group A', faculty: '', members: 2 },
    ]);
  });

  it('lists active groups with zero members', () => {
    const result = groupSizes.run([
      fakeSnapshot('2025-04-01', {
        groups: [fakeGroup('A', true), fakeGroup('B', true)],
        groupMembers: [fakeGroupMember('A', 1)],
      }),
    ]);

    expect(result.rows).toEqual([
      { group: 'Group A', faculty: '', members: 1 },
      { group: 'Group B', faculty: '', members: 0 },
    ]);
  });
});
