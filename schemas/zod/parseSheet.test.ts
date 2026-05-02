import { describe, it, expect } from 'vitest';
import { parseSheet, SHEET_SCHEMAS, type SheetName } from './index.js';

const FIXTURES: { [N in SheetName]: Record<string, unknown>[] } = {
  'Member Statuses': [
    { stakey: 'MS1', status: 'Active', locked: 1 },
  ],
  'Membership Classes': [
    {
      mckey: 'C1', class: 'Single', status: 1, fee: 25,
      family: 0, associate: 0, info: null, notes: null, locked: 0,
    },
  ],
  'Membership Fees': [
    { mckey: 'C1', class: 'Single', month: 4, fee: 25 },
  ],
  Members: [
    {
      mkey: 'M1', mem_no: 1, status: 'Active', title: 'Mr', forename: 'Alice',
      surname: 'Smith', suffix: null, known_as: null, initials: 'A',
      spare: null, mobile: null, 'e-mail': null, affiliation: null,
      custom1: null, custom2: null, custom3: null, custom4: null,
      joined: '2020-01-15', renew: '2026-04-01', gift_aid: null,
      class: 'Single', mem_notes: null, akey: null,
      house: null, address1: null, address2: null, address3: null,
      town: null, postcode: null, county: null, telephone: null,
      add_notes: null, emergency_contact: null, enhanced_privacy: 0,
      payment_type: null,
    },
  ],
  Faculties: [
    { gfkey: 'F1', faculty: 'Languages' },
  ],
  Venues: [
    {
      gvkey: 'V1', venue: 'Village Hall', address: null, postcode: null,
      telephone: null, contact: null, email: null, website: null,
      private: 0, accessible: 1, notes: null,
    },
  ],
  Groups: [
    {
      gkey: 'G1', group_name: 'French Conversation', faculty: 'Languages',
      venue: 'Village Hall', status: 'Active', info: null,
      meets_when: 'Monday 10:00', start_time: '10:00', end_time: '12:00',
      members: 8, max_members: 12, notes: null, contact: null,
      join_online: 0, leave_online: 0, waiting_list: 0, notify_leader: 0,
      leaders: null, mkey: null, mem_no: null, leaders_count: 1,
      gvkey: 'V1', gfkey: 'F1',
    },
  ],
  'Group members': [
    {
      gkey: 'G1', group_name: 'French Conversation', mem_no: 1,
      forename: 'Alice', surname: 'Smith', added: '2024-09-01',
      waiting: '0', leader: 0, member_status: 'Active',
    },
  ],
  'Group Ledgers': [
    {
      gtkey: 'GL1', gkey: 'G1', group: 'French Conversation',
      date: '2025-04-01', payee: null, amount: 10, detail: null,
    },
  ],
  Calendar: [
    {
      ckey: 'CA1', 'date/time': '2026-04-15 10:00', end_time: '12:00',
      gkey: 'G1', group: 'French Conversation', gvkey: 'V1',
      venue: 'Village Hall', topic: 'Open Day', detail: null,
      enquiries: null, exclude_public: 0,
    },
  ],
  'Finance Accounts': [
    { acckey: 'FA1', name: 'Current Account', status: 1, locked: 0 },
  ],
  'Finance Categories': [
    { catkey: 'FC1', name: 'Subscriptions', status: 1, locked: 0 },
  ],
  Ledger: [
    {
      tkey: 'T1', trans_no: 1, date: '2025-04-01', account: 'FA1',
      amount: 25, payee: null, detail: null, payment_method: null,
      cheque: null, notes: null, cleared: null, gift_aid: null,
      claimed: null, member_1: 1, member_2: null, group: null, c_name: null,
    },
  ],
  Detail: [
    { tkey: 'T1', category: 'Subscriptions', amount: 25 },
  ],
  'u3a Officers': [
    {
      ofkey: 'O1', office: 'Chair', mkey: 'M1',
      forename: 'Alice', surname: 'Smith', 'e-mail': null, notes: null,
    },
  ],
};

describe('parseSheet — round-trip a representative row through every schema', () => {
  for (const sheetName of Object.keys(SHEET_SCHEMAS) as SheetName[]) {
    it(`accepts a known-good row for "${sheetName}"`, () => {
      const fixture = FIXTURES[sheetName];
      expect(fixture, `missing fixture for ${sheetName}`).toBeDefined();

      const schema = SHEET_SCHEMAS[sheetName];
      for (const row of fixture) {
        const result = schema.safeParse(row);
        if (!result.success) {
          throw new Error(
            `Fixture for "${sheetName}" failed to parse: ${result.error.message}`,
          );
        }
      }
      const parsed = parseSheet(sheetName, fixture);
      expect(parsed).toHaveLength(fixture.length);
    });
  }
});

describe('parseSheet error path', () => {
  it('throws with sheet name and (header-offset) row number on invalid input', () => {
    expect(() =>
      parseSheet('Members', [{ surname: 'NoKey' }]),
    ).toThrowError(/Sheet "Members" row 2/);
  });
});
