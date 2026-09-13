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

export interface CategoryBreakdownPoint {
  category: 'Revenue' | 'Expense';
  amount: number;
}

export interface DashboardFilters {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}
