import type { AnalysisDefinition } from '../types.js';
import { currentMembers } from '../members.js';

function present(value: string | null): boolean {
  return value !== null && value.trim() !== '';
}

export const contactCoverage: AnalysisDefinition = {
  id: 'membership-contact-coverage',
  categoryId: 'membership-patterns',
  title: 'Email & Phone Coverage',
  description:
    'How many current members have an email address, mobile, or landline on file.',
  run: (snapshots) => {
    const snap = snapshots[0];
    const members = currentMembers(snap.backup.members);
    const total = members.length;

    let email = 0;
    let mobile = 0;
    let telephone = 0;
    let anyContact = 0;
    let noContact = 0;

    for (const m of members) {
      const hasEmail = present(m['e-mail']);
      const hasMobile = present(m.mobile);
      const hasTel = present(m.telephone);
      if (hasEmail) email += 1;
      if (hasMobile) mobile += 1;
      if (hasTel) telephone += 1;
      if (hasEmail || hasMobile || hasTel) anyContact += 1;
      else noContact += 1;
    }

    const pct = (n: number): number =>
      total === 0 ? 0 : Math.round((n / total) * 1000) / 10;

    const rows = [
      { channel: 'Email', count: email, percent: pct(email) },
      { channel: 'Mobile', count: mobile, percent: pct(mobile) },
      { channel: 'Landline', count: telephone, percent: pct(telephone) },
      { channel: 'Any contact', count: anyContact, percent: pct(anyContact) },
      { channel: 'No contact', count: noContact, percent: pct(noContact) },
    ];

    return {
      columns: [
        { key: 'channel', label: 'Channel' },
        { key: 'count', label: 'Members', align: 'right' },
        {
          key: 'percent',
          label: '% of current',
          align: 'right',
          format: (v) => (v === null ? '' : `${v}%`),
        },
      ],
      rows,
      chart: {
        type: 'bar',
        xKey: 'channel',
        yKey: 'count',
        xLabel: 'Channel',
        yLabel: 'Members',
      },
    };
  },
};
