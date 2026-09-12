import { Schema, model, type Document } from 'mongoose';
import type { ITransaction } from '../types/transaction.js';

type TransactionDocument = ITransaction & Document;

const transactionSchema = new Schema<TransactionDocument>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['Revenue', 'Expense'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      required: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    user_profile: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = model<TransactionDocument>('Transaction', transactionSchema);

export default Transaction;

