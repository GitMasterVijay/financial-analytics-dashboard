import type { Request, Response } from 'express';
import {
  getCategoryBreakdown,
  getDashboardSummary,
  getRevenueExpenseTrend,
} from '../services/dashboardService.js';
import { AppError } from '../utils/errors.js';
import { createSuccessResponse } from '../utils/response.js';
import type { DashboardFilters } from '../types/dashboard.js';

function parseOptionalDate(
  value: string | undefined,
  fieldName: string
): Date | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(
      `${fieldName} must be a valid date in YYYY-MM-DD format`,
      400
    );
  }
  return date;
}

function parseFiltersFromQuery(req: Request): DashboardFilters {
  const { query } = req;

  const userId =
    typeof query.userId === 'string' && query.userId !== ''
      ? query.userId
      : undefined;

  const startDate = parseOptionalDate(
    typeof query.startDate === 'string' ? query.startDate : undefined,
    'startDate'
  );
  const endDate = parseOptionalDate(
    typeof query.endDate === 'string' ? query.endDate : undefined,
    'endDate'
  );

  if (startDate !== undefined && endDate !== undefined && startDate > endDate) {
    throw new AppError('startDate cannot be later than endDate', 400);
  }

  return { userId, startDate, endDate };
}

export async function getSummary(req: Request, res: Response): Promise<void> {
  const filters = parseFiltersFromQuery(req);
  const summary = await getDashboardSummary(filters);
  res
    .status(200)
    .json(createSuccessResponse('Dashboard summary retrieved successfully', summary));
}

export async function getRevenueExpenseTrendData(
  req: Request,
  res: Response
): Promise<void> {
  const filters = parseFiltersFromQuery(req);
  const trend = await getRevenueExpenseTrend(filters);
  res
    .status(200)
    .json(
      createSuccessResponse('Revenue vs Expenses trend retrieved successfully', trend)
    );
}

export async function getCategoryBreakdownData(
  req: Request,
  res: Response
): Promise<void> {
  const filters = parseFiltersFromQuery(req);
  const breakdown = await getCategoryBreakdown(filters);
  res
    .status(200)
    .json(
      createSuccessResponse('Category breakdown retrieved successfully', breakdown)
    );
}
