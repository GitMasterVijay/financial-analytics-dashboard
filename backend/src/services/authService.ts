import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError, UnauthorizedError } from '../utils/errors.js';
import type { LoginResponseData, MeResponseData } from '../types/auth.js';

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponseData> {
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: {
      email: user.email,
      role: user.role,
    },
  };
}

export async function getCurrentUser(userId: string): Promise<MeResponseData> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return {
    email: user.email,
    role: user.role,
  };
}

export async function createAnalystUser(
  email: string,
  plainPassword: string
): Promise<void> {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log(`Analyst user with email ${email} already exists. Skipping creation.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  await User.create({
    email,
    password: hashedPassword,
    role: 'analyst',
  });

  console.log(`Analyst user created successfully: ${email}`);
}
