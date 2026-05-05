import type { Snapshot } from '../state/types.js';
import type {
  MemberRow,
  GroupRow,
  GroupMemberRow,
} from '../../schemas/zod/index.js';

export function fakeMember(mkey: string, status: string): MemberRow {
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

export function fakeGroup(gkey: string, status: string): GroupRow {
  return {
    gkey,
    group_name: `Group ${gkey}`,
    faculty: null,
    venue: null,
    status,
    info: null,
    meets_when: null,
    start_time: null,
    end_time: null,
    members: null,
    max_members: null,
    notes: null,
    contact: null,
    join_online: false,
    leave_online: false,
    waiting_list: false,
    notify_leader: false,
    leaders: null,
    mkey: null,
    mem_no: null,
    leaders_count: null,
    gvkey: null,
    gfkey: null,
  };
}

export function fakeGroupMember(gkey: string, mem_no: number): GroupMemberRow {
  return {
    gkey,
    group_name: `Group ${gkey}`,
    mem_no,
    forename: 'X',
    surname: 'Y',
    added: null,
    waiting: '0',
    leader: false,
    member_status: 'Active',
  };
}

export function fakeSnapshot(
  date: string,
  partial: Partial<Snapshot['backup']>,
): Snapshot {
  const empty: Snapshot['backup'] = {
    memberStatuses: [],
    membershipClasses: [],
    membershipFees: [],
    members: [],
    faculties: [],
    venues: [],
    groups: [],
    groupMembers: [],
    groupLedgers: [],
    calendar: [],
    financeAccounts: [],
    financeCategories: [],
    ledger: [],
    detail: [],
    officers: [],
  };
  return {
    backup: { ...empty, ...partial },
    filename: `${date.replace(/-/g, '')}0000_test u3abackup.xlsx`,
    date,
    time: '00:00',
    u3aName: 'test',
    errors: [],
  };
}
