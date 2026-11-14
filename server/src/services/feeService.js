import { FeeStructure, Invoice, Payment, Student } from '../models/index.js';
import { LedgerService } from './ledgerService.js';
import { AppError } from '../utils/apiResponse.js';

export class FeeService {
  // ================= Fee Structures =================
  static async getFeeStructures(classId = null) {
    const filter = {};
    if (classId) filter.class = classId;
    return FeeStructure.find(filter).populate('class', 'name code').sort({ createdAt: -1 });
  }

  static async createFeeStructure(data) {
    const totalAmount = data.items.reduce((sum, item) => sum + Number(item.amount), 0);
    return FeeStructure.create({
      ...data,
      totalAmount,
    });
  }

  // ================= Invoices =================
  static async getInvoices({ page = 1, limit = 10, studentId, status, search }) {
    const query = {};
    if (studentId) query.student = studentId;
    if (status) query.status = status;
    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate({
        path: 'student',
        select: 'firstName lastName admissionNo rollNumber class section',
        populate: [
          { path: 'class', select: 'name code' },
          { path: 'section', select: 'name' },
        ],
      })
      .populate('feeStructure', 'name academicYear term')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return {
      invoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getInvoiceById(id) {
    const invoice = await Invoice.findById(id)
      .populate({
        path: 'student',
        select: 'firstName lastName admissionNo rollNumber class section guardian',
        populate: [
          { path: 'class', select: 'name code' },
          { path: 'section', select: 'name' },
          { path: 'guardian', select: 'name email phone' },
        ],
      })
      .populate('feeStructure', 'name academicYear term');

    if (!invoice) throw new AppError('Invoice not found', 404);

    const payments = await Payment.find({ invoice: id, status: 'Success' }).sort({ paidAt: -1 });

    return {
      invoice,
      payments,
    };
  }

  static async createInvoice(data) {
    const student = await Student.findById(data.student);
    if (!student) throw new AppError('Student not found', 404);

    const totalAmount = data.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      student: data.student,
      feeStructure: data.feeStructure || null,
      items: data.items,
      totalAmount,
      paidAmount: 0,
      outstandingAmount: totalAmount,
      dueDate: new Date(data.dueDate),
      status: 'Pending',
      remarks: data.remarks || '',
    });

    // Record Debit in Fee Ledger
    await LedgerService.recordEntry({
      studentId: data.student,
      entryType: 'INVOICE',
      referenceType: 'Invoice',
      referenceId: invoice._id,
      debit: totalAmount,
      credit: 0,
      description: `Invoice ${invoiceNumber} issued`,
    });

    return invoice;
  }

  static async generateBatchInvoices({ class: classId, section: sectionId, feeStructure: feeStructureId, dueDate }) {
    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) throw new AppError('Fee structure not found', 404);

    const studentFilter = { class: classId, isActive: true };
    if (sectionId) studentFilter.section = sectionId;

    const students = await Student.find(studentFilter);
    if (!students.length) {
      throw new AppError('No active students found matching criteria', 400);
    }

    const createdInvoices = [];
    for (const student of students) {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const invoice = await Invoice.create({
        invoiceNumber,
        student: student._id,
        feeStructure: feeStructure._id,
        items: feeStructure.items,
        totalAmount: feeStructure.totalAmount,
        paidAmount: 0,
        outstandingAmount: feeStructure.totalAmount,
        dueDate: new Date(dueDate),
        status: 'Pending',
        remarks: `Batch generated for ${feeStructure.name}`,
      });

      await LedgerService.recordEntry({
        studentId: student._id,
        entryType: 'INVOICE',
        referenceType: 'Invoice',
        referenceId: invoice._id,
        debit: feeStructure.totalAmount,
        credit: 0,
        description: `Invoice ${invoiceNumber} issued for ${feeStructure.name}`,
      });

      createdInvoices.push(invoice);
    }

    return {
      message: `Generated ${createdInvoices.length} invoices successfully`,
      count: createdInvoices.length,
      invoices: createdInvoices,
    };
  }

  // ================= Payments =================
  static async recordPayment({
    invoice: invoiceId,
    amount,
    paymentMethod = 'Online Simulator',
    transactionReference = '',
    idempotencyKey,
    notes = '',
    userId,
  }) {
    // 1. Check idempotency key: return existing payment if already processed
    const existingPayment = await Payment.findOne({ idempotencyKey });
    if (existingPayment) {
      const invoice = await Invoice.findById(existingPayment.invoice);
      return {
        isDuplicate: true,
        message: 'Payment already processed with this idempotency key (idempotent response)',
        payment: existingPayment,
        invoice,
      };
    }

    // 2. Fetch target invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // 3. Block invalid status transitions
    if (invoice.status === 'Paid') {
      throw new AppError('Invalid state transition: This invoice is already fully paid', 400);
    }
    if (invoice.status === 'Cancelled') {
      throw new AppError('Invalid state transition: Cannot make payment on a cancelled invoice', 400);
    }

    // 4. Block overpayment
    const paymentAmount = Number(amount);
    if (paymentAmount > invoice.outstandingAmount) {
      throw new AppError(
        `Overpayment rejected: payment amount (${paymentAmount}) exceeds invoice outstanding balance (${invoice.outstandingAmount})`,
        400
      );
    }

    // 5. Generate payment number & transaction ref
    const paymentNumber = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const txRef = transactionReference || `TXN-SIM-${Date.now()}`;

    // 6. Create payment record
    const payment = await Payment.create({
      paymentNumber,
      invoice: invoice._id,
      student: invoice.student,
      amount: paymentAmount,
      paymentMethod,
      transactionReference: txRef,
      idempotencyKey,
      status: 'Success',
      paidAt: new Date(),
      recordedBy: userId,
      notes,
    });

    // 7. Update Invoice amounts & status transition
    const updatedPaidAmount = Math.round((invoice.paidAmount + paymentAmount) * 100) / 100;
    const updatedOutstanding = Math.max(0, Math.round((invoice.totalAmount - updatedPaidAmount) * 100) / 100);
    const newStatus = updatedOutstanding === 0 ? 'Paid' : 'Partially Paid';

    invoice.paidAmount = updatedPaidAmount;
    invoice.outstandingAmount = updatedOutstanding;
    invoice.status = newStatus;
    await invoice.save();

    // 8. Record Credit in Fee Ledger
    await LedgerService.recordEntry({
      studentId: invoice.student,
      entryType: 'PAYMENT',
      referenceType: 'Payment',
      referenceId: payment._id,
      debit: 0,
      credit: paymentAmount,
      description: `Payment ${paymentNumber} recorded for invoice ${invoice.invoiceNumber}`,
    });

    return {
      isDuplicate: false,
      message: 'Payment recorded successfully',
      payment,
      invoice,
    };
  }

  static async getPayments({ page = 1, limit = 10, studentId }) {
    const query = {};
    if (studentId) query.student = studentId;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('invoice', 'invoiceNumber totalAmount outstandingAmount status')
      .populate('student', 'firstName lastName admissionNo rollNumber')
      .populate('recordedBy', 'name role')
      .sort({ paidAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return {
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

