export type TransactionCategory = 'Revenue' | 'Expense';

export type TransactionStatus = 'Paid' | 'Pending';

export interface ITransaction {
  id: number;
  date: Date;
  amount: number;
  category: TransactionCategory;
  status: TransactionStatus;
  user_id: string;
  user_profile: string;
}

export type TransactionSortField =
  | 'id'
  | 'date'
  | 'amount'
  | 'category'
  | 'status'
  | 'user_id';

export type SortOrder = 'asc' | 'desc';

export const ALLOWED_SORT_FIELDS: readonly TransactionSortField[] = [
  'id',
  'date',
  'amount',
  'category',
  'status',
  'user_id',
] as const;

export interface TransactionQueryFilters {
  page: number;
  limit: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  category?: TransactionCategory;
  status?: TransactionStatus;
  userId?: string;
  sortBy: TransactionSortField;
  sortOrder: SortOrder;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionListResult {
  transactions: ITransaction[];
  pagination: PaginationMeta;
}

