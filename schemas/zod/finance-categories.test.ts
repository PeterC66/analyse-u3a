import { describe, it, expect } from 'vitest';
import { RENEWAL_CATEGORY_REGEX } from './finance-categories.js';

describe('RENEWAL_CATEGORY_REGEX — default heuristic for renewal categories', () => {
  it.each([
    'Subscriptions',
    'subscription',
    'Membership Renewal',
    'Renewals',
    'Member Fee',
    'Membership Fees',
  ])('matches "%s"', (name) => {
    expect(RENEWAL_CATEGORY_REGEX.test(name)).toBe(true);
  });

  it.each([
    'Donations',
    'Hire of Hall',
    'Stationery',
    'Tea & Coffee',
  ])('does not match "%s"', (name) => {
    expect(RENEWAL_CATEGORY_REGEX.test(name)).toBe(false);
  });
});
