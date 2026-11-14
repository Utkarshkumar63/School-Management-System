import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/attendance', authorizeRoles('ADMIN', 'TEACHER'), ReportController.getAttendanceReport);
router.get('/academic', authorizeRoles('ADMIN', 'TEACHER'), ReportController.getAcademicReport);
router.get('/fees', authorizeRoles('ADMIN'), ReportController.getFeeReport);

export default router;

