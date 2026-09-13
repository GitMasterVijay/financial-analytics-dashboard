import { apiClient } from './api';
import type {
  ApiEnvelope,
  CategoryBreakdownPoint,
  DashboardFilters,
  DashboardSummary,
  RevenueExpenseTrendPoint,
} from '../types/dashboard';

function buildFilterParams(filters: DashboardFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.userId) {
    params.set('userId', filters.userId);
  }
  if (filters.startDate) {
    params.set('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.set('endDate', filters.endDate);
  }
  return params;
}

export const dashboardService = {
  async getSummary(filters: DashboardFilters = {}): Promise<DashboardSummary> {
    const params = buildFilterParams(filters);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<ApiEnvelope<DashboardSummary>>(
      `/dashboard/summary${qs}`
    );
    return response.data.data as DashboardSummary;
  },

  async getRevenueExpenseTrend(
    filters: DashboardFilters = {}
  ): Promise<RevenueExpenseTrendPoint[]> {
    const params = buildFilterParams(filters);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<ApiEnvelope<RevenueExpenseTrendPoint[]>>(
      `/dashboard/revenue-expense-trend${qs}`
    );
    return (response.data.data ?? []) as RevenueExpenseTrendPoint[];
  },

  async getCategoryBreakdown(
    filters: DashboardFilters = {}
  ): Promise<CategoryBreakdownPoint[]> {
    const params = buildFilterParams(filters);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<ApiEnvelope<CategoryBreakdownPoint[]>>(
      `/dashboard/category-breakdown${qs}`
    );
    return (response.data.data ?? []) as CategoryBreakdownPoint[];
  },
};
