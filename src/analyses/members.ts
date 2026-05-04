import type { MemberRow } from '../../schemas/zod/index.js';

const CURRENT_STATUSES = new Set(['current', 'honorary']);

export function isCurrentMember(member: MemberRow): boolean {
  return CURRENT_STATUSES.has(member.status.toLowerCase());
}

export function currentMembers(members: MemberRow[]): MemberRow[] {
  return members.filter(isCurrentMember);
}
