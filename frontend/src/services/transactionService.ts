import { apiClient } from './api';
import type {
  ApiEnvelope,
  TransactionListData,
} from '../types/transaction';
import type { ExportColumnKey, ExportFilterState } from '../types/exportCsv';

export const transactionService = {
  async getRecentTransactions(
    limit = 5,
    userId?: string
  ): Promise<TransactionListData> {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(limit));
    params.set('sortBy', 'date');
    params.set('sortOrder', 'desc');
    if (userId) {
      params.set('userId', userId);
    }
    const response = await apiClient.get<ApiEnvelope<TransactionListData>>(
      `/transactions?${params.toString()}`
    );
    return response.data.data as TransactionListData;
  },

  async list(queryString: string): Promise<TransactionListData> {
    const response = await apiClient.get<ApiEnvelope<TransactionListData>>(
      `/transactions${queryString ? `?${queryString}` : ''}`
    );
    return response.data.data as TransactionListData;
  },

  async exportCsv(
    filters: ExportFilterState,
    columns: ExportColumnKey[]
  ): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.minAmount) params.set('minAmount', filters.minAmount);
    if (filters.maxAmount) params.set('maxAmount', filters.maxAmount);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    if (filters.userId) params.set('userId', filters.userId);
    columns.forEach((col) => params.append('columns', col));
    const qs = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<Blob>(`/transactions/export/csv${qs}`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
