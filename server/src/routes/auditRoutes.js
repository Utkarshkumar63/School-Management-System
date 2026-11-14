import { Router } from 'express';
import { AuditController } from '../controllers/auditController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/rbac.js';

const router = Router();

router.use(authenticate);

// Admin-only audit logs endpoint
router.get('/logs', authorizeRoles('ADMIN'), AuditController.getLogs);

export default router;

