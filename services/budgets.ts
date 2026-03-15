import apiClient from './api';
import { ApiResponse, Budget } from '@/types';

export interface CreateBudgetPayload {
  category_id: string;
  amount: number;
  period: 'weekly' | 'monthly';
  alert_at: number;
}

export type UpdateBudgetPayload = Partial<CreateBudgetPayload>;

export const budgetsService = {
  async getAll(): Promise<Budget[]> {
    const { data } = await apiClient.get<ApiResponse<Budget[]>>('/budgets');
    return data.data;
  },

  async create(payload: CreateBudgetPayload): Promise<Budget> {
    const { data } = await apiClient.post<ApiResponse<Budget>>(
      '/budgets',
      payload,
    );
    return data.data;
  },

  async update(id: string, payload: UpdateBudgetPayload): Promise<Budget> {
    const { data } = await apiClient.put<ApiResponse<Budget>>(
      `/budgets/${id}`,
      payload,
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  },
};
