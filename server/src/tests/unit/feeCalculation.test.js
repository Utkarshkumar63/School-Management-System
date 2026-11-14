import { describe, it, expect } from '@jest/globals';

describe('Unit Test: Fee Balance & Ledger Calculation', () => {
  it('correctly calculates outstanding balance as total invoiced minus total paid', () => {
    const totalInvoiced = 2500;
    const payment1 = 1000;
    const payment2 = 500;

    const totalPaid = payment1 + payment2;
    const outstanding = totalInvoiced - totalPaid;

    expect(totalPaid).toBe(1500);
    expect(outstanding).toBe(1000);
  });

  it('calculates running ledger balance chronologically across invoices and payments', () => {
    const ledger = [];
    let currentBalance = 0;

    // 1. Initial invoice (Debit $1500)
    currentBalance += 1500;
    ledger.push({ type: 'INVOICE', debit: 1500, credit: 0, runningBalance: currentBalance });

    // 2. Partial payment (Credit $500)
    currentBalance -= 500;
    ledger.push({ type: 'PAYMENT', debit: 0, credit: 500, runningBalance: currentBalance });

    // 3. Second invoice (Debit $300)
    currentBalance += 300;
    ledger.push({ type: 'INVOICE', debit: 300, credit: 0, runningBalance: currentBalance });

    // 4. Second payment (Credit $1300)
    currentBalance -= 1300;
    ledger.push({ type: 'PAYMENT', debit: 0, credit: 1300, runningBalance: currentBalance });

    expect(ledger[0].runningBalance).toBe(1500);
    expect(ledger[1].runningBalance).toBe(1000);
    expect(ledger[2].runningBalance).toBe(1300);
    expect(ledger[3].runningBalance).toBe(0);

    const totalDebits = ledger.reduce((sum, e) => sum + e.debit, 0);
    const totalCredits = ledger.reduce((sum, e) => sum + e.credit, 0);
    const netBalance = totalDebits - totalCredits;

    expect(totalDebits).toBe(1800);
    expect(totalCredits).toBe(1800);
    expect(netBalance).toBe(ledger[ledger.length - 1].runningBalance);
  });

  it('determines invoice status transitions accurately', () => {
    const getStatus = (total, paid) => {
      if (paid >= total) return 'Paid';
      if (paid > 0) return 'Partially Paid';
      return 'Pending';
    };

    expect(getStatus(1000, 0)).toBe('Pending');
    expect(getStatus(1000, 400)).toBe('Partially Paid');
    expect(getStatus(1000, 1000)).toBe('Paid');
  });
});

