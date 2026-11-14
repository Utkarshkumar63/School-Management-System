import { ReportService } from '../services/reportService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { sendCsv } from '../utils/csvExporter.js';

export class ReportController {
  // Attendance Report
  static async getAttendanceReport(req, res, next) {
    try {
      const { classId, sectionId, startDate, endDate, format } = req.query;
      const data = await ReportService.getAttendanceReport({ classId, sectionId, startDate, endDate });

      if (format === 'csv') {
        const csv = ReportService.exportAttendanceCsv(data);
        return sendCsv(res, `attendance_report_${Date.now()}.csv`, csv);
      }

      return ApiResponse.success(res, { data });
    } catch (error) {
      next(error);
    }
  }

  // Academic Report
  static async getAcademicReport(req, res, next) {
    try {
      const { examId, classId, sectionId, format } = req.query;
      const data = await ReportService.getAcademicReport({ examId, classId, sectionId });

      if (format === 'csv') {
        const csv = ReportService.exportAcademicCsv(data);
        return sendCsv(res, `academic_performance_${Date.now()}.csv`, csv);
      }

      return ApiResponse.success(res, { data });
    } catch (error) {
      next(error);
    }
  }

  // Fee Report
  static async getFeeReport(req, res, next) {
    try {
      const { status, startDate, endDate, format } = req.query;
      const data = await ReportService.getFeeReport({ status, startDate, endDate });

      if (format === 'csv') {
        const csv = ReportService.exportFeeCsv(data);
        return sendCsv(res, `fee_report_${Date.now()}.csv`, csv);
      }

      return ApiResponse.success(res, { data });
    } catch (error) {
      next(error);
    }
  }
}

