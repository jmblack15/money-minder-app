export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  type: 'expense' | 'income' | 'both';
  color: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  category_id: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  description: string;
  notes?: string;
  date: string;
  account?: Account;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'weekly' | 'monthly';
  alert_at: number;
  category?: Category;
  spent?: number;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface TransactionFilters {
  account_id?: string;
  category_id?: string;
  type?: 'expense' | 'income' | 'transfer';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface ReportSummary {
  total_income: number;
  total_expenses: number;
  net: number;
  period: string;
}

export interface CategoryReport {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}
