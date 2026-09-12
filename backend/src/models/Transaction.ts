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
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['Revenue', 'Expense'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      required: true,
    },
    user_id: {
      type: String,
      required: true,
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
