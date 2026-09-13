import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { AppError, NotFoundError } from '../utils/errors.js';
import { createErrorResponse } from '../utils/response.js';
import { config } from '../config/index.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(createErrorResponse(err.message));
    return;
  }

  let message = 'Internal Server Error';

  if (config.nodeEnv !== 'production') {
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }
  }

  if (config.nodeEnv !== 'production' && err instanceof Error && err.stack) {
    // eslint-disable-next-line no-console
    console.error('[errorHandler] Stack:', err.stack);
  }

  res.status(500).json(createErrorResponse(message));
};
