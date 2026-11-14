import { ExamService } from '../services/examService.js';
import { ApiResponse, AppError } from '../utils/apiResponse.js';
import { recordAudit } from '../middlewares/auditMiddleware.js';
import { Guardian } from '../models/Guardian.js';

export class ExamController {
  // Exams
  static async getExams(req, res, next) {
    try {
      const exams = await ExamService.getExams(req.query.classId);
      return ApiResponse.success(res, { data: exams });
    } catch (error) {
      next(error);
    }
  }

  static async getExamById(req, res, next) {
    try {
      const exam = await ExamService.getExamById(req.params.id);
      return ApiResponse.success(res, { data: exam });
    } catch (error) {
      next(error);
    }
  }

  static async createExam(req, res, next) {
    try {
      const exam = await ExamService.createExam(req.body);
      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'CREATE_EXAM',
        entity: 'Exam',
        entityId: exam._id,
        details: { name: exam.name, class: exam.class },
        ipAddress: req.ip,
      });
      return ApiResponse.created(res, { message: 'Exam created successfully', data: exam });
    } catch (error) {
      next(error);
    }
  }

  static async updateExam(req, res, next) {
    try {
      const exam = await ExamService.updateExam(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Exam updated successfully', data: exam });
    } catch (error) {
      next(error);
    }
  }

  static async deleteExam(req, res, next) {
    try {
      await ExamService.deleteExam(req.params.id);
      return ApiResponse.success(res, { message: 'Exam deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Grading Rules
  static async getGradingRules(req, res, next) {
    try {
      const rules = await ExamService.getGradingRules();
      return ApiResponse.success(res, { data: rules });
    } catch (error) {
      next(error);
    }
  }

  static async createGradingRule(req, res, next) {
    try {
      const rule = await ExamService.createGradingRule(req.body);
      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'CREATE_GRADING_RULE',
        entity: 'GradingRule',
        entityId: rule._id,
        details: req.body,
        ipAddress: req.ip,
      });
      return ApiResponse.created(res, { message: 'Grading rule created', data: rule });
    } catch (error) {
      next(error);
    }
  }

  static async updateGradingRule(req, res, next) {
    try {
      const rule = await ExamService.updateGradingRule(req.params.id, req.body);
      return ApiResponse.success(res, { message: 'Grading rule updated', data: rule });
    } catch (error) {
      next(error);
    }
  }

  static async deleteGradingRule(req, res, next) {
    try {
      await ExamService.deleteGradingRule(req.params.id);
      return ApiResponse.success(res, { message: 'Grading rule deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Marks Entry
  static async enterMarks(req, res, next) {
    try {
      const result = await ExamService.enterMarks({
        ...req.body,
        userId: req.user._id,
        userRole: req.user.role,
      });

      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'MARKS_ENTRY',
        entity: 'ExamResult',
        entityId: result._id,
        details: {
          exam: req.body.exam,
          student: req.body.student,
          percentage: result.percentage,
          grade: result.grade,
        },
        ipAddress: req.ip,
      });

      return ApiResponse.success(res, {
        message: 'Marks recorded and result calculated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExamResults(req, res, next) {
    try {
      let { examId, classId, sectionId, studentId } = req.query;

      if (req.user.role === 'GUARDIAN') {
        const guardian = await Guardian.findOne({ user: req.user._id });
        if (!guardian) throw new AppError('Guardian profile not found', 404);

        if (studentId) {
          const isLinked = guardian.students.some((sId) => sId.toString() === studentId.toString());
          if (!isLinked) {
            throw new AppError('Access forbidden: You are not authorized to view this student result.', 403);
          }
        } else {
          studentId = { $in: guardian.students };
        }
      }

      const results = await ExamService.getExamResults({ examId, classId, sectionId, studentId });
      return ApiResponse.success(res, { data: results });
    } catch (error) {
      next(error);
    }
  }

  static async getReportCard(req, res, next) {
    try {
      const { studentId } = req.params;
      const { examId } = req.query;
      const report = await ExamService.getReportCard(studentId, examId);
      return ApiResponse.success(res, { data: report });
    } catch (error) {
      next(error);
    }
  }
}

