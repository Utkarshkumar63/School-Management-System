import { Router } from 'express';
import { AcademicController } from '../controllers/academicController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorizeRoles, authorizeGuardianStudent } from '../middlewares/rbac.js';
import { validate } from '../middlewares/validate.js';
import {
  createClassSchema,
  updateClassSchema,
  createSectionSchema,
  updateSectionSchema,
  createSubjectSchema,
  updateSubjectSchema,
  createStudentSchema,
  updateStudentSchema,
  createGuardianSchema,
  updateGuardianSchema,
  createTeacherSchema,
  updateTeacherSchema,
  createTeacherAssignmentSchema,
  linkGuardianStudentSchema,
} from '../validators/academicValidator.js';

const router = Router();

// Protect all academic routes with authentication
router.use(authenticate);

// ================= Classes =================
router.get('/classes', AcademicController.getClasses);
router.get('/classes/:id', AcademicController.getClassById);
router.post('/classes', authorizeRoles('ADMIN'), validate(createClassSchema), AcademicController.createClass);
router.put('/classes/:id', authorizeRoles('ADMIN'), validate(updateClassSchema), AcademicController.updateClass);
router.delete('/classes/:id', authorizeRoles('ADMIN'), AcademicController.deleteClass);

// ================= Sections =================
router.get('/sections', AcademicController.getSections);
router.post('/sections', authorizeRoles('ADMIN'), validate(createSectionSchema), AcademicController.createSection);
router.put('/sections/:id', authorizeRoles('ADMIN'), validate(updateSectionSchema), AcademicController.updateSection);
router.delete('/sections/:id', authorizeRoles('ADMIN'), AcademicController.deleteSection);

// ================= Subjects =================
router.get('/subjects', AcademicController.getSubjects);
router.post('/subjects', authorizeRoles('ADMIN'), validate(createSubjectSchema), AcademicController.createSubject);
router.put('/subjects/:id', authorizeRoles('ADMIN'), validate(updateSubjectSchema), AcademicController.updateSubject);
router.delete('/subjects/:id', authorizeRoles('ADMIN'), AcademicController.deleteSubject);

// ================= Students =================
router.get('/students', authorizeRoles('ADMIN', 'TEACHER'), AcademicController.getStudents);
router.get('/students/:id', authorizeRoles('ADMIN', 'TEACHER', 'GUARDIAN'), (req, res, next) => {
  req.params.studentId = req.params.id;
  return authorizeGuardianStudent(req, res, next);
}, AcademicController.getStudentById);
router.post('/students', authorizeRoles('ADMIN'), validate(createStudentSchema), AcademicController.createStudent);
router.put('/students/:id', authorizeRoles('ADMIN'), validate(updateStudentSchema), AcademicController.updateStudent);
router.delete('/students/:id', authorizeRoles('ADMIN'), AcademicController.deleteStudent);

// ================= Guardians =================
router.get('/guardians', authorizeRoles('ADMIN'), AcademicController.getGuardians);
router.post('/guardians', authorizeRoles('ADMIN'), validate(createGuardianSchema), AcademicController.createGuardian);
router.put('/guardians/:id', authorizeRoles('ADMIN'), validate(updateGuardianSchema), AcademicController.updateGuardian);
router.delete('/guardians/:id', authorizeRoles('ADMIN'), AcademicController.deleteGuardian);
router.post('/guardians/link', authorizeRoles('ADMIN'), validate(linkGuardianStudentSchema), AcademicController.linkGuardianStudent);

// ================= Teachers =================
router.get('/teachers', authorizeRoles('ADMIN'), AcademicController.getTeachers);
router.post('/teachers', authorizeRoles('ADMIN'), validate(createTeacherSchema), AcademicController.createTeacher);
router.put('/teachers/:id', authorizeRoles('ADMIN'), validate(updateTeacherSchema), AcademicController.updateTeacher);
router.delete('/teachers/:id', authorizeRoles('ADMIN'), AcademicController.deleteTeacher);

// ================= Assignments =================
router.get('/assignments/my', authorizeRoles('TEACHER'), AcademicController.getMyAssignments);
router.get('/assignments', authorizeRoles('ADMIN'), AcademicController.getTeacherAssignments);
router.post('/assignments', authorizeRoles('ADMIN'), validate(createTeacherAssignmentSchema), AcademicController.assignTeacher);
router.delete('/assignments/:id', authorizeRoles('ADMIN'), AcademicController.removeTeacherAssignment);

export default router;

