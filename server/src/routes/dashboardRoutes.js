import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles } from '../middlewares/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/admin', authorizeRoles('ADMIN'), DashboardController.getAdminDashboard);
router.get('/teacher', authorizeRoles('TEACHER'), DashboardController.getTeacherDashboard);
router.get('/guardian', authorizeRoles('GUARDIAN'), DashboardController.getGuardianDashboard);

export default router;

