import { Exam, ExamResult, GradingRule, Student, TeacherAssignment, Teacher } from '../models/index.js';
import { evaluateExamResult, DEFAULT_GRADING_RULES } from '../utils/gradingEngine.js';
import { AppError } from '../utils/apiResponse.js';

export class ExamService {
  // ================= Exams =================
  static async getExams(classId = null) {
    const filter = {};
    if (classId) filter.class = classId;
    return Exam.find(filter)
      .populate('class', 'name code')
      .populate('subjects.subject', 'name code')
      .sort({ createdAt: -1 });
  }

  static async getExamById(id) {
    const exam = await Exam.findById(id)
      .populate('class', 'name code')
      .populate('subjects.subject', 'name code');
    if (!exam) throw new AppError('Exam not found', 404);
    return exam;
  }

  static async createExam(data) {
    return Exam.create(data);
  }

  static async updateExam(id, data) {
    const exam = await Exam.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!exam) throw new AppError('Exam not found', 404);
    return exam;
  }

  static async deleteExam(id) {
    await ExamResult.deleteMany({ exam: id });
    return Exam.findByIdAndDelete(id);
  }

  // ================= Grading Rules =================
  static async getGradingRules() {
    let rules = await GradingRule.find().sort({ minPercentage: -1 });
    if (!rules || rules.length === 0) {
      // Seed default grading rules if none exist
      rules = await GradingRule.insertMany(DEFAULT_GRADING_RULES);
    }
    return rules;
  }

  static async createGradingRule(data) {
    return GradingRule.create(data);
  }

  static async updateGradingRule(id, data) {
    const rule = await GradingRule.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!rule) throw new AppError('Grading rule not found', 404);
    return rule;
  }

  static async deleteGradingRule(id) {
    return GradingRule.findByIdAndDelete(id);
  }

  // ================= Exam Results / Marks =================
  static async enterMarks({
    exam: examId,
    student: studentId,
    class: classId,
    section: sectionId,
    marks,
    remarks = '',
    userId,
    userRole,
  }) {
    // 1. Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) throw new AppError('Exam not found', 404);

    // 2. If Teacher, verify teacher is assigned to each subject entered
    if (userRole === 'TEACHER') {
      const teacher = await Teacher.findOne({ user: userId });
      if (!teacher) throw new AppError('Teacher profile not found', 404);

      const assignments = await TeacherAssignment.find({
        teacher: teacher._id,
        class: classId,
        isActive: true,
      });

      const assignedSubjectIds = assignments.map((a) => a.subject.toString());

      for (const m of marks) {
        if (!assignedSubjectIds.includes(m.subject.toString())) {
          throw new AppError(
            'Forbidden: You are not assigned to teach one or more of these subjects in this class',
            403
          );
        }
      }
    }

    // 3. Validate marks <= maxMarks
    for (const m of marks) {
      const maxMarks = Number(m.maxMarks) || 100;
      const marksObtained = Number(m.marksObtained);
      if (marksObtained > maxMarks) {
        throw new AppError(
          `Marks obtained (${marksObtained}) cannot exceed maximum marks (${maxMarks})`,
          400
        );
      }
    }

    // 4. Fetch active grading rules
    let rules = await GradingRule.find().sort({ minPercentage: -1 });
    if (!rules.length) rules = DEFAULT_GRADING_RULES;

    // 5. Calculate totals, percentage, grade, pass/fail using grading engine
    const evaluation = evaluateExamResult(marks, rules);

    // 6. Upsert result
    const result = await ExamResult.findOneAndUpdate(
      { exam: examId, student: studentId },
      {
        class: classId,
        section: sectionId,
        marks: evaluation.subjects,
        totalMarksObtained: evaluation.totalMarksObtained,
        totalMaxMarks: evaluation.totalMaxMarks,
        percentage: evaluation.percentage,
        grade: evaluation.grade,
        gradePoint: evaluation.gradePoint,
        isPassed: evaluation.isPassed,
        remarks,
        enteredBy: userId,
      },
      { new: true, upsert: true, runValidators: true }
    )
      .populate('student', 'firstName lastName admissionNo rollNumber')
      .populate('marks.subject', 'name code');

    return result;
  }

  static async getExamResults({ examId, classId, sectionId, studentId }) {
    const query = {};
    if (examId) query.exam = examId;
    if (classId) query.class = classId;
    if (sectionId) query.section = sectionId;
    if (studentId) query.student = studentId;

    return ExamResult.find(query)
      .populate('student', 'firstName lastName admissionNo rollNumber')
      .populate('class', 'name code')
      .populate('section', 'name')
      .populate('exam', 'name term academicYear')
      .populate('marks.subject', 'name code')
      .populate('enteredBy', 'name role')
      .sort({ percentage: -1 });
  }

  static async getReportCard(studentId, examId) {
    const student = await Student.findById(studentId)
      .populate('class', 'name code')
      .populate('section', 'name')
      .populate('guardian', 'name email phone relationship');
    if (!student) throw new AppError('Student not found', 404);

    const resultQuery = { student: studentId };
    if (examId) resultQuery.exam = examId;

    const results = await ExamResult.find(resultQuery)
      .populate('exam', 'name term academicYear startDate endDate')
      .populate('marks.subject', 'name code credits')
      .populate('enteredBy', 'name role');

    // Get grading scale
    const gradingScale = await GradingRule.find().sort({ minPercentage: -1 });

    return {
      student,
      results,
      gradingScale: gradingScale.length ? gradingScale : DEFAULT_GRADING_RULES,
      generatedAt: new Date(),
    };
  }
}

