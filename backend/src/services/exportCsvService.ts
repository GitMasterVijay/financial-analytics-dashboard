import { Parser } from 'json2csv';
import type { FilterQuery } from 'mongoose';
import Transaction from '../models/Transaction.js';
import type { ITransaction, TransactionCategory, TransactionStatus } from '../types/transaction.js';

export type ExportColumnKey =
  | 'id'
  | 'user_profile'
  | 'date'
  | 'amount'
  | 'category'
  | 'status';

export const EXPORT_COLUMN_WHITELIST: readonly ExportColumnKey[] = [
  'id',
  'user_profile',
  'date',
  'amount',
  'category',
  'status',
] as const;

export const EXPORT_COLUMN_HEADER_MAP: Record<ExportColumnKey, string> = {
  id: 'ID',
  user_profile: 'User',
  date: 'Date',
  amount: 'Amount',
  category: 'Category',
  status: 'Status',
};

export interface ExportFilters {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  category?: TransactionCategory;
  status?: TransactionStatus;
  userId?: string;
}

function buildSearchFilter(search: string): FilterQuery<ITransaction>[] {
  const orClauses: FilterQuery<ITransaction>[] = [];
  const searchAsNumber = Number(search);
  if (!Number.isNaN(searchAsNumber) && Number.isFinite(searchAsNumber)) {
    orClauses.push({ id: searchAsNumber });
  }
  const pattern = new RegExp(search, 'i');
  orClauses.push(
    { category: pattern },
    { status: pattern },
    { user_id: pattern },
    { user_profile: pattern }
  );
  return orClauses;
}

function buildFilter(filters: ExportFilters): FilterQuery<ITransaction> {
  const query: FilterQuery<ITransaction> = {};

  if (filters.search) {
    query.$or = buildSearchFilter(filters.search);
  }

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = filters.startDate;
    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.date.$lte = endOfDay;
    }
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    query.amount = {};
    if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
    if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
  }

  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.userId) query.user_id = filters.userId;

  return query;
}

export interface ExportCsvRow {
  [key: string]: string | number | undefined;
}

function formatExportDate(iso: Date | string): string {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

export async function exportTransactionsToCsv(
  filters: ExportFilters,
  columns: ExportColumnKey[]
): Promise<string> {
  const safeColumns = columns.filter((c) =>
    EXPORT_COLUMN_WHITELIST.includes(c)
  );
  if (safeColumns.length === 0) {
    return '';
  }

  const filterQuery = buildFilter(filters);
  const mongoSelect = safeColumns
    .map((c) => (c === 'user_profile' ? 'user_profile -_id' : `${c} -_id`))
    .join(' ');

  const docs = await Transaction.find(filterQuery)
    .sort({ date: -1, id: -1 })
    .select(mongoSelect)
    .lean()
    .exec();

  const rows: ExportCsvRow[] = docs.map((doc) => {
    const row: ExportCsvRow = {};
    if (safeColumns.includes('id')) row.ID = doc.id;
    if (safeColumns.includes('user_profile')) row.User = doc.user_profile;
    if (safeColumns.includes('date')) row.Date = formatExportDate(doc.date);
    if (safeColumns.includes('amount')) row.Amount = doc.amount;
    if (safeColumns.includes('category')) row.Category = doc.category;
    if (safeColumns.includes('status')) row.Status = doc.status;
    return row;
  });

  if (rows.length === 0) {
    const headerLine = safeColumns
      .map((c) => EXPORT_COLUMN_HEADER_MAP[c])
      .join(',');
    return headerLine;
  }

  const fields = safeColumns.map((c) => EXPORT_COLUMN_HEADER_MAP[c]);

  const parser = new Parser<ExportCsvRow>({ fields });

  return parser.parse(rows);
}
