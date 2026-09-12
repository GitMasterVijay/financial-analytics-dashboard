import type { ApiResponse } from '../types/common.js';

export function createSuccessResponse<T>(
  message: string,
  data?: T
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function createErrorResponse<T>(
  message: string,
  data?: T
): ApiResponse<T> {
  return {
    success: false,
    message,
    data,
  };
}
