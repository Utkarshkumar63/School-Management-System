import { Router } from 'express';
import { ExamController } from '../controllers/examController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles, authorizeTeacherAssignment, authorizeGuardianStudent } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validate.js';
import {
  createExamSchema,
  enterMarksSchema,
  createGradingRuleSchema,
  updateGradingRuleSchema,
} from '../validators/examValidator.js';

const router = Router();

router.use(authenticate);

// ================= Exams =================
router.get('/', authorizeRoles('ADMIN', 'TEACHER', 'GUARDIAN'), ExamController.getExams);
router.get('/:id', authorizeRoles('ADMIN', 'TEACHER', 'GUARDIAN'), ExamController.getExamById);
router.post('/', authorizeRoles('ADMIN'), validate(createExamSchema), ExamController.createExam);
router.put('/:id', authorizeRoles('ADMIN'), ExamController.updateExam);
router.delete('/:id', authorizeRoles('ADMIN'), ExamController.deleteExam);

// ================= Grading Rules =================
router.get('/grading/rules', authorizeRoles('ADMIN', 'TEACHER', 'GUARDIAN'), ExamController.getGradingRules);
router.post('/grading/rules', authorizeRoles('ADMIN'), validate(createGradingRuleSchema), ExamController.createGradingRule);
router.put('/grading/rules/:id', authorizeRoles('ADMIN'), validate(updateGradingRuleSchema), ExamController.updateGradingRule);
router.delete('/grading/rules/:id', authorizeRoles('ADMIN'), ExamController.deleteGradingRule);

// ================= Marks & Results =================
router.post(
  '/marks',
  authorizeRoles('ADMIN', 'TEACHER'),
  authorizeTeacherAssignment,
  validate(enterMarksSchema),
  ExamController.enterMarks
);

router.get('/results/list', authorizeRoles('ADMIN', 'TEACHER', 'GUARDIAN'), authorizeGuardianStudent, ExamController.getExamResults);

// Report Card
router.get(
  '/report-card/:studentId',
  authorizeRoles('ADMIN', 'TEACHER', 'GUARDIAN'),
  authorizeGuardianStudent,
  ExamController.getReportCard
);

export default router;

