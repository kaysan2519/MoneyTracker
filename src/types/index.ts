export type TransactionType = 'income' | 'expense';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  created_at?: string;
}

export interface Transaction {
  id: number;
  category_id: number;
  category_name?: string;
  title: string;
  amount: number;
  type: TransactionType;
  transaction_date: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTransactionInput {
  category_id: number;
  title: string;
  amount: number;
  type: TransactionType;
  transaction_date: string;
  description?: string | null;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {}

export interface CategoryExpenseBreakdown {
  category_id: number;
  category_name: string;
  type: TransactionType;
  total: number;
  percentage: number;
  count: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  recentTransactions: Transaction[];
  categoryBreakdown: CategoryExpenseBreakdown[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
