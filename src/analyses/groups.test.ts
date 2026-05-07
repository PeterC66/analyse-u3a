import { describe, it, expect } from 'vitest';
import type { GroupRow } from '../../schemas/zod/index.js';
import { isRealGroup, realGroups } from './groups.js';

function group(name: string): GroupRow {
  return {
    gkey: name,
    group_name: name,
    faculty: null,
    venue: null,
    status: true,
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

describe('isRealGroup', () => {
  it('keeps every group when the prefix list is empty', () => {
    const g = group('Outing Cromer');
    expect(isRealGroup(g, [])).toBe(true);
  });

  it('matches prefixes case-insensitively', () => {
    const g = group('Outing Cromer');
    expect(isRealGroup(g, ['outing'])).toBe(false);
    expect(isRealGroup(g, ['OUTING'])).toBe(false);
    expect(isRealGroup(g, ['Outing'])).toBe(false);
  });

  it('only matches at the start, not anywhere in the name', () => {
    const g = group('My Outing Group');
    expect(isRealGroup(g, ['Outing'])).toBe(true);
  });

  it('treats "Outings" as excluded by the "Outing" prefix (parent holder case)', () => {
    expect(isRealGroup(group('Outings'), ['Outing'])).toBe(false);
  });

  it('excludes when any prefix in the list matches', () => {
    const prefs = ['Outing', 'Theatres', 'Events', 'POSS'];
    expect(isRealGroup(group('Theatres Mousetrap'), prefs)).toBe(false);
    expect(isRealGroup(group('Events AI Workshop 1'), prefs)).toBe(false);
    expect(isRealGroup(group('POSS BOARD GAMES'), prefs)).toBe(false);
    expect(isRealGroup(group('Art Club'), prefs)).toBe(true);
  });

  it('ignores empty / whitespace-only prefixes', () => {
    expect(isRealGroup(group('Art Club'), ['', '   '])).toBe(true);
  });

  it('trims surrounding whitespace on each prefix', () => {
    expect(isRealGroup(group('Outing Cromer'), ['  Outing  '])).toBe(false);
  });
});

describe('realGroups', () => {
  it('filters out every group whose name starts with any prefix', () => {
    const groups = [
      group('Art Club'),
      group('Outing Cromer'),
      group('Theatres Mousetrap'),
      group('Yoga'),
      group('POSS Comedy'),
    ];
    const kept = realGroups(groups, ['Outing', 'Theatres', 'POSS']);
    expect(kept.map((g) => g.group_name)).toEqual(['Art Club', 'Yoga']);
  });

  it('returns the same list when prefixes are empty', () => {
    const groups = [group('Art Club'), group('Outing Cromer')];
    expect(realGroups(groups, [])).toEqual(groups);
  });
});
