import { AttendanceService } from '../services/attendanceService.js';
import { ApiResponse, AppError } from '../utils/apiResponse.js';
import { recordAudit } from '../middlewares/auditMiddleware.js';
import { Guardian } from '../models/Guardian.js';

export class AttendanceController {
  static async markSingle(req, res, next) {
    try {
      const record = await AttendanceService.markSingle({
        ...req.body,
        userId: req.user._id,
      });

      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'ATTENDANCE_MARK',
        entity: 'Attendance',
        entityId: record._id,
        details: {
          student: req.body.student,
          status: req.body.status,
          date: req.body.date,
          session: req.body.session,
        },
        ipAddress: req.ip,
      });

      return ApiResponse.success(res, {
        message: 'Attendance recorded successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markBatch(req, res, next) {
    try {
      const result = await AttendanceService.markBatch({
        ...req.body,
        userId: req.user._id,
      });

      await recordAudit({
        actor: req.user._id,
        actorName: req.user.name,
        role: req.user.role,
        action: 'ATTENDANCE_BATCH_MARK',
        entity: 'Attendance',
        entityId: `${req.body.class}_${req.body.section}_${req.body.date}`,
        details: { count: result.count, date: req.body.date, session: req.body.session },
        ipAddress: req.ip,
      });

      return ApiResponse.success(res, {
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAttendance(req, res, next) {
    try {
      let { classId, sectionId, studentId, student, class: cls, section: sec, date, startDate, endDate, session } = req.query;
      studentId = studentId || student;
      classId = classId || cls;
      sectionId = sectionId || sec;

      if (req.user.role === 'GUARDIAN') {
        const guardian = await Guardian.findOne({ user: req.user._id });
        if (!guardian) throw new AppError('Guardian profile not found', 404);

        if (studentId) {
          const isLinked = guardian.students.some((sId) => sId.toString() === studentId.toString());
          if (!isLinked) {
            throw new AppError('Access forbidden: You are not authorized to view this student attendance.', 403);
          }
        } else {
          studentId = { $in: guardian.students };
        }
      }

      const records = await AttendanceService.getAttendance({
        classId,
        sectionId,
        studentId,
        date,
        startDate,
        endDate,
        session,
      });
      return ApiResponse.success(res, { data: records });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentSummary(req, res, next) {
    try {
      const { studentId } = req.params;
      const { year } = req.query;
      const summary = await AttendanceService.getStudentSummary(studentId, year);
      return ApiResponse.success(res, { data: summary });
    } catch (error) {
      next(error);
    }
  }

  static async getClassSummary(req, res, next) {
    try {
      const { classId } = req.params;
      const { sectionId, date } = req.query;
      const summary = await AttendanceService.getClassSummary(classId, sectionId, date);
      return ApiResponse.success(res, { data: summary });
    } catch (error) {
      next(error);
    }
  }
}

