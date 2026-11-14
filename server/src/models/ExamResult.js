import mongoose from 'mongoose';

const subjectMarkSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100,
  },
  passingMarks: {
    type: Number,
    default: 40,
  },
  isAbsent: {
    type: Boolean,
    default: false,
  },
  percentage: {
    type: Number,
  },
  grade: {
    type: String,
  },
  isPassed: {
    type: Boolean,
    default: true,
  },
});

const examResultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    marks: [subjectMarkSchema],
    totalMarksObtained: {
      type: Number,
      required: true,
      default: 0,
    },
    totalMaxMarks: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      required: true,
      default: 0,
    },
    grade: {
      type: String,
      default: 'F',
    },
    gradePoint: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      trim: true,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

examResultSchema.index({ exam: 1, student: 1 }, { unique: true });

export const ExamResult = mongoose.model('ExamResult', examResultSchema);

