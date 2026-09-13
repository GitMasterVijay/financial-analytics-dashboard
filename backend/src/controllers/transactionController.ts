import type { Request, Response } from 'express';
import { getTransactionList } from '../services/transactionService.js';
import {
  exportTransactionsToCsv,
  EXPORT_COLUMN_WHITELIST,
  type ExportColumnKey,
  type ExportFilters,
} from '../services/exportCsvService.js';
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

function parseExportFiltersFromQuery(req: Request): ExportFilters {
  const { query } = req;
  const filters: ExportFilters = {};

  filters.search =
    typeof query.search === 'string' && query.search !== ''
      ? query.search
      : undefined;

  const startRaw =
    typeof query.startDate === 'string' && query.startDate !== ''
      ? query.startDate
      : undefined;
  const endRaw =
    typeof query.endDate === 'string' && query.endDate !== ''
      ? query.endDate
      : undefined;

  if (startRaw !== undefined) {
    const d = new Date(startRaw);
    if (Number.isNaN(d.getTime())) {
      throw new AppError('startDate must be a valid date in YYYY-MM-DD format', 400);
    }
    filters.startDate = d;
  }
  if (endRaw !== undefined) {
    const d = new Date(endRaw);
    if (Number.isNaN(d.getTime())) {
      throw new AppError('endDate must be a valid date in YYYY-MM-DD format', 400);
    }
    filters.endDate = d;
  }

  if (
    filters.startDate !== undefined &&
    filters.endDate !== undefined &&
    filters.startDate > filters.endDate
  ) {
    throw new AppError('startDate cannot be later than endDate', 400);
  }

  const minRaw =
    typeof query.minAmount === 'string' && query.minAmount !== ''
      ? query.minAmount
      : undefined;
  const maxRaw =
    typeof query.maxAmount === 'string' && query.maxAmount !== ''
      ? query.maxAmount
      : undefined;
  if (minRaw !== undefined) {
    const n = Number(minRaw);
    if (Number.isNaN(n) || !Number.isFinite(n)) {
      throw new AppError('minAmount must be a valid number', 400);
    }
    filters.minAmount = n;
  }
  if (maxRaw !== undefined) {
    const n = Number(maxRaw);
    if (Number.isNaN(n) || !Number.isFinite(n)) {
      throw new AppError('maxAmount must be a valid number', 400);
    }
    filters.maxAmount = n;
  }

  if (
    filters.minAmount !== undefined &&
    filters.maxAmount !== undefined &&
    filters.minAmount > filters.maxAmount
  ) {
    throw new AppError('minAmount cannot be greater than maxAmount', 400);
  }

  const categoryRaw = typeof query.category === 'string' ? query.category : undefined;
  if (categoryRaw !== undefined && categoryRaw !== '') {
    if (categoryRaw !== 'Revenue' && categoryRaw !== 'Expense') {
      throw new AppError('category must be Revenue or Expense', 400);
    }
    filters.category = categoryRaw as TransactionCategory;
  }

  const statusRaw = typeof query.status === 'string' ? query.status : undefined;
  if (statusRaw !== undefined && statusRaw !== '') {
    if (statusRaw !== 'Paid' && statusRaw !== 'Pending') {
      throw new AppError('status must be Paid or Pending', 400);
    }
    filters.status = statusRaw as TransactionStatus;
  }

  filters.userId =
    typeof query.userId === 'string' && query.userId !== ''
      ? query.userId
      : undefined;

  return filters;
}

export async function exportCsv(req: Request, res: Response): Promise<void> {
  const filters = parseExportFiltersFromQuery(req);

  const rawColumns = req.query.columns;
  let columns: ExportColumnKey[];
  if (rawColumns === undefined) {
    columns = [...EXPORT_COLUMN_WHITELIST];
  } else if (Array.isArray(rawColumns)) {
    columns = (rawColumns as string[]).filter((c) =>
      EXPORT_COLUMN_WHITELIST.includes(c as ExportColumnKey)
    ) as ExportColumnKey[];
  } else if (typeof rawColumns === 'string') {
    const split = rawColumns.split(',').map((s) => s.trim()).filter(Boolean);
    columns = split.filter((c) =>
      EXPORT_COLUMN_WHITELIST.includes(c as ExportColumnKey)
    ) as ExportColumnKey[];
  } else {
    columns = [];
  }

  if (columns.length === 0) {
    throw new AppError(
      'At least one valid export column must be provided. Allowed columns: ' +
        EXPORT_COLUMN_WHITELIST.join(', '),
      400
    );
  }

  const csv = await exportTransactionsToCsv(filters, columns);

  const timestamp = new Date()
    .toISOString()
    .replace(/[:T]/g, '-')
    .slice(0, 19);
  const filename = `transactions-export-${timestamp}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"`
  );
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const bom = '\uFEFF';
  res.status(200).send(bom + csv);
}
