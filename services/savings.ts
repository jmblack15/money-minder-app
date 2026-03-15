import apiClient from './api';
import { ApiResponse, SavingsGoal } from '@/types';

export interface CreateSavingsGoalPayload {
  name: string;
  target_amount: number;
  deadline: string;
}

export interface ContributePayload {
  amount: number;
}

export const savingsService = {
  async getAll(): Promise<SavingsGoal[]> {
    const { data } = await apiClient.get<ApiResponse<SavingsGoal[]>>('/savings');
    return data.data;
  },

  async create(payload: CreateSavingsGoalPayload): Promise<SavingsGoal> {
    const { data } = await apiClient.post<ApiResponse<SavingsGoal>>(
      '/savings',
      payload,
    );
    return data.data;
  },

  async contribute(id: string, payload: ContributePayload): Promise<SavingsGoal> {
    const { data } = await apiClient.put<ApiResponse<SavingsGoal>>(
      `/savings/${id}`,
      { current_amount_increment: payload.amount },
    );
    return data.data;
  },

  async update(id: string, payload: Partial<CreateSavingsGoalPayload>): Promise<SavingsGoal> {
    const { data } = await apiClient.put<ApiResponse<SavingsGoal>>(
      `/savings/${id}`,
      payload,
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/savings/${id}`);
  },
};
