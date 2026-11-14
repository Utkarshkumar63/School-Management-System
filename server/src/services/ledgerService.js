import { LedgerEntry, Invoice, Payment, Student } from '../models/index.js';

export class LedgerService {
  /**
   * Append a new entry to the student's fee ledger and update running balance.
   */
  static async recordEntry({
    studentId,
    entryType,
    referenceType,
    referenceId,
    debit = 0,
    credit = 0,
    description = '',
  }) {
    // Get latest ledger entry to calculate current running balance
    const lastEntry = await LedgerEntry.findOne({ student: studentId }).sort({
      timestamp: -1,
      _id: -1,
    });

    const previousBalance = lastEntry ? Number(lastEntry.runningBalance) : 0;
    const runningBalance = Math.round((previousBalance + Number(debit) - Number(credit)) * 100) / 100;

    const entry = await LedgerEntry.create({
      student: studentId,
      entryType,
      referenceType,
      referenceId,
      debit: Number(debit),
      credit: Number(credit),
      runningBalance,
      description,
      timestamp: new Date(),
    });

    return entry;
  }

  /**
   * Retrieve ledger entries for a student and verify mathematical reconciliation.
   */
  static async getStudentLedger(studentId) {
    const entries = await LedgerEntry.find({ student: studentId }).sort({
      timestamp: 1,
      _id: 1,
    });

    const totalDebits = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredits = entries.reduce((sum, e) => sum + (e.credit || 0), 0);
    const netBalance = Math.round((totalDebits - totalCredits) * 100) / 100;

    const lastEntry = entries[entries.length - 1];
    const latestRunningBalance = lastEntry ? lastEntry.runningBalance : 0;

    // Reconciliation check
    const isReconciled = Math.abs(netBalance - latestRunningBalance) < 0.001;

    return {
      studentId,
      entries,
      totalDebits: Math.round(totalDebits * 100) / 100,
      totalCredits: Math.round(totalCredits * 100) / 100,
      netBalance,
      latestRunningBalance,
      isReconciled,
    };
  }

  /**
   * Reconcile system-wide invoices, payments, and ledger totals.
   */
  static async getSystemReconciliation() {
    const invoices = await Invoice.find({ status: { $ne: 'Cancelled' } });
    const payments = await Payment.find({ status: 'Success' });
    const ledger = await LedgerEntry.find();

    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const totalInvoicePaid = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const totalInvoiceOutstanding = invoices.reduce((sum, i) => sum + (i.outstandingAmount || 0), 0);

    const totalPaymentsReceived = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalLedgerDebits = ledger.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalLedgerCredits = ledger.reduce((sum, l) => sum + (l.credit || 0), 0);
    const ledgerOutstanding = totalLedgerDebits - totalLedgerCredits;

    const isReconciled =
      Math.abs(totalInvoiced - totalLedgerDebits) < 0.01 &&
      Math.abs(totalPaymentsReceived - totalLedgerCredits) < 0.01 &&
      Math.abs(totalInvoiceOutstanding - ledgerOutstanding) < 0.01;

    return {
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      totalPaymentsReceived: Math.round(totalPaymentsReceived * 100) / 100,
      totalInvoiceOutstanding: Math.round(totalInvoiceOutstanding * 100) / 100,
      ledger: {
        totalDebits: Math.round(totalLedgerDebits * 100) / 100,
        totalCredits: Math.round(totalLedgerCredits * 100) / 100,
        outstanding: Math.round(ledgerOutstanding * 100) / 100,
      },
      isReconciled,
    };
  }
}

