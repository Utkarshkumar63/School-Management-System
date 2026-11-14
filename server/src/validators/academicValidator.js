import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  code: z.string().min(1, 'Class code is required'),
  order: z.number().optional().default(1),
  isActive: z.boolean().optional().default(true),
});

export const updateClassSchema = createClassSchema.partial();

export const createSectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  class: z.string().min(1, 'Class ID is required'),
  capacity: z.number().int().positive().optional().default(40),
  isActive: z.boolean().optional().default(true),
});

export const updateSectionSchema = createSectionSchema.partial();

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  class: z.string().min(1, 'Class ID is required'),
  credits: z.number().positive().optional().default(3),
  isElective: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createStudentSchema = z.object({
  admissionNo: z.string().min(1, 'Admission number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  class: z.string().min(1, 'Class ID is required'),
  section: z.string().min(1, 'Section ID is required'),
  guardian: z.string().optional(),
  dateOfBirth: z.string().or(z.date()),
  gender: z.enum(['Male', 'Female', 'Other']).default('Male'),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const createGuardianSchema = z.object({
  name: z.string().min(1, 'Guardian name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6).optional().default('Guardian@123'),
  phone: z.string().min(1, 'Phone number is required'),
  relationship: z.enum(['Father', 'Mother', 'Legal Guardian', 'Other']).default('Father'),
  occupation: z.string().optional(),
  address: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
});

export const updateGuardianSchema = createGuardianSchema.partial();

export const createTeacherSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6).optional().default('Teacher@123'),
  phone: z.string().min(1, 'Phone number is required'),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  joiningDate: z.string().or(z.date()).optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

export const createTeacherAssignmentSchema = z.object({
  teacher: z.string().min(1, 'Teacher ID is required'),
  class: z.string().min(1, 'Class ID is required'),
  section: z.string().min(1, 'Section ID is required'),
  subject: z.string().min(1, 'Subject ID is required'),
  academicYear: z.string().default('2025-2026'),
});

export const linkGuardianStudentSchema = z.object({
  guardianId: z.string().min(1, 'Guardian ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
});

