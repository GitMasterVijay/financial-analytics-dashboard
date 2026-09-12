import type { FilterQuery } from 'mongoose';
import Transaction from '../models/Transaction.js';
import type {
  ITransaction,
  PaginationMeta,
  TransactionQueryFilters,
  TransactionListResult,
} from '../types/transaction.js';

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

function buildFilter(filters: TransactionQueryFilters): FilterQuery<ITransaction> {
  const query: FilterQuery<ITransaction> = {};

  if (filters.search) {
    query.$or = buildSearchFilter(filters.search);
  }

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = filters.startDate;
    }
    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.date.$lte = endOfDay;
    }
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    query.amount = {};
    if (filters.minAmount !== undefined) {
      query.amount.$gte = filters.minAmount;
    }
    if (filters.maxAmount !== undefined) {
      query.amount.$lte = filters.maxAmount;
    }
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.userId) {
    query.user_id = filters.userId;
  }

  return query;
}

export async function getTransactionList(
  filters: TransactionQueryFilters
): Promise<TransactionListResult> {
  const filterQuery = buildFilter(filters);

  const sortDirection = filters.sortOrder === 'asc' ? 1 : -1;
  const sortSpec: Record<string, 1 | -1> = {};
  sortSpec[filters.sortBy] = sortDirection;

  const skip = (filters.page - 1) * filters.limit;

  const [total, transactions] = await Promise.all([
    Transaction.countDocuments(filterQuery),
    Transaction.find(filterQuery)
      .sort(sortSpec)
      .skip(skip)
      .limit(filters.limit)
      .select('-_id -__v -createdAt -updatedAt')
      .lean()
      .exec(),
  ]);

  const totalPages = Math.ceil(total / filters.limit);

  const pagination: PaginationMeta = {
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages,
  };

  return {
    transactions: transactions as ITransaction[],
    pagination,
  };
}
