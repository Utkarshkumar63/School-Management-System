import mongoose from 'mongoose';

const gradingRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true,
    },
    grade: {
      type: String,
      required: [true, 'Grade letter is required'],
      trim: true,
      uppercase: true,
    },
    minPercentage: {
      type: Number,
      required: [true, 'Minimum percentage is required'],
      min: 0,
      max: 100,
    },
    maxPercentage: {
      type: Number,
      required: [true, 'Maximum percentage is required'],
      min: 0,
      max: 100,
    },
    gradePoint: {
      type: Number,
      required: [true, 'Grade point is required'],
      default: 0,
    },
    isPassing: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

gradingRuleSchema.index({ minPercentage: 1, maxPercentage: 1 });

export const GradingRule = mongoose.model('GradingRule', gradingRuleSchema);

