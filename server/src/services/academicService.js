import bcrypt from 'bcryptjs';
import {
  Class,
  Section,
  Subject,
  Student,
  Guardian,
  Teacher,
  TeacherAssignment,
  User,
} from '../models/index.js';
import { AppError } from '../utils/apiResponse.js';

export class AcademicService {
  // ================= Classes =================
  static async getClasses() {
    return Class.find().sort({ order: 1, name: 1 });
  }

  static async getClassById(id) {
    const cls = await Class.findById(id);
    if (!cls) throw new AppError('Class not found', 404);
    return cls;
  }

  static async createClass(data) {
    return Class.create(data);
  }

  static async updateClass(id, data) {
    const cls = await Class.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!cls) throw new AppError('Class not found', 404);
    return cls;
  }

  static async deleteClass(id) {
    const count = await Student.countDocuments({ class: id });
    if (count > 0) {
      throw new AppError(`Cannot delete class: ${count} student(s) currently enrolled`, 400);
    }
    return Class.findByIdAndDelete(id);
  }

  // ================= Sections =================
  static async getSections(classId = null) {
    const filter = {};
    if (classId) filter.class = classId;
    return Section.find(filter).populate('class', 'name code').sort({ name: 1 });
  }

  static async createSection(data) {
    return Section.create(data);
  }

  static async updateSection(id, data) {
    const sec = await Section.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!sec) throw new AppError('Section not found', 404);
    return sec;
  }

  static async deleteSection(id) {
    const count = await Student.countDocuments({ section: id });
    if (count > 0) {
      throw new AppError(`Cannot delete section: ${count} student(s) currently enrolled`, 400);
    }
    return Section.findByIdAndDelete(id);
  }

  // ================= Subjects =================
  static async getSubjects(classId = null) {
    const filter = {};
    if (classId) filter.class = classId;
    return Subject.find(filter).populate('class', 'name code').sort({ name: 1 });
  }

  static async createSubject(data) {
    return Subject.create(data);
  }

  static async updateSubject(id, data) {
    const sub = await Subject.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!sub) throw new AppError('Subject not found', 404);
    return sub;
  }

  static async deleteSubject(id) {
    return Subject.findByIdAndDelete(id);
  }

  // ================= Students =================
  static async getStudents({ page = 1, limit = 10, search = '', classId = null, sectionId = null }) {
    const query = {};
    if (classId) query.class = classId;
    if (sectionId) query.section = sectionId;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('class', 'name code')
      .populate('section', 'name')
      .populate('guardian', 'name email phone relationship')
      .sort({ admissionNo: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return {
      students,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getStudentById(id) {
    const student = await Student.findById(id)
      .populate('class', 'name code')
      .populate('section', 'name')
      .populate('guardian', 'name email phone relationship');
    if (!student) throw new AppError('Student not found', 404);
    return student;
  }

  static async createStudent(data) {
    const student = await Student.create(data);
    if (data.guardian) {
      await Guardian.findByIdAndUpdate(data.guardian, {
        $addToSet: { students: student._id },
      });
    }
    return student;
  }

  static async updateStudent(id, data) {
    const oldStudent = await Student.findById(id);
    if (!oldStudent) throw new AppError('Student not found', 404);

    const student = await Student.findByIdAndUpdate(id, data, { new: true, runValidators: true });

    // Handle guardian link update
    if (data.guardian && oldStudent.guardian?.toString() !== data.guardian.toString()) {
      if (oldStudent.guardian) {
        await Guardian.findByIdAndUpdate(oldStudent.guardian, {
          $pull: { students: id },
        });
      }
      await Guardian.findByIdAndUpdate(data.guardian, {
        $addToSet: { students: id },
      });
    }

    return student;
  }

  static async deleteStudent(id) {
    const student = await Student.findById(id);
    if (!student) throw new AppError('Student not found', 404);

    if (student.guardian) {
      await Guardian.findByIdAndUpdate(student.guardian, {
        $pull: { students: id },
      });
    }
    return Student.findByIdAndDelete(id);
  }

  // ================= Guardians =================
  static async getGuardians({ page = 1, limit = 10, search = '' }) {
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Guardian.countDocuments(query);
    const guardians = await Guardian.find(query)
      .populate({
        path: 'students',
        select: 'firstName lastName admissionNo rollNumber class section',
        populate: [
          { path: 'class', select: 'name code' },
          { path: 'section', select: 'name' },
        ],
      })
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return {
      guardians,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createGuardian(data) {
    // Check if user already exists
    let user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      const passwordHash = await bcrypt.hash(data.password || 'Guardian@123', 10);
      user = await User.create({
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: 'GUARDIAN',
      });
    }

    const guardian = await Guardian.create({
      user: user._id,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      relationship: data.relationship || 'Father',
      occupation: data.occupation,
      address: data.address,
      students: data.studentIds || [],
    });

    if (data.studentIds && data.studentIds.length > 0) {
      await Student.updateMany(
        { _id: { $in: data.studentIds } },
        { $set: { guardian: guardian._id } }
      );
    }

    return guardian;
  }

  static async linkGuardianStudent(guardianId, studentId) {
    const guardian = await Guardian.findById(guardianId);
    if (!guardian) throw new AppError('Guardian not found', 404);

    const student = await Student.findById(studentId);
    if (!student) throw new AppError('Student not found', 404);

    await Guardian.findByIdAndUpdate(guardianId, { $addToSet: { students: studentId } });
    await Student.findByIdAndUpdate(studentId, { $set: { guardian: guardianId } });

    return { guardianId, studentId, message: 'Student successfully linked to guardian' };
  }

  static async updateGuardian(id, data) {
    const guardian = await Guardian.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!guardian) throw new AppError('Guardian not found', 404);
    return guardian;
  }

  static async deleteGuardian(id) {
    const guardian = await Guardian.findById(id);
    if (!guardian) throw new AppError('Guardian not found', 404);
    await Student.updateMany({ guardian: id }, { $unset: { guardian: 1 } });
    await Guardian.findByIdAndDelete(id);
    if (guardian.user) {
      await User.findByIdAndDelete(guardian.user);
    }
    return { message: 'Guardian deleted successfully' };
  }

  // ================= Teachers =================
  static async getTeachers({ page = 1, limit = 10, search = '' }) {
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Teacher.countDocuments(query);
    const teachers = await Teacher.find(query)
      .sort({ firstName: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return {
      teachers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createTeacher(data) {
    let user = await User.findOne({ email: data.email.toLowerCase() });
    if (!user) {
      const passwordHash = await bcrypt.hash(data.password || 'Teacher@123', 10);
      user = await User.create({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email.toLowerCase(),
        passwordHash,
        role: 'TEACHER',
      });
    }

    const teacher = await Teacher.create({
      user: user._id,
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      qualification: data.qualification,
      specialization: data.specialization,
      joiningDate: data.joiningDate || new Date(),
    });

    return teacher;
  }

  static async updateTeacher(id, data) {
    const teacher = await Teacher.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!teacher) throw new AppError('Teacher not found', 404);
    return teacher;
  }

  static async deleteTeacher(id) {
    const teacher = await Teacher.findById(id);
    if (!teacher) throw new AppError('Teacher not found', 404);
    await TeacherAssignment.deleteMany({ teacher: id });
    await Teacher.findByIdAndDelete(id);
    if (teacher.user) {
      await User.findByIdAndDelete(teacher.user);
    }
    return { message: 'Teacher deleted successfully' };
  }

  // ================= Teacher Assignments =================
  static async getTeacherAssignments(filter = {}) {
    return TeacherAssignment.find(filter)
      .populate('teacher', 'firstName lastName employeeId email')
      .populate('class', 'name code')
      .populate('section', 'name')
      .populate('subject', 'name code');
  }

  static async assignTeacher(data) {
    return TeacherAssignment.create(data);
  }

  static async removeTeacherAssignment(id) {
    return TeacherAssignment.findByIdAndDelete(id);
  }

  static async getAssignmentsForTeacher(teacherUserId) {
    const teacher = await Teacher.findOne({ user: teacherUserId });
    if (!teacher) return [];

    return TeacherAssignment.find({ teacher: teacher._id, isActive: true })
      .populate('class', 'name code')
      .populate('section', 'name')
      .populate('subject', 'name code');
  }
}

