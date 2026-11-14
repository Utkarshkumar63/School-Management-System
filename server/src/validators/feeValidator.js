import { z } from 'zod';

export const createFeeStructureSchema = z.object({
  name: z.string().min(1, 'Fee structure name is required'),
  class: z.string().min(1, 'Class ID is required'),
  academicYear: z.string().default('2025-2026'),
  term: z.string().default('Term 1'),
  items: z.array(
    z.object({
      title: z.string().min(1, 'Item title is required'),
      amount: z.number().positive('Item amount must be positive'),
    })
  ).min(1, 'At least one fee line item is required'),
  dueDate: z.string().min(1, 'Due date is required'),
});

export const createInvoiceSchema = z.object({
  student: z.string().min(1, 'Student ID is required'),
  feeStructure: z.string().optional(),
  items: z.array(
    z.object({
      title: z.string().min(1, 'Line item title is required'),
      amount: z.number().positive('Line item amount must be positive'),
    })
  ).min(1, 'At least one item is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  remarks: z.string().optional(),
});

export const generateBatchInvoicesSchema = z.object({
  class: z.string().min(1, 'Class ID is required'),
  section: z.string().optional(),
  feeStructure: z.string().min(1, 'Fee Structure ID is required'),
  dueDate: z.string().min(1, 'Due date is required'),
});

export const recordPaymentSchema = z.object({
  invoice: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Credit Card', 'Online Simulator']).default('Online Simulator'),
  transactionReference: z.string().optional(),
  idempotencyKey: z.string().min(6, 'Valid idempotencyKey is required'),
  notes: z.string().optional(),
});

