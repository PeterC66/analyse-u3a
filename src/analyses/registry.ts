import type { AnalysisCategory, AnalysisDefinition } from './types.js';
import { countByClass } from './membership/countByClass.js';
import { tenureDistribution } from './membership/tenureDistribution.js';
import { contactCoverage } from './membership/contactCoverage.js';
import { membershipOverTime } from './membership/membershipOverTime.js';

export const CATEGORIES: AnalysisCategory[] = [
  {
    id: 'membership-patterns',
    title: 'Membership Patterns',
    description: 'Member growth, decline, and demographics by class',
  },
  {
    id: 'group-popularity',
    title: 'Group Popularity',
    description: 'Group subscription levels, trends, and waitlists',
  },
  {
    id: 'attendance-patterns',
    title: 'Attendance Patterns',
    description: 'Inferred from group membership and calendar',
    notes: 'Note: Beacon does not record per-event attendance.',
  },
  {
    id: 'member-churn',
    title: 'Member Churn',
    description: 'Joiners, leavers, and lapsed renewals',
  },
  {
    id: 'renewal-payments',
    title: 'Renewal Payments',
    description: 'Income trends by year, class, and payment method',
  },
];

export const ANALYSES: AnalysisDefinition[] = [
  countByClass,
  tenureDistribution,
  contactCoverage,
  membershipOverTime,
];

export function getCategory(id: string): AnalysisCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getAnalysis(id: string): AnalysisDefinition | undefined {
  return ANALYSES.find((a) => a.id === id);
}

export function analysesForCategory(categoryId: string): AnalysisDefinition[] {
  return ANALYSES.filter((a) => a.categoryId === categoryId);
}
