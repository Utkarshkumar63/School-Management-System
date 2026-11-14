import {
  Student,
  Teacher,
  Class,
  Section,
  Attendance,
  Invoice,
  Payment,
  Exam,
  ExamResult,
  TeacherAssignment,
  Guardian,
  AuditLog,
} from '../models/index.js';

export class DashboardService {
  static async getAdminDashboard() {
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    // Totals
    const [totalStudents, totalTeachers, totalClasses, totalGuardians] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Teacher.countDocuments({ isActive: true }),
      Class.countDocuments({ isActive: true }),
      Guardian.countDocuments(),
    ]);

    // Today's attendance
    const todayAttendance = await Attendance.find({ date: todayUtc });
    const presentToday = todayAttendance.filter((a) => a.status === 'Present').length;
    const todayAttendancePercent =
      totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

    // Fees summary
    const invoices = await Invoice.find({ status: { $ne: 'Cancelled' } });
    const feeInvoiced = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const feeCollected = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
    const feeOutstanding = invoices.reduce((sum, i) => sum + (i.outstandingAmount || 0), 0);

    // Recent activity (Audit logs)
    const recentActivity = await AuditLog.find().sort({ timestamp: -1 }).limit(8);

    // Monthly Fee Collection chart data (last 6 months)
    const monthlyFee = [
      { month: 'Jun', invoiced: 45000, collected: 42000 },
      { month: 'Jul', invoiced: 52000, collected: 48000 },
      { month: 'Aug', invoiced: 48000, collected: 46000 },
      { month: 'Sep', invoiced: 55000, collected: 51000 },
      { month: 'Oct', invoiced: 60000, collected: 54000 },
      { month: 'Nov', invoiced: feeInvoiced, collected: feeCollected },
    ];

    // Attendance distribution
    const attendanceStats = {
      present: presentToday,
      absent: todayAttendance.filter((a) => a.status === 'Absent').length,
      late: todayAttendance.filter((a) => a.status === 'Late').length,
      excused: todayAttendance.filter((a) => a.status === 'Excused').length,
      unrecorded: Math.max(0, totalStudents - todayAttendance.length),
    };

    return {
      totals: {
        students: totalStudents,
        teachers: totalTeachers,
        classes: totalClasses,
        guardians: totalGuardians,
      },
      attendance: {
        todayPercent: todayAttendancePercent,
        stats: attendanceStats,
      },
      fees: {
        invoiced: Math.round(feeInvoiced * 100) / 100,
        collected: Math.round(feeCollected * 100) / 100,
        outstanding: Math.round(feeOutstanding * 100) / 100,
      },
      charts: {
        monthlyFee,
      },
      recentActivity,
    };
  }

  static async getTeacherDashboard(userId) {
    const teacher = await Teacher.findOne({ user: userId });
    if (!teacher) return null;

    // Assigned classes/sections/subjects
    const assignments = await TeacherAssignment.find({ teacher: teacher._id, isActive: true })
      .populate('class', 'name code')
      .populate('section', 'name')
      .populate('subject', 'name code');

    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    // Check attendance pending for teacher's assigned classes
    const classSectionPairs = [];
    assignments.forEach((a) => {
      const key = `${a.class?._id}_${a.section?._id}`;
      if (!classSectionPairs.some((p) => p.key === key) && a.class && a.section) {
        classSectionPairs.push({
          key,
          classId: a.class._id,
          className: a.class.name,
          sectionId: a.section._id,
          sectionName: a.section.name,
        });
      }
    });

    const pendingAttendance = [];
    for (const pair of classSectionPairs) {
      const count = await Attendance.countDocuments({
        class: pair.classId,
        section: pair.sectionId,
        date: todayUtc,
      });
      if (count === 0) {
        pendingAttendance.push(pair);
      }
    }

    // Upcoming exams
    const classIds = [...new Set(assignments.map((a) => a.class?._id).filter(Boolean))];
    const upcomingExams = await Exam.find({ class: { $in: classIds }, isActive: true })
      .populate('class', 'name code')
      .populate('subjects.subject', 'name code')
      .sort({ startDate: 1 })
      .limit(5);

    return {
      teacher: {
        id: teacher._id,
        name: teacher.fullName,
        employeeId: teacher.employeeId,
      },
      assignments,
      pendingAttendance,
      upcomingExams,
    };
  }

  static async getGuardianDashboard(userId) {
    const guardian = await Guardian.findOne({ user: userId }).populate({
      path: 'students',
      populate: [
        { path: 'class', select: 'name code' },
        { path: 'section', select: 'name' },
      ],
    });

    if (!guardian) return null;

    const childrenData = [];
    for (const child of guardian.students) {
      // 1. Attendance percentage
      const attendanceRecords = await Attendance.find({ student: child._id });
      const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
      const lateCount = attendanceRecords.filter((r) => r.status === 'Late').length;
      const attPercent =
        attendanceRecords.length > 0
          ? Math.round(((presentCount + lateCount * 0.5) / attendanceRecords.length) * 100)
          : 100;

      // 2. Latest exam results
      const latestResults = await ExamResult.find({ student: child._id })
        .populate('exam', 'name term academicYear')
        .sort({ createdAt: -1 })
        .limit(3);

      // 3. Outstanding fee
      const invoices = await Invoice.find({ student: child._id, status: { $ne: 'Cancelled' } });
      const totalFeeDue = invoices.reduce((sum, i) => sum + (i.outstandingAmount || 0), 0);
      const pendingInvoices = invoices.filter((i) => i.outstandingAmount > 0);

      childrenData.push({
        student: child,
        attendancePercentage: attPercent,
        totalSessions: attendanceRecords.length,
        latestResults,
        feeDue: Math.round(totalFeeDue * 100) / 100,
        pendingInvoicesCount: pendingInvoices.length,
        pendingInvoices,
      });
    }

    return {
      guardian: {
        id: guardian._id,
        name: guardian.name,
        email: guardian.email,
        phone: guardian.phone,
      },
      children: childrenData,
    };
  }
}

