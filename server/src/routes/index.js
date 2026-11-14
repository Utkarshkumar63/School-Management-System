import { Router } from 'express';
import authRoutes from './authRoutes.js';
import academicRoutes from './academicRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import examRoutes from './examRoutes.js';
import feeRoutes from './feeRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import reportRoutes from './reportRoutes.js';
import auditRoutes from './auditRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/academic', academicRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exams', examRoutes);
router.use('/fees', feeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/audit', auditRoutes);

export default router;

