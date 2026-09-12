import type { Request, Response } from 'express';
import type { HealthCheckResponse } from '../types/common.js';

export function getHealth(_req: Request, res: Response<HealthCheckResponse>): void {
  const response: HealthCheckResponse = {
    success: true,
    message: 'Financial Analytics API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
  res.status(200).json(response);
}
