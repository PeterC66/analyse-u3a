import { describe, it, expect } from 'vitest';
import { activeGroupsOverTime } from './activeGroupsOverTime.js';
import { fakeGroup, fakeSnapshot } from '../_test-helpers.js';

describe('activeGroupsOverTime', () => {
  it('counts groups whose status flag is true per snapshot', () => {
    const result = activeGroupsOverTime.run([
      fakeSnapshot('2024-04-01', {
        groups: [
          fakeGroup('A', true),
          fakeGroup('B', true),
          fakeGroup('C', false),
        ],
      }),
      fakeSnapshot('2025-04-01', {
        groups: [
          fakeGroup('A', true),
          fakeGroup('B', true),
          fakeGroup('C', true),
          fakeGroup('D', false),
        ],
      }),
    ]);

    expect(result.rows).toEqual([
      { date: '2024-04-01', groups: 2 },
      { date: '2025-04-01', groups: 3 },
    ]);
  });
});
