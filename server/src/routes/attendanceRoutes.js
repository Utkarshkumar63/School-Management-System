import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles, authorizeTeacherAssignment, authorizeGuardianStudent } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validate.js';
import {
  markSingleAttendanceSchema,
  markBatchAttendanceSchema,
  attendanceQuerySchema,
} from '../validators/attendanceValidator.js';

const router = Router();

router.use(authenticate);

// Mark single attendance (Admin or assigned Teacher)
router.post(
  '/mark',
  authorizeRoles('ADMIN', 'TEACHER'),
  authorizeTeacherAssignment,
  validate(markSingleAttendanceSchema),
  AttendanceController.markSingle
);

// Mark batch attendance (Admin or assigned Teacher)
router.post(
  '/mark-batch',
  authorizeRoles('ADMIN', 'TEACHER'),
  authorizeTeacherAssignment,
  validate(markBatchAttendanceSchema),
  AttendanceController.markBatch
);

// Query attendance records
router.get(
  '/',
  authorizeRoles('ADMIN', 'TEACHER', 'GUARDIAN'),
  validate(attendanceQuerySchema, 'query'),
  authorizeGuardianStudent,
  AttendanceController.getAttendance
);

// Student attendance summary (attendance % per month)
router.get(
  '/student/:studentId/summary',
  authorizeRoles('ADMIN', 'TEACHER', 'GUARDIAN'),
  authorizeGuardianStudent,
  AttendanceController.getStudentSummary
);

// Class attendance summary
router.get(
  '/class/:classId/summary',
  authorizeRoles('ADMIN', 'TEACHER'),
  AttendanceController.getClassSummary
);

export default router;

