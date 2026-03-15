import apiClient from './api';
import {
  ApiResponse,
  CategoryReport,
  MonthlyTrend,
  ReportSummary,
} from '@/types';

export interface ReportPeriod {
  start_date: string;
  end_date: string;
}

export interface AccountBalance {
  account_id: string;
  account_name: string;
  balance: number;
  type: string;
  color: string;
}

export const reportsService = {
  async getSummary(period: ReportPeriod): Promise<ReportSummary> {
    const params = new URLSearchParams(period);
    const { data } = await apiClient.get<ApiResponse<ReportSummary>>(
      `/reports/summary?${params.toString()}`,
    );
    return data.data;
  },

  async getByCategory(period: ReportPeriod): Promise<CategoryReport[]> {
    const params = new URLSearchParams(period);
    const { data } = await apiClient.get<ApiResponse<CategoryReport[]>>(
      `/reports/by-category?${params.toString()}`,
    );
    return data.data;
  },

  async getMonthlyTrend(): Promise<MonthlyTrend[]> {
    const { data } = await apiClient.get<ApiResponse<MonthlyTrend[]>>(
      '/reports/monthly-trend',
    );
    return data.data;
  },

  async getAccountBalances(): Promise<AccountBalance[]> {
    const { data } = await apiClient.get<ApiResponse<AccountBalance[]>>(
      '/reports/account-balances',
    );
    return data.data;
  },
};
