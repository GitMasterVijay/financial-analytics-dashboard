export interface DashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

export interface RevenueExpenseTrendPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export type DashboardCategory = 'Revenue' | 'Expense';

export interface CategoryBreakdownPoint {
  category: DashboardCategory;
  amount: number;
}

export interface DashboardFilters {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}
