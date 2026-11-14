import { z } from 'zod';

export const createExamSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  class: z.string().min(1, 'Class ID is required'),
  term: z.string().min(1, 'Term is required'),
  academicYear: z.string().default('2025-2026'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  subjects: z.array(
    z.object({
      subject: z.string().min(1, 'Subject ID is required'),
      maxMarks: z.number().positive().default(100),
      passingMarks: z.number().nonnegative().default(40),
      examDate: z.string().optional(),
    })
  ).min(1, 'At least one subject is required'),
});

export const enterMarksSchema = z.object({
  exam: z.string().min(1, 'Exam ID is required'),
  student: z.string().min(1, 'Student ID is required'),
  class: z.string().min(1, 'Class ID is required'),
  section: z.string().min(1, 'Section ID is required'),
  marks: z.array(
    z.object({
      subject: z.string().min(1, 'Subject ID is required'),
      marksObtained: z.number().min(0, 'Marks must be positive'),
      maxMarks: z.number().positive().default(100),
      passingMarks: z.number().nonnegative().default(40),
      isAbsent: z.boolean().optional().default(false),
    })
  ).min(1, 'At least one subject mark is required'),
  remarks: z.string().optional(),
});

export const createGradingRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  grade: z.string().min(1, 'Grade is required'),
  minPercentage: z.number().min(0).max(100),
  maxPercentage: z.number().min(0).max(100),
  gradePoint: z.number().min(0),
  isPassing: z.boolean().default(true),
  description: z.string().optional(),
});

export const updateGradingRuleSchema = createGradingRuleSchema.partial();

