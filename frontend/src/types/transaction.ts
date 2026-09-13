export type TransactionCategory = 'Revenue' | 'Expense';
export type TransactionStatus = 'Paid' | 'Pending';
export type SortOrder = 'asc' | 'desc';
export type TransactionSortField =
  | 'id'
  | 'date'
  | 'amount'
  | 'category'
  | 'status'
  | 'user_id';

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: TransactionCategory;
  status: TransactionStatus;
  user_id: string;
  user_profile: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionListData {
  transactions: Transaction[];
  pagination: PaginationMeta;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}
