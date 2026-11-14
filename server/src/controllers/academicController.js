import { AcademicService } from '../services/academicService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { recordAudit } from '../middlewares/auditMiddleware.js';

export class AcademicController {
  // Classes
  static async getClasses(req, res, next) {
    try {
      const classes = await AcademicService.getClasses();
      return ApiResponse.success(res, { data: classes });
    } catch (error) {
      next(error);
    }
  }

  static async getClassById(req, res, next) {
    try {
      const cls = await AcademicService.getClassById(req.params.id);
      return ApiResponse.success(res, { data: cls });
    } catch (error) {
      next(error);
    }
  }

  static async createClass(req, res, next) {
    try {
      const cls = await AcademicService.createClass(req.body);
      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'CREATE_CLASS',
        entity: 'Class',
        entityId: cls._id,
        details: { name: cls.name, code: cls.code },
        ipAddress: req.ip,
      });
      return ApiResponse.created(res, { message: 'Class created', data: cls });
    } catch (error) {
      next(error);
    }
  }

  static async updateClass(req, res, next) {
    try {
      const cls = await AcademicService.updateClass(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Class updated', data: cls });
    } catch (error) {
      next(error);
    }
  }

  static async deleteClass(req, res, next) {
    try {
      await AcademicService.deleteClass(req.params.id);
      return ApiResponse.success(res, { message: 'Class deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Sections
  static async getSections(req, res, next) {
    try {
      const sections = await AcademicService.getSections(req.query.classId);
      return ApiResponse.success(res, { data: sections });
    } catch (error) {
      next(error);
    }
  }

  static async createSection(req, res, next) {
    try {
      const sec = await AcademicService.createSection(req.body);
      return ApiResponse.created(res, { message: 'Section created', data: sec });
    } catch (error) {
      next(error);
    }
  }

  static async updateSection(req, res, next) {
    try {
      const sec = await AcademicService.updateSection(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Section updated', data: sec });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSection(req, res, next) {
    try {
      await AcademicService.deleteSection(req.params.id);
      return ApiResponse.success(res, { message: 'Section deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Subjects
  static async getSubjects(req, res, next) {
    try {
      const subjects = await AcademicService.getSubjects(req.query.classId);
      return ApiResponse.success(res, { data: subjects });
    } catch (error) {
      next(error);
    }
  }

  static async createSubject(req, res, next) {
    try {
      const sub = await AcademicService.createSubject(req.body);
      return ApiResponse.created(res, { message: 'Subject created', data: sub });
    } catch (error) {
      next(error);
    }
  }

  static async updateSubject(req, res, next) {
    try {
      const sub = await AcademicService.updateSubject(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Subject updated', data: sub });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubject(req, res, next) {
    try {
      await AcademicService.deleteSubject(req.params.id);
      return ApiResponse.success(res, { message: 'Subject deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Students
  static async getStudents(req, res, next) {
    try {
      const { page, limit, search, classId, sectionId } = req.query;
      const result = await AcademicService.getStudents({ page, limit, search, classId, sectionId });
      return ApiResponse.success(res, {
        data: result.students,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentById(req, res, next) {
    try {
      const student = await AcademicService.getStudentById(req.params.id);
      return ApiResponse.success(res, { data: student });
    } catch (error) {
      next(error);
    }
  }

  static async createStudent(req, res, next) {
    try {
      const student = await AcademicService.createStudent(req.body);
      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'CREATE_STUDENT',
        entity: 'Student',
        entityId: student._id,
        details: { admissionNo: student.admissionNo, name: student.fullName },
        ipAddress: req.ip,
      });
      return ApiResponse.created(res, { message: 'Student created successfully', data: student });
    } catch (error) {
      next(error);
    }
  }

  static async updateStudent(req, res, next) {
    try {
      const student = await AcademicService.updateStudent(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Student updated successfully', data: student });
    } catch (error) {
      next(error);
    }
  }

  static async deleteStudent(req, res, next) {
    try {
      await AcademicService.deleteStudent(req.params.id);
      return ApiResponse.success(res, { message: 'Student deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Guardians
  static async getGuardians(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const result = await AcademicService.getGuardians({ page, limit, search });
      return ApiResponse.success(res, {
        data: result.guardians,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createGuardian(req, res, next) {
    try {
      const guardian = await AcademicService.createGuardian(req.body);
      return ApiResponse.created(res, { message: 'Guardian created successfully', data: guardian });
    } catch (error) {
      next(error);
    }
  }

  static async linkGuardianStudent(req, res, next) {
    try {
      const { guardianId, studentId } = req.body;
      const result = await AcademicService.linkGuardianStudent(guardianId, studentId);
      return ApiResponse.success(res, { message: result.message, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateGuardian(req, res, next) {
    try {
      const guardian = await AcademicService.updateGuardian(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Guardian updated successfully', data: guardian });
    } catch (error) {
      next(error);
    }
  }

  static async deleteGuardian(req, res, next) {
    try {
      await AcademicService.deleteGuardian(req.params.id);
      return ApiResponse.success(res, { message: 'Guardian deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Teachers
  static async getTeachers(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const result = await AcademicService.getTeachers({ page, limit, search });
      return ApiResponse.success(res, {
        data: result.teachers,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTeacher(req, res, next) {
    try {
      const teacher = await AcademicService.createTeacher(req.body);
      return ApiResponse.created(res, { message: 'Teacher created successfully', data: teacher });
    } catch (error) {
      next(error);
    }
  }

  static async updateTeacher(req, res, next) {
    try {
      const teacher = await AcademicService.updateTeacher(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Teacher updated successfully', data: teacher });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTeacher(req, res, next) {
    try {
      await AcademicService.deleteTeacher(req.params.id);
      return ApiResponse.success(res, { message: 'Teacher deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Teacher Assignments
  static async getTeacherAssignments(req, res, next) {
    try {
      const assignments = await AcademicService.getTeacherAssignments(req.query);
      return ApiResponse.success(res, { data: assignments });
    } catch (error) {
      next(error);
    }
  }

  static async assignTeacher(req, res, next) {
    try {
      const assignment = await AcademicService.assignTeacher(req.body);
      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'ASSIGN_TEACHER',
        entity: 'TeacherAssignment',
        entityId: assignment._id,
        details: req.body,
        ipAddress: req.ip,
      });
      return ApiResponse.created(res, { message: 'Teacher assigned successfully', data: assignment });
    } catch (error) {
      next(error);
    }
  }

  static async removeTeacherAssignment(req, res, next) {
    try {
      await AcademicService.removeTeacherAssignment(req.params.id);
      return ApiResponse.success(res, { message: 'Assignment removed successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getMyAssignments(req, res, next) {
    try {
      const assignments = await AcademicService.getAssignmentsForTeacher(req.user._id);
      return ApiResponse.success(res, { data: assignments });
    } catch (error) {
      next(error);
    }
  }
}

