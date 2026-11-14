import { Student, Attendance, ExamResult, Invoice, Class, Section } from '../models/index.js';
import { jsonToCsv } from '../utils/csvExporter.js';

export class ReportService {
  // ================= Attendance Report =================
  static async getAttendanceReport({ classId, sectionId, startDate, endDate }) {
    const studentQuery = { isActive: true };
    if (classId) studentQuery.class = classId;
    if (sectionId) studentQuery.section = sectionId;

    const students = await Student.find(studentQuery)
      .populate('class', 'name code')
      .populate('section', 'name')
      .sort({ admissionNo: 1 });

    const attQuery = {};
    if (classId) attQuery.class = classId;
    if (sectionId) attQuery.section = sectionId;
    if (startDate || endDate) {
      attQuery.date = {};
      if (startDate) attQuery.date.$gte = new Date(startDate);
      if (endDate) attQuery.date.$lte = new Date(endDate);
    }

    const attendanceRecords = await Attendance.find(attQuery);

    const report = students.map((s) => {
      const records = attendanceRecords.filter((r) => r.student.toString() === s._id.toString());
      const total = records.length;
      const present = records.filter((r) => r.status === 'Present').length;
      const absent = records.filter((r) => r.status === 'Absent').length;
      const late = records.filter((r) => r.status === 'Late').length;
      const excused = records.filter((r) => r.status === 'Excused').length;
      const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

      return {
        studentId: s._id,
        admissionNo: s.admissionNo,
        rollNumber: s.rollNumber,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.class?.name || '',
        sectionName: s.section?.name || '',
        totalSessions: total,
        present,
        absent,
        late,
        excused,
        percentage,
      };
    });

    return report;
  }

  static exportAttendanceCsv(reportData) {
    const fields = [
      { key: 'admissionNo', label: 'Admission No' },
      { key: 'rollNumber', label: 'Roll Number' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'className', label: 'Class' },
      { key: 'sectionName', label: 'Section' },
      { key: 'totalSessions', label: 'Total Sessions' },
      { key: 'present', label: 'Present' },
      { key: 'absent', label: 'Absent' },
      { key: 'late', label: 'Late' },
      { key: 'excused', label: 'Excused' },
      { key: 'percentage', label: 'Attendance %' },
    ];
    return jsonToCsv(reportData, fields);
  }

  // ================= Academic Performance Report =================
  static async getAcademicReport({ examId, classId, sectionId }) {
    const query = {};
    if (examId) query.exam = examId;
    if (classId) query.class = classId;
    if (sectionId) query.section = sectionId;

    const results = await ExamResult.find(query)
      .populate('student', 'firstName lastName admissionNo rollNumber')
      .populate('class', 'name code')
      .populate('section', 'name')
      .populate('exam', 'name term academicYear')
      .sort({ percentage: -1 });

    return results.map((r, index) => ({
      rank: index + 1,
      admissionNo: r.student?.admissionNo || '',
      rollNumber: r.student?.rollNumber || '',
      studentName: r.student ? `${r.student.firstName} ${r.student.lastName}` : '',
      examName: r.exam?.name || '',
      term: r.exam?.term || '',
      className: r.class?.name || '',
      sectionName: r.section?.name || '',
      totalMarksObtained: r.totalMarksObtained,
      totalMaxMarks: r.totalMaxMarks,
      percentage: r.percentage,
      grade: r.grade,
      gradePoint: r.gradePoint,
      isPassed: r.isPassed ? 'Passed' : 'Failed',
    }));
  }

  static exportAcademicCsv(reportData) {
    const fields = [
      { key: 'rank', label: 'Rank' },
      { key: 'admissionNo', label: 'Admission No' },
      { key: 'rollNumber', label: 'Roll No' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'examName', label: 'Exam' },
      { key: 'className', label: 'Class' },
      { key: 'sectionName', label: 'Section' },
      { key: 'totalMarksObtained', label: 'Marks Obtained' },
      { key: 'totalMaxMarks', label: 'Max Marks' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'grade', label: 'Grade' },
      { key: 'isPassed', label: 'Result' },
    ];
    return jsonToCsv(reportData, fields);
  }

  // ================= Fee Report =================
  static async getFeeReport({ status, startDate, endDate }) {
    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .populate({
        path: 'student',
        select: 'firstName lastName admissionNo rollNumber class section',
        populate: [
          { path: 'class', select: 'name code' },
          { path: 'section', select: 'name' },
        ],
      })
      .sort({ dueDate: -1 });

    return invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      admissionNo: inv.student?.admissionNo || '',
      studentName: inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : '',
      className: inv.student?.class?.name || '',
      sectionName: inv.student?.section?.name || '',
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      outstandingAmount: inv.outstandingAmount,
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      status: inv.status,
    }));
  }

  static exportFeeCsv(reportData) {
    const fields = [
      { key: 'invoiceNumber', label: 'Invoice No' },
      { key: 'admissionNo', label: 'Admission No' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'className', label: 'Class' },
      { key: 'sectionName', label: 'Section' },
      { key: 'totalAmount', label: 'Total Invoiced (₹)' },
      { key: 'paidAmount', label: 'Amount Paid (₹)' },
      { key: 'outstandingAmount', label: 'Outstanding Balance (₹)' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'status', label: 'Status' },
    ];
    return jsonToCsv(reportData, fields);
  }
}

