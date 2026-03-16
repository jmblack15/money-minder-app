// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  currency?: string;
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export type AccountType = 'BANK' | 'CASH' | 'CREDIT_CARD' | 'SAVINGS';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  currency: string;
  createdAt: string;
}

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  balance?: number;
  color?: string;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  accountId: string;
  account?: Account;
  categoryId?: string;
  category?: Category;
  toAccountId?: string;
  toAccount?: Account;
  createdAt: string;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  accountId: string;
  categoryId?: string;
  toAccountId?: string;
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

// ─── Budgets ─────────────────────────────────────────────────────────────────

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY';

export interface Budget {
  id: string;
  categoryId: string;
  category?: Category;
  amount: number;
  period: BudgetPeriod;
  spent: number;
  alertAt?: number;
  startDate: string;
  createdAt: string;
}

export interface CreateBudgetPayload {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  alertAt?: number;
}

// ─── Savings Goals ───────────────────────────────────────────────────────────

export type SavingsStatus = 'ACTIVE' | 'COMPLETED';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  status: SavingsStatus;
  color?: string;
  createdAt: string;
}

export interface CreateSavingsGoalPayload {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export type ReportPeriod = 'this_month' | 'last_month' | 'last_3_months' | 'custom';

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
