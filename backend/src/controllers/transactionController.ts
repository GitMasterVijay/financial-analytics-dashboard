import type { Request, Response } from 'express';
import { getTransactionList } from '../services/transactionService.js';
import { AppError } from '../utils/errors.js';
import { createSuccessResponse } from '../utils/response.js';
import { ALLOWED_SORT_FIELDS } from '../types/transaction.js';
import type {
  SortOrder,
  TransactionCategory,
  TransactionSortField,
  TransactionStatus,
  TransactionQueryFilters,
} from '../types/transaction.js';

const MAX_LIMIT = 100;

function parsePositiveInt(value: string | undefined, fieldName: string, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed) || parsed < 1) {
    throw new AppError(`${fieldName} must be a positive integer`, 400);
  }
  return parsed;
}

function parseOptionalNumber(value: string | undefined, fieldName: string): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    throw new AppError(`${fieldName} must be a valid number`, 400);
  }
  return parsed;
}

function parseOptionalDate(value: string | undefined, fieldName: string): Date | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldName} must be a valid date in YYYY-MM-DD format`, 400);
  }
  return date;
}

function parseEnum<T extends string>(
  value: string | undefined, allowedValues: readonly T[], fieldName: string): T | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  if (!allowedValues.includes(value as T)) {
    throw new AppError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, 400);
  }
  return value as T;
}

const CATEGORIES: readonly TransactionCategory[] = ['Revenue', 'Expense'] as const;
const STATUSES: readonly TransactionStatus[] = ['Paid', 'Pending'] as const;
const SORT_ORDERS: readonly SortOrder[] = ['asc', 'desc'] as const;

export async function listTransactions(req: Request, res: Response): Promise<void> {
  const { query } = req;

  const page = parsePositiveInt(typeof query.page === 'string' ? query.page : undefined, 'page', 1);
  const rawLimit = parsePositiveInt(typeof query.limit === 'string' ? query.limit : undefined, 'limit', 10);
  const limit = rawLimit > MAX_LIMIT ? MAX_LIMIT : rawLimit;

  const filters: TransactionQueryFilters = {
    page,
    limit,
    search: typeof query.search === 'string' && query.search !== '' ? query.search : undefined,
    startDate: parseOptionalDate(typeof query.startDate === 'string' ? query.startDate : undefined, 'startDate'),
    endDate: parseOptionalDate(typeof query.endDate === 'string' ? query.endDate : undefined, 'endDate'),
    minAmount: parseOptionalNumber(typeof query.minAmount === 'string' ? query.minAmount : undefined, 'minAmount'),
    maxAmount: parseOptionalNumber(typeof query.maxAmount === 'string' ? query.maxAmount : undefined, 'maxAmount'),
    category: parseEnum<TransactionCategory>(typeof query.category === 'string' ? query.category : undefined, CATEGORIES, 'category'),
    status: parseEnum<TransactionStatus>(typeof query.status === 'string' ? query.status : undefined, STATUSES, 'status'),
    userId: typeof query.userId === 'string' && query.userId !== '' ? query.userId : undefined,
    sortBy: parseEnum<TransactionSortField>(
      typeof query.sortBy === 'string' ? query.sortBy : undefined, ALLOWED_SORT_FIELDS, 'sortBy') ?? 'date',
    sortOrder: parseEnum<SortOrder>(
      typeof query.sortOrder === 'string' ? query.sortOrder : undefined, SORT_ORDERS, 'sortOrder') ?? 'desc',
  };

  if (
    filters.minAmount !== undefined &&
    filters.maxAmount !== undefined &&
    filters.minAmount > filters.maxAmount
  ) {
    throw new AppError('minAmount cannot be greater than maxAmount', 400);
  }

  const result = await getTransactionList(filters);

  res.status(200).json(createSuccessResponse('Transactions retrieved successfully', result));
}
