import { Schema, model, type Document } from 'mongoose';
import type { IUser } from '../types/auth.js';

type UserDocument = IUser & Document;

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['analyst'],
      required: true,
      default: 'analyst',
    },
  },
  {
    timestamps: true,
  }
);

const User = model<UserDocument>('User', userSchema);

export default User;
