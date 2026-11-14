import { AppError } from '../utils/apiResponse.js';
import { Teacher } from '../models/Teacher.js';
import { Guardian } from '../models/Guardian.js';
import { TeacherAssignment } from '../models/TeacherAssignment.js';
import { Student } from '../models/Student.js';

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access denied. Role '${req.user.role}' is not authorized.`, 403));
    }
    next();
  };
}

/**
 * Ensures teacher has an active assignment for the target class/section/subject.
 * If user is ADMIN, allowed automatically.
 */
export async function authorizeTeacherAssignment(req, res, next) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.role !== 'TEACHER') {
      throw new AppError('Forbidden: Only teachers and admins can perform this action.', 403);
    }

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      throw new AppError('Teacher profile not found for this user.', 404);
    }

    // Attach teacher info to req
    req.teacher = teacher;

    const classId = req.params.classId || req.body.classId || req.body.class || req.query.classId || req.query.class;
    const sectionId = req.params.sectionId || req.body.sectionId || req.body.section || req.query.sectionId || req.query.section;
    const subjectId = req.params.subjectId || req.body.subjectId || req.body.subject || req.query.subjectId || req.query.subject;

    // If a classId is provided, check assignment
    if (classId) {
      const query = {
        teacher: teacher._id,
        class: classId,
        isActive: true,
      };
      if (sectionId) query.section = sectionId;
      if (subjectId) query.subject = subjectId;

      const assignment = await TeacherAssignment.findOne(query);
      if (!assignment) {
        throw new AppError('Access forbidden: You are not assigned to this class/section/subject.', 403);
      }
      req.assignment = assignment;
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Ensures guardian only accesses data of their linked students.
 * If user is ADMIN or TEACHER (for authorized grading/attendance), bypassed or handled.
 */
export async function authorizeGuardianStudent(req, res, next) {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    if (req.user.role === 'ADMIN' || req.user.role === 'TEACHER') {
      return next();
    }

    if (req.user.role !== 'GUARDIAN') {
      throw new AppError('Access forbidden: Guardian role required.', 403);
    }

    const guardian = await Guardian.findOne({ user: req.user._id });
    if (!guardian) {
      throw new AppError('Guardian profile not found.', 404);
    }

    req.guardian = guardian;

    const studentId = req.params.studentId || req.body.studentId || req.body.student || req.query.studentId || req.query.student;

    if (studentId) {
      const isLinked = guardian.students.some((sId) => sId.toString() === studentId.toString());
      if (!isLinked) {
        throw new AppError('Access forbidden: You are not authorized to view or manage this student.', 403);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

