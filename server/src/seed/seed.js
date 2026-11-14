import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  User,
  Class,
  Section,
  Subject,
  Teacher,
  Guardian,
  Student,
  TeacherAssignment,
  Attendance,
  GradingRule,
  Exam,
  ExamResult,
  FeeStructure,
  Invoice,
  Payment,
  LedgerEntry,
  AuditLog,
} from '../models/index.js';
import { DEFAULT_GRADING_RULES, evaluateExamResult } from '../utils/gradingEngine.js';
import { LedgerService } from '../services/ledgerService.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management_db';

export async function runSeed() {
  console.log(`[Seed] Connecting to MongoDB: ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log('[Seed] Connected. Clearing existing collections...');

  await Promise.all([
    User.deleteMany({}),
    Class.deleteMany({}),
    Section.deleteMany({}),
    Subject.deleteMany({}),
    Teacher.deleteMany({}),
    Guardian.deleteMany({}),
    Student.deleteMany({}),
    TeacherAssignment.deleteMany({}),
    Attendance.deleteMany({}),
    GradingRule.deleteMany({}),
    Exam.deleteMany({}),
    ExamResult.deleteMany({}),
    FeeStructure.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
    LedgerEntry.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log('[Seed] Database cleaned.');

  // 1. Password Hashes
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const teacherHash = await bcrypt.hash('Teacher@123', 10);
  const guardianHash = await bcrypt.hash('Guardian@123', 10);

  // 2. Users
  console.log('[Seed] Creating Users...');
  const adminUser = await User.create({
    name: 'Dr. Arthur Pendelton',
    email: 'admin@school.test',
    passwordHash: adminHash,
    role: 'ADMIN',
  });

  const teacherUsers = await User.create([
    {
      name: 'Prof. Marcus Vance',
      email: 'teacher@school.test',
      passwordHash: teacherHash,
      role: 'TEACHER',
    },
    {
      name: 'Ms. Eleanor Davies',
      email: 'eleanor.davies@school.test',
      passwordHash: teacherHash,
      role: 'TEACHER',
    },
    {
      name: 'Mr. Robert Chen',
      email: 'robert.chen@school.test',
      passwordHash: teacherHash,
      role: 'TEACHER',
    },
  ]);

  const guardianUsers = await User.create([
    {
      name: 'Jonathan Sterling',
      email: 'guardian@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Helena Montgomery',
      email: 'helena.m@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'David & Clara Kim',
      email: 'kim.family@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Samuel Thorne',
      email: 'samuel.thorne@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Vivian Westwood',
      email: 'vivian.w@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Alexander Wright',
      email: 'alex.wright@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Arthur Morgan',
      email: 'arthur.morgan@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Elena Sinclair',
      email: 'elena.sinclair@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Marcus Russell',
      email: 'marcus.russell@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Thomas Hayes',
      email: 'thomas.hayes@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Robert Foster',
      email: 'robert.foster@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Charles Bennett',
      email: 'charles.bennett@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Edward Reed',
      email: 'edward.reed@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'Walter Powell',
      email: 'walter.powell@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
    {
      name: 'James Sullivan',
      email: 'james.sullivan@school.test',
      passwordHash: guardianHash,
      role: 'GUARDIAN',
    },
  ]);

  // 3. Teachers Profiles
  console.log('[Seed] Creating Teacher profiles...');
  const teachers = await Teacher.create([
    {
      user: teacherUsers[0]._id,
      employeeId: 'EMP-T101',
      firstName: 'Marcus',
      lastName: 'Vance',
      email: 'teacher@school.test',
      phone: '+1 555-0101',
      qualification: 'M.Sc. Pure Mathematics, Oxford',
      specialization: 'Advanced Mathematics & Calculus',
    },
    {
      user: teacherUsers[1]._id,
      employeeId: 'EMP-T102',
      firstName: 'Eleanor',
      lastName: 'Davies',
      email: 'eleanor.davies@school.test',
      phone: '+1 555-0102',
      qualification: 'M.Sc. Physics, Cambridge',
      specialization: 'Theoretical & Applied Physics',
    },
    {
      user: teacherUsers[2]._id,
      employeeId: 'EMP-T103',
      firstName: 'Robert',
      lastName: 'Chen',
      email: 'robert.chen@school.test',
      phone: '+1 555-0103',
      qualification: 'B.Tech Computer Science, Stanford',
      specialization: 'Computer Science & English Literature',
    },
  ]);

  // 4. Classes
  console.log('[Seed] Creating Classes, Sections, Subjects...');
  const classes = await Class.create([
    { name: 'Grade 9', code: 'G9', order: 1 },
    { name: 'Grade 10', code: 'G10', order: 2 },
    { name: 'Grade 11', code: 'G11', order: 3 },
  ]);

  // 5. Sections
  const sections = await Section.create([
    { name: 'Section A', class: classes[0]._id, capacity: 35 },
    { name: 'Section B', class: classes[0]._id, capacity: 35 },
    { name: 'Section A', class: classes[1]._id, capacity: 35 },
    { name: 'Section B', class: classes[1]._id, capacity: 35 },
    { name: 'Section A', class: classes[2]._id, capacity: 30 },
  ]);

  // 6. Subjects for Grade 10 (main focus class) & Grade 9
  const subjects = await Subject.create([
    { name: 'Mathematics', code: 'MATH-10', class: classes[1]._id, credits: 4 },
    { name: 'Physics', code: 'PHYS-10', class: classes[1]._id, credits: 4 },
    { name: 'English Literature', code: 'ENG-10', class: classes[1]._id, credits: 3 },
    { name: 'Computer Science', code: 'CS-10', class: classes[1]._id, credits: 3 },
    { name: 'General Science', code: 'SCI-9', class: classes[0]._id, credits: 4 },
    { name: 'Mathematics 9', code: 'MATH-9', class: classes[0]._id, credits: 4 },
  ]);

  // 7. Teacher Assignments
  console.log('[Seed] Assigning Teachers...');
  // Marcus Vance teaches Math in Grade 10 Sec A & Sec B
  await TeacherAssignment.create([
    {
      teacher: teachers[0]._id,
      class: classes[1]._id,
      section: sections[2]._id, // Grade 10 Sec A
      subject: subjects[0]._id, // Math
      academicYear: '2025-2026',
    },
    {
      teacher: teachers[0]._id,
      class: classes[1]._id,
      section: sections[3]._id, // Grade 10 Sec B
      subject: subjects[0]._id, // Math
      academicYear: '2025-2026',
    },
    // Eleanor Davies teaches Physics in Grade 10 Sec A
    {
      teacher: teachers[1]._id,
      class: classes[1]._id,
      section: sections[2]._id,
      subject: subjects[1]._id, // Physics
      academicYear: '2025-2026',
    },
    // Robert Chen teaches Computer Science in Grade 10 Sec A
    {
      teacher: teachers[2]._id,
      class: classes[1]._id,
      section: sections[2]._id,
      subject: subjects[3]._id, // CS
      academicYear: '2025-2026',
    },
  ]);

  // 8. Guardians & Students
  console.log('[Seed] Creating Guardians & 30 Students...');
  const guardians = await Guardian.create([
    {
      user: guardianUsers[0]._id,
      name: 'Jonathan Sterling',
      email: 'guardian@school.test',
      phone: '+1 555-0201',
      relationship: 'Father',
      occupation: 'Civil Engineer',
      address: '742 Evergreen Terrace, Springfield',
    },
    {
      user: guardianUsers[1]._id,
      name: 'Helena Montgomery',
      email: 'helena.m@school.test',
      phone: '+1 555-0202',
      relationship: 'Mother',
      occupation: 'Architect',
      address: '12 Kensington Gardens, Highbury',
    },
    {
      user: guardianUsers[2]._id,
      name: 'David Kim',
      email: 'kim.family@school.test',
      phone: '+1 555-0203',
      relationship: 'Father',
      occupation: 'Financial Analyst',
      address: '88 Maple Street, Westwood',
    },
    {
      user: guardianUsers[3]._id,
      name: 'Samuel Thorne',
      email: 'samuel.thorne@school.test',
      phone: '+1 555-0204',
      relationship: 'Legal Guardian',
      occupation: 'Attorney',
      address: '405 Beacon Court, Boston',
    },
    {
      user: guardianUsers[4]._id,
      name: 'Vivian Westwood',
      email: 'vivian.w@school.test',
      phone: '+1 555-0205',
      relationship: 'Mother',
      occupation: 'Pediatrician',
      address: '19 Oxford Crescent, Cambridge',
    },
    {
      user: guardianUsers[5]._id,
      name: 'Alexander Wright',
      email: 'alex.wright@school.test',
      phone: '+1 555-0206',
      relationship: 'Father',
      occupation: 'Software Director',
      address: '33 Silicon Way, San Jose',
    },
    {
      user: guardianUsers[6]._id,
      name: 'Arthur Morgan',
      email: 'arthur.morgan@school.test',
      phone: '+1 555-0207',
      relationship: 'Father',
      occupation: 'Senior Geologist',
      address: '14 Highfield Road, Bristol',
    },
    {
      user: guardianUsers[7]._id,
      name: 'Elena Sinclair',
      email: 'elena.sinclair@school.test',
      phone: '+1 555-0208',
      relationship: 'Mother',
      occupation: 'Professor of Literature',
      address: '29 Queen Street, Edinburgh',
    },
    {
      user: guardianUsers[8]._id,
      name: 'Marcus Russell',
      email: 'marcus.russell@school.test',
      phone: '+1 555-0209',
      relationship: 'Father',
      occupation: 'Aerospace Consultant',
      address: '50 Victoria Place, London',
    },
    {
      user: guardianUsers[9]._id,
      name: 'Thomas Hayes',
      email: 'thomas.hayes@school.test',
      phone: '+1 555-0210',
      relationship: 'Father',
      occupation: 'Chartered Accountant',
      address: '11 Park Terrace, Manchester',
    },
    {
      user: guardianUsers[10]._id,
      name: 'Robert Foster',
      email: 'robert.foster@school.test',
      phone: '+1 555-0211',
      relationship: 'Father',
      occupation: 'Vascular Surgeon',
      address: '88 Belmont Avenue, Surrey',
    },
    {
      user: guardianUsers[11]._id,
      name: 'Charles Bennett',
      email: 'charles.bennett@school.test',
      phone: '+1 555-0212',
      relationship: 'Legal Guardian',
      occupation: 'Senior Architect',
      address: '7 Meadow Way, Oxford',
    },
    {
      user: guardianUsers[12]._id,
      name: 'Edward Reed',
      email: 'edward.reed@school.test',
      phone: '+1 555-0213',
      relationship: 'Father',
      occupation: 'Biochemical Researcher',
      address: '92 College Green, Dublin',
    },
    {
      user: guardianUsers[13]._id,
      name: 'Walter Powell',
      email: 'walter.powell@school.test',
      phone: '+1 555-0214',
      relationship: 'Father',
      occupation: 'Electrical Engineer',
      address: '64 Willow Gardens, Leeds',
    },
    {
      user: guardianUsers[14]._id,
      name: 'James Sullivan',
      email: 'james.sullivan@school.test',
      phone: '+1 555-0215',
      relationship: 'Father',
      occupation: 'Financial Executive',
      address: '18 Castle View, Windsor',
    },
  ]);

  // 30 Students roster: Exactly 2 children per family guardian (100% realistic relationship isolation)
  const studentNames = [
    // Family 0: Jonathan Sterling (Demo Guardian - exactly 2 children)
    { first: 'Julian', last: 'Sterling', gIndex: 0, cIndex: 1, sIndex: 2 },
    { first: 'Beatrice', last: 'Sterling', gIndex: 0, cIndex: 1, sIndex: 2 },
    // Family 1: Helena Montgomery
    { first: 'Oliver', last: 'Montgomery', gIndex: 1, cIndex: 1, sIndex: 2 },
    { first: 'Clara', last: 'Montgomery', gIndex: 1, cIndex: 0, sIndex: 0 },
    // Family 2: David & Clara Kim
    { first: 'Min-Jun', last: 'Kim', gIndex: 2, cIndex: 1, sIndex: 2 },
    { first: 'Hannah', last: 'Kim', gIndex: 2, cIndex: 1, sIndex: 3 },
    // Family 3: Samuel Thorne
    { first: 'Lucas', last: 'Thorne', gIndex: 3, cIndex: 1, sIndex: 2 },
    { first: 'Chloe', last: 'Thorne', gIndex: 3, cIndex: 0, sIndex: 1 },
    // Family 4: Vivian Westwood
    { first: 'Charlotte', last: 'Westwood', gIndex: 4, cIndex: 1, sIndex: 2 },
    { first: 'Leo', last: 'Westwood', gIndex: 4, cIndex: 0, sIndex: 1 },
    // Family 5: Alexander Wright
    { first: 'Ethan', last: 'Wright', gIndex: 5, cIndex: 1, sIndex: 2 },
    { first: 'Sophia', last: 'Wright', gIndex: 5, cIndex: 2, sIndex: 4 },
    // Family 6: Arthur Morgan
    { first: 'Emily', last: 'Morgan', gIndex: 6, cIndex: 1, sIndex: 3 },
    { first: 'Daniel', last: 'Morgan', gIndex: 6, cIndex: 1, sIndex: 3 },
    // Family 7: Elena Sinclair
    { first: 'Kira', last: 'Sinclair', gIndex: 7, cIndex: 0, sIndex: 0 },
    { first: 'Liam', last: 'Sinclair', gIndex: 7, cIndex: 0, sIndex: 0 },
    // Family 8: Marcus Russell
    { first: 'Quinn', last: 'Russell', gIndex: 8, cIndex: 2, sIndex: 4 },
    { first: 'Rose', last: 'Russell', gIndex: 8, cIndex: 2, sIndex: 4 },
    // Family 9: Thomas Hayes
    { first: 'Alexander', last: 'Hayes', gIndex: 9, cIndex: 1, sIndex: 2 },
    { first: 'Amelia', last: 'Hayes', gIndex: 9, cIndex: 1, sIndex: 2 },
    // Family 10: Robert Foster
    { first: 'Benjamin', last: 'Foster', gIndex: 10, cIndex: 1, sIndex: 2 },
    { first: 'Henry', last: 'Foster', gIndex: 10, cIndex: 1, sIndex: 3 },
    // Family 11: Charles Bennett
    { first: 'Chloe', last: 'Bennett', gIndex: 11, cIndex: 1, sIndex: 2 },
    { first: 'Jack', last: 'Bennett', gIndex: 11, cIndex: 1, sIndex: 3 },
    // Family 12: Edward Reed
    { first: 'Daniel', last: 'Reed', gIndex: 12, cIndex: 1, sIndex: 2 },
    { first: 'Isabella', last: 'Reed', gIndex: 12, cIndex: 1, sIndex: 3 },
    // Family 13: Walter Powell
    { first: 'Felix', last: 'Powell', gIndex: 13, cIndex: 1, sIndex: 3 },
    { first: 'Grace', last: 'Powell', gIndex: 13, cIndex: 1, sIndex: 3 },
    // Family 14: James Sullivan
    { first: 'Noah', last: 'Sullivan', gIndex: 14, cIndex: 0, sIndex: 1 },
    { first: 'Olivia', last: 'Sullivan', gIndex: 14, cIndex: 0, sIndex: 1 },
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const item = studentNames[i];
    const admissionNo = `ADM-2025-${String(i + 1).padStart(3, '0')}`;
    const rollNumber = String((i % 15) + 1).padStart(2, '0');
    const guardian = guardians[item.gIndex];
    const targetClass = classes[item.cIndex];
    const targetSection = sections[item.sIndex];

    const student = await Student.create({
      admissionNo,
      firstName: item.first,
      lastName: item.last,
      rollNumber,
      class: targetClass._id,
      section: targetSection._id,
      guardian: guardian._id,
      dateOfBirth: new Date(2010, i % 12, (i % 25) + 1),
      gender: i % 2 === 0 ? 'Male' : 'Female',
      address: guardian.address,
      contactNumber: guardian.phone,
    });

    students.push(student);

    // Link to guardian
    await Guardian.findByIdAndUpdate(guardian._id, {
      $addToSet: { students: student._id },
    });
  }

  // 9. Grading Rules
  console.log('[Seed] Seeding Grading Rules...');
  await GradingRule.insertMany(DEFAULT_GRADING_RULES);

  // 10. Sample Attendance
  console.log('[Seed] Seeding Attendance records...');
  const grade10Students = students.filter((s) => s.class.toString() === classes[1]._id.toString());
  const today = new Date();

  // Create attendance for past 5 school days
  for (let d = 4; d >= 0; d--) {
    const attDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - d));
    for (const student of grade10Students) {
      // 90% Present, 5% Late, 5% Absent
      const rand = Math.random();
      let status = 'Present';
      if (rand < 0.05) status = 'Absent';
      else if (rand < 0.10) status = 'Late';

      await Attendance.create({
        student: student._id,
        class: student.class,
        section: student.section,
        date: attDate,
        session: 'Morning',
        status,
        remarks: status === 'Late' ? 'Traffic delay' : status === 'Absent' ? 'Family emergency' : '',
        recordedBy: teacherUsers[0]._id,
      });
    }
  }

  // 11. Exams & Results
  console.log('[Seed] Creating Exam & Recording Marks...');
  const midtermExam = await Exam.create({
    name: 'Midterm Examination 2025',
    class: classes[1]._id,
    term: 'Term 1',
    academicYear: '2025-2026',
    startDate: new Date(2025, 9, 15),
    endDate: new Date(2025, 9, 25),
    subjects: [
      { subject: subjects[0]._id, maxMarks: 100, passingMarks: 40 }, // Math
      { subject: subjects[1]._id, maxMarks: 100, passingMarks: 40 }, // Physics
      { subject: subjects[2]._id, maxMarks: 100, passingMarks: 40 }, // English
      { subject: subjects[3]._id, maxMarks: 100, passingMarks: 40 }, // CS
    ],
  });

  const activeRules = await GradingRule.find().sort({ minPercentage: -1 });

  // Record exam results for Grade 10 students
  for (const student of grade10Students) {
    const mathScore = Math.floor(65 + Math.random() * 32);
    const physScore = Math.floor(60 + Math.random() * 35);
    const engScore = Math.floor(70 + Math.random() * 25);
    const csScore = Math.floor(75 + Math.random() * 24);

    const subjectMarks = [
      { subject: subjects[0]._id, marksObtained: mathScore, maxMarks: 100, passingMarks: 40 },
      { subject: subjects[1]._id, marksObtained: physScore, maxMarks: 100, passingMarks: 40 },
      { subject: subjects[2]._id, marksObtained: engScore, maxMarks: 100, passingMarks: 40 },
      { subject: subjects[3]._id, marksObtained: csScore, maxMarks: 100, passingMarks: 40 },
    ];

    const evaluation = evaluateExamResult(subjectMarks, activeRules);

    await ExamResult.create({
      exam: midtermExam._id,
      student: student._id,
      class: student.class,
      section: student.section,
      marks: evaluation.subjects,
      totalMarksObtained: evaluation.totalMarksObtained,
      totalMaxMarks: evaluation.totalMaxMarks,
      percentage: evaluation.percentage,
      grade: evaluation.grade,
      gradePoint: evaluation.gradePoint,
      isPassed: evaluation.isPassed,
      remarks: evaluation.grade === 'A+' ? 'Exemplary academic performance' : 'Consistent effort',
      enteredBy: teacherUsers[0]._id,
    });
  }

  // 12. Fee Structures & Invoices
  console.log('[Seed] Creating Fee Structures, Invoices & Payments with Ledger...');
  const feeStructure = await FeeStructure.create({
    name: 'Academic Term 1 Tuition & Laboratory Fee',
    class: classes[1]._id,
    academicYear: '2025-2026',
    term: 'Term 1',
    items: [
      { title: 'Standard Tuition', amount: 1500 },
      { title: 'STEM & Physics Laboratory', amount: 350 },
      { title: 'Library & Online Resources', amount: 150 },
    ],
    totalAmount: 2000,
    dueDate: new Date(2025, 11, 15),
  });

  // Issue invoices for Grade 10 students and simulate some payments
  for (let idx = 0; idx < grade10Students.length; idx++) {
    const student = grade10Students[idx];
    const invoiceNumber = `INV-2025-${String(idx + 1).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      student: student._id,
      feeStructure: feeStructure._id,
      items: feeStructure.items,
      totalAmount: feeStructure.totalAmount,
      paidAmount: 0,
      outstandingAmount: feeStructure.totalAmount,
      dueDate: feeStructure.dueDate,
      status: 'Pending',
      remarks: 'Term 1 Official Invoice',
    });

    // Debit ledger
    await LedgerService.recordEntry({
      studentId: student._id,
      entryType: 'INVOICE',
      referenceType: 'Invoice',
      referenceId: invoice._id,
      debit: feeStructure.totalAmount,
      credit: 0,
      description: `Invoice ${invoiceNumber} issued`,
    });

    // Simulate payment:
    // First 4 students: Full Payment ($2000)
    // Next 3 students: Partial Payment ($1000)
    // Remaining: Unpaid ($0)
    if (idx < 4) {
      const payNumber = `PAY-2025-${String(idx + 1).padStart(4, '0')}`;
      const payment = await Payment.create({
        paymentNumber: payNumber,
        invoice: invoice._id,
        student: student._id,
        amount: 2000,
        paymentMethod: 'Online Simulator',
        transactionReference: `SIM-TXN-F${idx + 1}`,
        idempotencyKey: `idemp-seed-full-${student._id}`,
        status: 'Success',
        paidAt: new Date(),
        recordedBy: adminUser._id,
        notes: 'Full payment completed via Simulator',
      });

      invoice.paidAmount = 2000;
      invoice.outstandingAmount = 0;
      invoice.status = 'Paid';
      await invoice.save();

      await LedgerService.recordEntry({
        studentId: student._id,
        entryType: 'PAYMENT',
        referenceType: 'Payment',
        referenceId: payment._id,
        debit: 0,
        credit: 2000,
        description: `Payment ${payNumber} received for invoice ${invoiceNumber}`,
      });
    } else if (idx < 7) {
      const payNumber = `PAY-2025-${String(idx + 1).padStart(4, '0')}`;
      const payment = await Payment.create({
        paymentNumber: payNumber,
        invoice: invoice._id,
        student: student._id,
        amount: 1000,
        paymentMethod: 'Online Simulator',
        transactionReference: `SIM-TXN-P${idx + 1}`,
        idempotencyKey: `idemp-seed-part-${student._id}`,
        status: 'Success',
        paidAt: new Date(),
        recordedBy: adminUser._id,
        notes: 'First installment payment recorded',
      });

      invoice.paidAmount = 1000;
      invoice.outstandingAmount = 1000;
      invoice.status = 'Partially Paid';
      await invoice.save();

      await LedgerService.recordEntry({
        studentId: student._id,
        entryType: 'PAYMENT',
        referenceType: 'Payment',
        referenceId: payment._id,
        debit: 0,
        credit: 1000,
        description: `Payment ${payNumber} received for invoice ${invoiceNumber}`,
      });
    }
  }

  // 13. Audit Logs
  console.log('[Seed] Seeding Audit Logs...');
  await AuditLog.create([
    {
      actor: adminUser._id,
      actorName: adminUser.name,
      role: 'ADMIN',
      action: 'SYSTEM_INITIALIZATION',
      entity: 'System',
      entityId: 'SYSTEM',
      details: { version: '1.0.0', initializedAt: new Date() },
      ipAddress: '127.0.0.1',
    },
    {
      actor: adminUser._id,
      actorName: adminUser.name,
      role: 'ADMIN',
      action: 'BATCH_CREATE_INVOICES',
      entity: 'Invoice',
      entityId: classes[1]._id.toString(),
      details: { count: grade10Students.length, feeStructure: feeStructure._id.toString() },
      ipAddress: '127.0.0.1',
    },
    {
      actor: teacherUsers[0]._id,
      actorName: teacherUsers[0].name,
      role: 'TEACHER',
      action: 'ATTENDANCE_BATCH_MARK',
      entity: 'Attendance',
      entityId: `${classes[1]._id}_${sections[2]._id}`,
      details: { count: grade10Students.length, session: 'Morning' },
      ipAddress: '127.0.0.1',
    },
    {
      actor: teacherUsers[0]._id,
      actorName: teacherUsers[0].name,
      role: 'TEACHER',
      action: 'MARKS_ENTRY',
      entity: 'ExamResult',
      entityId: midtermExam._id.toString(),
      details: { examName: midtermExam.name, class: 'Grade 10' },
      ipAddress: '127.0.0.1',
    },
  ]);

  // Check ledger reconciliation
  const reconciliation = await LedgerService.getSystemReconciliation();
  console.log('----------------------------------------------------');
  console.log('[Seed] LEDGER RECONCILIATION SUMMARY:');
  console.log(`  Total Invoiced      : ₹${reconciliation.totalInvoiced}`);
  console.log(`  Total Payments      : ₹${reconciliation.totalPaymentsReceived}`);
  console.log(`  Outstanding Balance : ₹${reconciliation.totalInvoiceOutstanding}`);
  console.log(`  Ledger Net Balance  : ₹${reconciliation.ledger.outstanding}`);
  console.log(`  Is Reconciled?      : ${reconciliation.isReconciled ? 'YES (100% MATCH)' : 'MISMATCH'}`);
  console.log('----------------------------------------------------');
  console.log('[Seed] Completed successfully!');
  console.log('Demo Credentials:');
  console.log('  Admin    : admin@school.test    / Admin@123');
  console.log('  Teacher  : teacher@school.test  / Teacher@123');
  console.log('  Guardian : guardian@school.test / Guardian@123');
  console.log('----------------------------------------------------');
}

// Allow direct CLI execution
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}

