import { describe, it, expect } from 'vitest';
import { joinersLeavers } from './joinersLeavers.js';
import { fakeMember, fakeSnapshot } from '../_test-helpers.js';

describe('joinersLeavers', () => {
  it('counts members who became / stopped being current between consecutive snapshots', () => {
    const snaps = [
      fakeSnapshot('2024-04-01', {
        members: [
          fakeMember('1', 'Current'),
          fakeMember('2', 'Current'),
          fakeMember('3', 'Current'),
        ],
      }),
      fakeSnapshot('2025-04-01', {
        members: [
          fakeMember('1', 'Current'),
          fakeMember('2', 'Lapsed'),
          fakeMember('3', 'Current'),
          fakeMember('4', 'Current'),
        ],
      }),
      fakeSnapshot('2026-04-01', {
        members: [
          fakeMember('1', 'Current'),
          fakeMember('3', 'Current'),
          fakeMember('4', 'Current'),
          fakeMember('5', 'Honorary'),
          fakeMember('6', 'Current'),
        ],
      }),
    ];

    expect(joinersLeavers.run(snaps).rows).toEqual([
      { from: '2024-04-01', to: '2025-04-01', joiners: 1, leavers: 1, net: 0 },
      { from: '2025-04-01', to: '2026-04-01', joiners: 2, leavers: 0, net: 2 },
    ]);
  });

  it('returns no rows for a single snapshot (pairs need at least 2)', () => {
    const result = joinersLeavers.run([
      fakeSnapshot('2025-04-01', { members: [fakeMember('1', 'Current')] }),
    ]);
    expect(result.rows).toEqual([]);
  });

  it('is registered as pairs / all-scope', () => {
    expect(joinersLeavers.snapshots).toBe('pairs');
    expect(joinersLeavers.scope).toBe('all');
  });
});
