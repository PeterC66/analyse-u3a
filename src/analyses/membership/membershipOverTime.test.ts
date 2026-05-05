import { describe, it, expect } from 'vitest';
import type { Snapshot } from '../../state/types.js';
import type { MemberRow } from '../../../schemas/zod/index.js';
import { membershipOverTime } from './membershipOverTime.js';

function member(mkey: string, status: string): MemberRow {
  return {
    mkey,
    mem_no: parseInt(mkey, 10) || 0,
    status,
    title: null,
    forename: 'X',
    surname: 'Y',
    suffix: null,
    known_as: null,
    initials: null,
    spare: null,
    mobile: null,
    'e-mail': null,
    affiliation: null,
    custom1: null,
    custom2: null,
    custom3: null,
    custom4: null,
    joined: null,
    renew: null,
    gift_aid: null,
    class: 'Single',
    mem_notes: null,
    akey: null,
    house: null,
    address1: null,
    address2: null,
    address3: null,
    town: null,
    postcode: null,
    county: null,
    telephone: null,
    add_notes: null,
    emergency_contact: null,
    enhanced_privacy: false,
    payment_type: null,
  };
}

function snapshot(date: string, members: MemberRow[]): Snapshot {
  return {
    backup: { members } as Snapshot['backup'],
    filename: `${date.replace(/-/g, '')}0000_test u3abackup.xlsx`,
    date,
    time: '00:00',
    u3aName: 'test',
    errors: [],
  };
}

describe('membershipOverTime', () => {
  it('counts current members per snapshot, in input order', () => {
    const snaps: Snapshot[] = [
      snapshot('2024-04-01', [
        member('1', 'Current'),
        member('2', 'Current'),
        member('3', 'Lapsed'),
      ]),
      snapshot('2025-04-01', [
        member('1', 'Current'),
        member('2', 'Current'),
        member('3', 'Current'),
        member('4', 'Honorary'),
        member('5', 'Resigned'),
      ]),
    ];

    const result = membershipOverTime.run(snaps);

    expect(result.rows).toEqual([
      { date: '2024-04-01', members: 2 },
      { date: '2025-04-01', members: 4 },
    ]);
    expect(result.chart).toEqual({
      type: 'line',
      xKey: 'date',
      yKey: 'members',
      xLabel: 'Snapshot date',
      yLabel: 'Current members',
    });
  });

  it('treats Honorary members as current and is case-insensitive on status', () => {
    const result = membershipOverTime.run([
      snapshot('2025-04-01', [
        member('1', 'CURRENT'),
        member('2', 'honorary'),
        member('3', 'lapsed'),
      ]),
    ]);
    expect(result.rows).toEqual([{ date: '2025-04-01', members: 2 }]);
  });

  it('is registered as an "all"-snapshots, current-scope analysis', () => {
    expect(membershipOverTime.snapshots).toBe('all');
    expect(membershipOverTime.scope).toBe('current');
  });
});
