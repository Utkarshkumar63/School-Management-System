import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import app from '../../app.js';
import { connectTestDB, closeTestDB } from '../setup.js';
import {
  User,
  Teacher,
  Guardian,
  Student,
  Class,
  Section,
  Subject,
  TeacherAssignment,
  GradingRule,
  Exam,
  FeeStructure,
  Invoice,
  Payment,
  LedgerEntry,
} from '../../models/index.js';
import { DEFAULT_GRADING_RULES } from '../../utils/gradingEngine.js';
import bcrypt from 'bcryptjs';

describe('Integration Tests: School Management System API', () => {
  let adminToken;
  let teacherToken;
  let guardianToken;

  let adminUser;
  let teacherProfile;
  let guardianProfile;

  let class10;
  let class11;
  let section10A;
  let section10B;
  let section11A;
  let mathSubject;
  let physicsSubject;

  let student1; // linked to demo guardian
  let student2; // not linked to demo guardian

  beforeAll(async () => {
    await connectTestDB();

    const passwordHash = await bcrypt.hash('Test@123', 10);

    // 1. Create Users
    adminUser = await User.create({
      name: 'Admin Test',
      email: 'admin.test@school.test',
      passwordHash,
      role: 'ADMIN',
    });

    const teacherUser = await User.create({
      name: 'Teacher Test',
      email: 'teacher.test@school.test',
      passwordHash,
      role: 'TEACHER',
    });

    const guardianUser = await User.create({
      name: 'Guardian Test',
      email: 'guardian.test@school.test',
      passwordHash,
      role: 'GUARDIAN',
    });

    // 2. Profiles
    teacherProfile = await Teacher.create({
      user: teacherUser._id,
      employeeId: 'TEST-T01',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: teacherUser.email,
      phone: '1234567890',
    });

    guardianProfile = await Guardian.create({
      user: guardianUser._id,
      name: 'Jonathan Sterling',
      email: guardianUser.email,
      phone: '9876543210',
      students: [],
    });

    // 3. Classes, Sections, Subjects
    class10 = await Class.create({ name: 'Grade 10', code: 'G10' });
    class11 = await Class.create({ name: 'Grade 11', code: 'G11' });

    section10A = await Section.create({ name: 'Section A', class: class10._id });
    section10B = await Section.create({ name: 'Section B', class: class10._id });
    section11A = await Section.create({ name: 'Section A', class: class11._id });

    mathSubject = await Subject.create({ name: 'Mathematics', code: 'MATH-10', class: class10._id });
    physicsSubject = await Subject.create({ name: 'Physics', code: 'PHYS-10', class: class10._id });

    // 4. Students
    student1 = await Student.create({
      admissionNo: 'TEST-001',
      firstName: 'Julian',
      lastName: 'Sterling',
      rollNumber: '01',
      class: class10._id,
      section: section10A._id,
      guardian: guardianProfile._id,
      dateOfBirth: new Date(2010, 5, 15),
    });

    student2 = await Student.create({
      admissionNo: 'TEST-002',
      firstName: 'Oliver',
      lastName: 'Other',
      rollNumber: '02',
      class: class10._id,
      section: section10B._id,
      dateOfBirth: new Date(2010, 6, 20),
    });

    // Link student1 to guardianProfile
    guardianProfile.students.push(student1._id);
    await guardianProfile.save();

    // 5. Teacher Assignment: Teacher is assigned ONLY to Grade 10 Section A (Math)
    await TeacherAssignment.create({
      teacher: teacherProfile._id,
      class: class10._id,
      section: section10A._id,
      subject: mathSubject._id,
      academicYear: '2025-2026',
    });

    // 6. Grading Rules
    await GradingRule.insertMany(DEFAULT_GRADING_RULES);

    // 7. Obtain JWT Tokens via Login endpoint
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin.test@school.test',
      password: 'Test@123',
    });
    adminToken = adminLogin.body.data.token;

    const teacherLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'teacher.test@school.test',
      password: 'Test@123',
    });
    teacherToken = teacherLogin.body.data.token;

    const guardianLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'guardian.test@school.test',
      password: 'Test@123',
    });
    guardianToken = guardianLogin.body.data.token;
  }, 90000);

  afterAll(async () => {
    await closeTestDB();
  }, 90000);

  // =========================================================================
  // Requirement (a): Teacher RBAC & Attendance Recording for Assigned Classes
  // =========================================================================
  describe('Acceptance Test 1: Teacher RBAC & Attendance Recording', () => {
    it('allows teacher to record attendance for an ASSIGNED class/section', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/mark')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          student: student1._id.toString(),
          class: class10._id.toString(),
          section: section10A._id.toString(),
          date: '2026-03-01',
          session: 'Morning',
          status: 'Present',
          remarks: 'On time',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Present');
    });

    it('rejects teacher with 403 Forbidden when accessing an UNASSIGNED class (Grade 11)', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/mark')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          student: student1._id.toString(),
          class: class11._id.toString(),
          section: section11A._id.toString(),
          date: '2026-03-01',
          session: 'Morning',
          status: 'Present',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not assigned to this class/i);
    });
  });

  // =========================================================================
  // Requirement (b): Duplicate Attendance Handling (Safely updated / upserted)
  // =========================================================================
  describe('Acceptance Test 2: Attendance Duplicate Handling', () => {
    it('safely updates existing record when recording attendance for same student, date, and session', async () => {
      // First submission: Present
      await request(app)
        .post('/api/v1/attendance/mark')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          student: student1._id.toString(),
          class: class10._id.toString(),
          section: section10A._id.toString(),
          date: '2026-03-02',
          session: 'Morning',
          status: 'Present',
        });

      // Second submission for same student, date, and session: Update to Late
      const updateRes = await request(app)
        .post('/api/v1/attendance/mark')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          student: student1._id.toString(),
          class: class10._id.toString(),
          section: section10A._id.toString(),
          date: '2026-03-02',
          session: 'Morning',
          status: 'Late',
          remarks: 'Updated due to bus delay',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.status).toBe('Late');
      expect(updateRes.body.data.remarks).toBe('Updated due to bus delay');
    });
  });

  // =========================================================================
  // Requirement (c): Exam Result Calculation using Configured Rules
  // =========================================================================
  describe('Acceptance Test 3: Exam Result Calculation from Configured Rules', () => {
    let exam;

    beforeAll(async () => {
      exam = await Exam.create({
        name: 'Midterm Test',
        class: class10._id,
        term: 'Term 1',
        academicYear: '2025-2026',
        subjects: [
          { subject: mathSubject._id, maxMarks: 100, passingMarks: 40 },
          { subject: physicsSubject._id, maxMarks: 100, passingMarks: 40 },
        ],
      });
    });

    it('calculates total, percentage, grade, and pass/fail using DB rules', async () => {
      const res = await request(app)
        .post('/api/v1/exams/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          exam: exam._id.toString(),
          student: student1._id.toString(),
          class: class10._id.toString(),
          section: section10A._id.toString(),
          marks: [
            { subject: mathSubject._id.toString(), marksObtained: 95, maxMarks: 100 },
            { subject: physicsSubject._id.toString(), marksObtained: 85, maxMarks: 100 },
          ],
          remarks: 'Great effort',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalMarksObtained).toBe(180);
      expect(res.body.data.totalMaxMarks).toBe(200);
      expect(res.body.data.percentage).toBe(90);
      expect(res.body.data.grade).toBe('A+');
      expect(res.body.data.isPassed).toBe(true);
    });

    it('rejects marks when marksObtained > maxMarks', async () => {
      const res = await request(app)
        .post('/api/v1/exams/marks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          exam: exam._id.toString(),
          student: student1._id.toString(),
          class: class10._id.toString(),
          section: section10A._id.toString(),
          marks: [
            { subject: mathSubject._id.toString(), marksObtained: 110, maxMarks: 100 }, // Over max
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot exceed maximum marks/i);
    });
  });

  // =========================================================================
  // Requirement (d): Guardian Isolation (Only sees linked student)
  // =========================================================================
  describe('Acceptance Test 4: Guardian Data Isolation', () => {
    it('allows guardian to view report card of their linked child', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/report-card/${student1._id}`)
        .set('Authorization', `Bearer ${guardianToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student._id.toString()).toBe(student1._id.toString());
    });

    it('rejects guardian with 403 Forbidden when attempting to view another student', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/report-card/${student2._id}`)
        .set('Authorization', `Bearer ${guardianToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized to view or manage this student/i);
    });
  });

  // =========================================================================
  // Requirement (e): Fee Reconciliation with Ledger & Conflict Handling
  // =========================================================================
  describe('Acceptance Test 5: Fee Ledger Reconciliation & Payment Rules', () => {
    let invoice;

    beforeAll(async () => {
      // Create invoice for student1
      const invRes = await request(app)
        .post('/api/v1/fees/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          student: student1._id.toString(),
          items: [
            { title: 'Term Tuition', amount: 1000 },
            { title: 'Lab Fee', amount: 200 },
          ],
          dueDate: '2026-04-01',
        });

      invoice = invRes.body.data;
    });

    it('reconciles fee due and paid totals with the student ledger', async () => {
      // Check ledger initial state after invoice
      const ledgerBefore = await request(app)
        .get(`/api/v1/fees/ledger/${student1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(ledgerBefore.body.data.isReconciled).toBe(true);
      expect(ledgerBefore.body.data.netBalance).toBe(1200);

      // Make a partial payment of $500
      const payRes = await request(app)
        .post('/api/v1/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoice: invoice._id,
          amount: 500,
          paymentMethod: 'Online Simulator',
          idempotencyKey: 'idemp-test-rec-1',
        });

      expect(payRes.status).toBe(201);
      expect(payRes.body.data.invoice.status).toBe('Partially Paid');
      expect(payRes.body.data.invoice.outstandingAmount).toBe(700);

      // Check ledger after payment
      const ledgerAfter = await request(app)
        .get(`/api/v1/fees/ledger/${student1._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(ledgerAfter.body.data.isReconciled).toBe(true);
      expect(ledgerAfter.body.data.totalDebits).toBe(1200);
      expect(ledgerAfter.body.data.totalCredits).toBe(500);
      expect(ledgerAfter.body.data.netBalance).toBe(700);
      expect(ledgerAfter.body.data.latestRunningBalance).toBe(700);
    });

    it('negative case: handles duplicate payment idempotently with same idempotency key', async () => {
      const duplicateKey = 'idemp-duplicate-test-key-999';

      // First call
      const firstPay = await request(app)
        .post('/api/v1/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoice: invoice._id,
          amount: 200,
          paymentMethod: 'Online Simulator',
          idempotencyKey: duplicateKey,
        });

      expect(firstPay.status).toBe(201);
      expect(firstPay.body.data.isDuplicate).toBe(false);

      // Second call with same idempotency key (e.g. user double-clicked)
      const secondPay = await request(app)
        .post('/api/v1/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoice: invoice._id,
          amount: 200,
          paymentMethod: 'Online Simulator',
          idempotencyKey: duplicateKey,
        });

      expect(secondPay.status).toBe(200);
      expect(secondPay.body.data.isDuplicate).toBe(true);
      expect(secondPay.body.data.payment._id).toBe(firstPay.body.data.payment._id);
    });

    it('negative case: rejects overpayment when amount exceeds invoice outstanding balance', async () => {
      const res = await request(app)
        .post('/api/v1/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoice: invoice._id,
          amount: 5000, // Exceeds outstanding balance
          paymentMethod: 'Online Simulator',
          idempotencyKey: 'idemp-overpay-test',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Overpayment rejected/i);
    });

    it('negative case: rejects payment on an already fully paid invoice', async () => {
      // Fetch latest invoice state
      const currentInv = await Invoice.findById(invoice._id);

      // Pay off remaining balance
      await request(app)
        .post('/api/v1/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoice: invoice._id,
          amount: currentInv.outstandingAmount,
          idempotencyKey: 'idemp-payoff-full',
        });

      // Try paying again on the now Paid invoice
      const res = await request(app)
        .post('/api/v1/fees/payments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoice: invoice._id,
          amount: 50,
          idempotencyKey: 'idemp-paid-attempt',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already fully paid/i);
    });
  });
});

