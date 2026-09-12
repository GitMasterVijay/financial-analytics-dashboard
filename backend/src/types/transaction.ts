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
