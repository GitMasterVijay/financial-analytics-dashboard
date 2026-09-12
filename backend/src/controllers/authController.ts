import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getCurrentUser, loginUser } from '../services/authService.js';
import type { LoginRequest } from '../types/auth.js';
import { AppError } from '../utils/errors.js';
import { createSuccessResponse } from '../utils/response.js';

export async function login(
  _req: Request,
  res: Response
): Promise<void> {
  const req = _req as Request<unknown, unknown, LoginRequest>;
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const result = await loginUser(email, password);
  res.status(200).json({
    success: true,
    token: result.token,
    user: result.user,
  });
}

export async function getMe(
  req: Request,
  res: Response
): Promise<void> {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.userId;

  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const result = await getCurrentUser(userId);
  res.status(200).json(createSuccessResponse('User retrieved successfully', result));
}
