import { describe, it, expect } from 'vitest';
import { ledgerType, type LedgerRow } from './ledger.js';

const baseRow: LedgerRow = {
  tkey: 'T1', trans_no: 1, date: '2025-04-01', account: 'FA1',
  amount: 0, payee: null, detail: null, payment_method: null,
  cheque: null, notes: null, cleared: null, gift_aid: null,
  claimed: null, member_1: null, member_2: null, group: null, c_name: null,
};

describe('ledgerType', () => {
  it('positive amount → "in"', () => {
    expect(ledgerType({ ...baseRow, amount: 25 })).toBe('in');
  });
  it('negative amount → "out"', () => {
    expect(ledgerType({ ...baseRow, amount: -10 })).toBe('out');
  });
  it('zero amount → "in" (boundary)', () => {
    expect(ledgerType({ ...baseRow, amount: 0 })).toBe('in');
  });
});
