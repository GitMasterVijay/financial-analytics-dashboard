export interface ExportFilterState {
  search: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  category: string;
  status: string;
  userId: string;
}

export type ExportColumnKey = 'id' | 'user_profile' | 'date' | 'amount' | 'category' | 'status';

export const EXPORT_COLUMNS: readonly {
  key: ExportColumnKey;
  label: string;
  csvHeader: string;
}[] = [
  { key: 'id', label: 'ID', csvHeader: 'ID' },
  { key: 'user_profile', label: 'User', csvHeader: 'User' },
  { key: 'date', label: 'Date', csvHeader: 'Date' },
  { key: 'amount', label: 'Amount', csvHeader: 'Amount' },
  { key: 'category', label: 'Category', csvHeader: 'Category' },
  { key: 'status', label: 'Status', csvHeader: 'Status' },
] as const;

export const EXPORT_COLUMN_KEYS: readonly ExportColumnKey[] = EXPORT_COLUMNS.map(
  (c) => c.key
);
