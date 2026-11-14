import mongoose from 'mongoose';

const examSubjectSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100,
  },
  passingMarks: {
    type: Number,
    required: true,
    default: 40,
  },
  examDate: {
    type: Date,
  },
});

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
      index: true,
    },
    term: {
      type: String,
      required: [true, 'Term is required'],
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
      default: '2025-2026',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    subjects: [examSubjectSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

examSchema.index({ class: 1, term: 1, academicYear: 1 });

export const Exam = mongoose.model('Exam', examSchema);

