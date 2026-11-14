import { FeeService } from '../services/feeService.js';
import { LedgerService } from '../services/ledgerService.js';
import { ApiResponse, AppError } from '../utils/apiResponse.js';
import { recordAudit } from '../middlewares/auditMiddleware.js';
import { Guardian } from '../models/Guardian.js';

export class FeeController {
  // Fee Structures
  static async getFeeStructures(req, res, next) {
    try {
      const structures = await FeeService.getFeeStructures(req.query.classId);
      return ApiResponse.success(res, { data: structures });
    } catch (error) {
      next(error);
    }
  }

  static async createFeeStructure(req, res, next) {
    try {
      const structure = await FeeService.createFeeStructure(req.body);
      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'CREATE_FEE_STRUCTURE',
        entity: 'FeeStructure',
        entityId: structure._id,
        details: { name: structure.name, totalAmount: structure.totalAmount },
        ipAddress: req.ip,
      });
      return ApiResponse.created(res, {
        message: 'Fee structure created successfully',
        data: structure,
      });
    } catch (error) {
      next(error);
    }
  }

  // Invoices
  static async getInvoices(req, res, next) {
    try {
      let { page, limit, studentId, status, search } = req.query;

      if (req.user.role === 'GUARDIAN') {
        const guardian = await Guardian.findOne({ user: req.user._id });
        if (!guardian) throw new AppError('Guardian profile not found', 404);

        if (studentId) {
          const isLinked = guardian.students.some((sId) => sId.toString() === studentId.toString());
          if (!isLinked) {
            throw new AppError('Access forbidden: You are not authorized to view this student invoice.', 403);
          }
        } else {
          studentId = { $in: guardian.students };
        }
      }

      const result = await FeeService.getInvoices({ page, limit, studentId, status, search });
      return ApiResponse.success(res, {
        data: result.invoices,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceById(req, res, next) {
    try {
      const result = await FeeService.getInvoiceById(req.params.id);

      if (req.user.role === 'GUARDIAN') {
        const guardian = await Guardian.findOne({ user: req.user._id });
        const studentId = result.invoice.student?._id?.toString() || result.invoice.student?.toString();
        const isLinked = guardian?.students.some((sId) => sId.toString() === studentId);
        if (!isLinked) {
          throw new AppError('Access forbidden: You are not authorized to view this invoice.', 403);
        }
      }

      return ApiResponse.success(res, { data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createInvoice(req, res, next) {
    try {
      const invoice = await FeeService.createInvoice(req.body);
      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'CREATE_INVOICE',
        entity: 'Invoice',
        entityId: invoice._id,
        details: { invoiceNumber: invoice.invoiceNumber, totalAmount: invoice.totalAmount },
        ipAddress: req.ip,
      });
      return ApiResponse.created(res, {
        message: 'Invoice created successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateBatchInvoices(req, res, next) {
    try {
      const result = await FeeService.generateBatchInvoices(req.body);
      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'BATCH_CREATE_INVOICES',
        entity: 'Invoice',
        entityId: req.body.class,
        details: { count: result.count, feeStructure: req.body.feeStructure },
        ipAddress: req.ip,
      });
      return ApiResponse.created(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Payments
  static async recordPayment(req, res, next) {
    try {
      const result = await FeeService.recordPayment({
        ...req.body,
        userId: req.user._id,
      });

      if (!result.isDuplicate) {
        await recordAudit({
          actor: req.user._id,
          actorName: req.user.name,
          role: req.user.role,
          action: 'PAYMENT_RECORD',
          entity: 'Payment',
          entityId: result.payment._id,
          details: {
            paymentNumber: result.payment.paymentNumber,
            amount: result.payment.amount,
            invoice: req.body.invoice,
            idempotencyKey: req.body.idempotencyKey,
          },
          ipAddress: req.ip,
        });
      }

      return ApiResponse.success(res, {
        statusCode: result.isDuplicate ? 200 : 201,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req, res, next) {
    try {
      let { page, limit, studentId } = req.query;

      if (req.user.role === 'GUARDIAN') {
        const guardian = await Guardian.findOne({ user: req.user._id });
        if (!guardian) throw new AppError('Guardian profile not found', 404);

        if (studentId) {
          const isLinked = guardian.students.some((sId) => sId.toString() === studentId.toString());
          if (!isLinked) {
            throw new AppError('Access forbidden: You are not authorized to view this student payments.', 403);
          }
        } else {
          studentId = { $in: guardian.students };
        }
      }

      const result = await FeeService.getPayments({ page, limit, studentId });
      return ApiResponse.success(res, {
        data: result.payments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Ledger
  static async getStudentLedger(req, res, next) {
    try {
      const { studentId } = req.params;
      const ledger = await LedgerService.getStudentLedger(studentId);
      return ApiResponse.success(res, { data: ledger });
    } catch (error) {
      next(error);
    }
  }

  static async getReconciliation(req, res, next) {
    try {
      const reconciliation = await LedgerService.getSystemReconciliation();
      return ApiResponse.success(res, { data: reconciliation });
    } catch (error) {
      next(error);
    }
  }
}

