import { Router } from 'express';
import { FeeController } from '../controllers/feeController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles, authorizeGuardianStudent } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validate.js';
import {
  createFeeStructureSchema,
  createInvoiceSchema,
  generateBatchInvoicesSchema,
  recordPaymentSchema,
} from '../validators/feeValidator.js';

const router = Router();

router.use(authenticate);

// ================= Fee Structures =================
router.get('/structures', authorizeRoles('ADMIN', 'GUARDIAN'), FeeController.getFeeStructures);
router.post('/structures', authorizeRoles('ADMIN'), validate(createFeeStructureSchema), FeeController.createFeeStructure);

// ================= Invoices =================
router.get('/invoices', authorizeRoles('ADMIN', 'GUARDIAN'), authorizeGuardianStudent, FeeController.getInvoices);
router.get('/invoices/:id', authorizeRoles('ADMIN', 'GUARDIAN'), FeeController.getInvoiceById);
router.post('/invoices', authorizeRoles('ADMIN'), validate(createInvoiceSchema), FeeController.createInvoice);
router.post('/invoices/batch', authorizeRoles('ADMIN'), validate(generateBatchInvoicesSchema), FeeController.generateBatchInvoices);

// ================= Payments =================
router.post('/payments', authorizeRoles('ADMIN', 'GUARDIAN'), validate(recordPaymentSchema), FeeController.recordPayment);
router.get('/payments', authorizeRoles('ADMIN', 'GUARDIAN'), authorizeGuardianStudent, FeeController.getPayments);

// ================= Ledger & Reconciliation =================
router.get('/ledger/:studentId', authorizeRoles('ADMIN', 'GUARDIAN'), authorizeGuardianStudent, FeeController.getStudentLedger);
router.get('/reconciliation', authorizeRoles('ADMIN'), FeeController.getReconciliation);

export default router;

