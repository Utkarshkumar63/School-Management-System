import { z } from 'zod';

export const markSingleAttendanceSchema = z.object({
  student: z.string().min(1, 'Student ID is required'),
  class: z.string().min(1, 'Class ID is required'),
  section: z.string().min(1, 'Section ID is required'),
  date: z.string().min(1, 'Date is required (YYYY-MM-DD)'),
  session: z.enum(['Morning', 'Afternoon']).default('Morning'),
  status: z.enum(['Present', 'Absent', 'Late', 'Excused']),
  remarks: z.string().optional(),
});

export const markBatchAttendanceSchema = z.object({
  class: z.string().min(1, 'Class ID is required'),
  section: z.string().min(1, 'Section ID is required'),
  date: z.string().min(1, 'Date is required (YYYY-MM-DD)'),
  session: z.enum(['Morning', 'Afternoon']).default('Morning'),
  records: z.array(
    z.object({
      student: z.string().min(1, 'Student ID is required'),
      status: z.enum(['Present', 'Absent', 'Late', 'Excused']),
      remarks: z.string().optional(),
    })
  ).min(1, 'At least one student record is required'),
});

export const attendanceQuerySchema = z.object({
  class: z.string().optional(),
  classId: z.string().optional(),
  section: z.string().optional(),
  sectionId: z.string().optional(),
  student: z.string().optional(),
  studentId: z.string().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  session: z.enum(['Morning', 'Afternoon']).optional(),
  month: z.string().optional(), // YYYY-MM
  year: z.string().optional(),
});

