import type { FilterQuery, PipelineStage } from 'mongoose';
import Transaction from '../models/Transaction.js';
import type {
  CategoryBreakdownPoint,
  DashboardFilters,
  DashboardSummary,
  RevenueExpenseTrendPoint,
} from '../types/dashboard.js';
import type { ITransaction } from '../types/transaction.js';

function buildBaseMatch(filters: DashboardFilters): FilterQuery<ITransaction> {
  const match: FilterQuery<ITransaction> = {};

  if (filters.userId) {
    match.user_id = filters.userId;
  }

  if (filters.startDate || filters.endDate) {
    match.date = {};
    if (filters.startDate) {
      match.date.$gte = filters.startDate;
    }
    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      match.date.$lte = endOfDay;
    }
  }

  return match;
}

export async function getDashboardSummary(
  filters: DashboardFilters
): Promise<DashboardSummary> {
  const matchStage: PipelineStage = { $match: buildBaseMatch(filters) };

  const pipeline: PipelineStage[] = [
    matchStage,
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
  ];

  const result = await Transaction.aggregate<{
    _id: 'Revenue' | 'Expense';
    total: number;
  }>(pipeline).exec();

  let totalRevenue = 0;
  let totalExpenses = 0;

  for (const row of result) {
    if (row._id === 'Revenue') {
      totalRevenue = row.total;
    } else if (row._id === 'Expense') {
      totalExpenses = row.total;
    }
  }

  const balance = totalRevenue - totalExpenses;

  const savingsRate =
    totalRevenue > 0 ? (balance / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    balance,
    savingsRate,
  };
}

export async function getRevenueExpenseTrend(
  filters: DashboardFilters
): Promise<RevenueExpenseTrendPoint[]> {
  const matchStage: PipelineStage = { $match: buildBaseMatch(filters) };

  const pipeline: PipelineStage[] = [
    matchStage,
    {
      $group: {
        _id: {
          yearMonth: {
            $dateToString: { format: '%Y-%m', date: '$date' },
          },
          category: '$category',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $group: {
        _id: '$_id.yearMonth',
        revenue: {
          $sum: {
            $cond: [
              { $eq: ['$_id.category', 'Revenue'] },
              '$total',
              0,
            ],
          },
        },
        expenses: {
          $sum: {
            $cond: [
              { $eq: ['$_id.category', 'Expense'] },
              '$total',
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
        revenue: 1,
        expenses: 1,
      },
    },
    {
      $sort: { month: 1 },
    },
  ];

  return Transaction.aggregate<RevenueExpenseTrendPoint>(pipeline).exec();
}

export async function getCategoryBreakdown(
  filters: DashboardFilters
): Promise<CategoryBreakdownPoint[]> {
  const matchStage: PipelineStage = { $match: buildBaseMatch(filters) };

  const pipeline: PipelineStage[] = [
    matchStage,
    {
      $group: {
        _id: '$category',
        amount: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        amount: 1,
      },
    },
    {
      $sort: { category: 1 },
    },
  ];

  return Transaction.aggregate<CategoryBreakdownPoint>(pipeline).exec();
}
