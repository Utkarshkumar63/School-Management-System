import { Attendance, Student, TeacherAssignment, Teacher } from '../models/index.js';
import { AppError } from '../utils/apiResponse.js';

export class AttendanceService {
  /**
   * Helper to normalize date to midnight UTC (YYYY-MM-DD)
   */
  static normalizeDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      throw new AppError('Invalid date provided', 400);
    }
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  static async markSingle({
    student,
    class: classId,
    section: sectionId,
    date,
    session = 'Morning',
    status,
    remarks = '',
    userId,
  }) {
    const normalizedDate = this.normalizeDate(date);

    // Upsert safely to handle duplicates
    const record = await Attendance.findOneAndUpdate(
      {
        student,
        date: normalizedDate,
        session,
      },
      {
        class: classId,
        section: sectionId,
        status,
        remarks,
        recordedBy: userId,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate('student', 'firstName lastName admissionNo rollNumber');

    return record;
  }

  static async markBatch({
    class: classId,
    section: sectionId,
    date,
    session = 'Morning',
    records,
    userId,
  }) {
    const normalizedDate = this.normalizeDate(date);
    const results = [];

    for (const item of records) {
      const record = await Attendance.findOneAndUpdate(
        {
          student: item.student,
          date: normalizedDate,
          session,
        },
        {
          class: classId,
          section: sectionId,
          status: item.status,
          remarks: item.remarks || '',
          recordedBy: userId,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );
      results.push(record);
    }

    return {
      message: `Successfully processed ${results.length} attendance records`,
      count: results.length,
      records: results,
    };
  }

  static async getAttendance({
    classId,
    sectionId,
    studentId,
    date,
    startDate,
    endDate,
    session,
  }) {
    const query = {};
    if (classId) query.class = classId;
    if (sectionId) query.section = sectionId;
    if (studentId) query.student = studentId;
    if (session) query.session = session;

    if (date) {
      const normalized = this.normalizeDate(date);
      query.date = normalized;
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = this.normalizeDate(startDate);
      if (endDate) query.date.$lte = this.normalizeDate(endDate);
    }

    return Attendance.find(query)
      .populate('student', 'firstName lastName admissionNo rollNumber')
      .populate('class', 'name code')
      .populate('section', 'name')
      .populate('recordedBy', 'name role')
      .sort({ date: -1, session: 1 });
  }

  static async getStudentSummary(studentId, year = new Date().getFullYear()) {
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    const records = await Attendance.find({
      student: studentId,
      date: { $gte: startOfYear, $lte: endOfYear },
    });

    const totalDays = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;
    const lateCount = records.filter((r) => r.status === 'Late').length;
    const excusedCount = records.filter((r) => r.status === 'Excused').length;

    const percentage = totalDays > 0 ? ((presentCount + lateCount * 0.5) / totalDays) * 100 : 100;

    // Monthly breakdown
    const monthly = {};
    for (let m = 0; m < 12; m++) {
      monthly[m + 1] = { total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 100 };
    }

    records.forEach((r) => {
      const m = new Date(r.date).getUTCMonth() + 1;
      monthly[m].total++;
      if (r.status === 'Present') monthly[m].present++;
      else if (r.status === 'Absent') monthly[m].absent++;
      else if (r.status === 'Late') monthly[m].late++;
      else if (r.status === 'Excused') monthly[m].excused++;
    });

    Object.keys(monthly).forEach((m) => {
      const t = monthly[m].total;
      monthly[m].percentage = t > 0 ? Math.round(((monthly[m].present + monthly[m].late * 0.5) / t) * 100) : 100;
    });

    return {
      studentId,
      year,
      totalSessions: totalDays,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      excused: excusedCount,
      attendancePercentage: Math.round(percentage * 100) / 100,
      monthly,
    };
  }

  static async getClassSummary(classId, sectionId, date) {
    const normalizedDate = this.normalizeDate(date || new Date().toISOString().split('T')[0]);

    const totalStudents = await Student.countDocuments({
      class: classId,
      ...(sectionId ? { section: sectionId } : {}),
      isActive: true,
    });

    const records = await Attendance.find({
      class: classId,
      ...(sectionId ? { section: sectionId } : {}),
      date: normalizedDate,
    });

    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const excused = records.filter((r) => r.status === 'Excused').length;

    const percentage = totalStudents > 0 ? (present / totalStudents) * 100 : 0;

    return {
      date: normalizedDate,
      totalStudents,
      recordedCount: records.length,
      present,
      absent,
      late,
      excused,
      percentage: Math.round(percentage * 100) / 100,
    };
  }
}

