import { describe, it, expect } from 'vitest';
import { activeGroupsOverTime } from './activeGroupsOverTime.js';
import { fakeGroup, fakeSnapshot } from '../_test-helpers.js';

describe('activeGroupsOverTime', () => {
  it('counts groups with status Active per snapshot, case-insensitively', () => {
    const result = activeGroupsOverTime.run([
      fakeSnapshot('2024-04-01', {
        groups: [
          fakeGroup('A', 'Active'),
          fakeGroup('B', 'Active'),
          fakeGroup('C', 'Suspended'),
        ],
      }),
      fakeSnapshot('2025-04-01', {
        groups: [
          fakeGroup('A', 'active'),
          fakeGroup('B', 'Active'),
          fakeGroup('C', 'Active'),
          fakeGroup('D', 'Closed'),
        ],
      }),
    ]);

    expect(result.rows).toEqual([
      { date: '2024-04-01', groups: 2 },
      { date: '2025-04-01', groups: 3 },
    ]);
  });
});
