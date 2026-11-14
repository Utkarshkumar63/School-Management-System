import mongoose from 'mongoose';

const ledgerEntrySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    entryType: {
      type: String,
      enum: ['INVOICE', 'PAYMENT', 'ADJUSTMENT', 'REFUND'],
      required: true,
    },
    referenceType: {
      type: String,
      enum: ['Invoice', 'Payment'],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    debit: {
      type: Number,
      default: 0,
      min: 0,
    },
    credit: {
      type: Number,
      default: 0,
      min: 0,
    },
    runningBalance: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ledgerEntrySchema.index({ student: 1, timestamp: 1 });

export const LedgerEntry = mongoose.model('LedgerEntry', ledgerEntrySchema);

