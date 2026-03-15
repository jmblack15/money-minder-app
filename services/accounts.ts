import apiClient from './api';
import { Account, ApiResponse } from '@/types';

export interface CreateAccountPayload {
  name: string;
  type: string;
  balance: number;
  color: string;
}

export type UpdateAccountPayload = Partial<CreateAccountPayload>;

export const accountsService = {
  async getAll(): Promise<Account[]> {
    const { data } = await apiClient.get<ApiResponse<Account[]>>('/accounts');
    return data.data;
  },

  async create(payload: CreateAccountPayload): Promise<Account> {
    const { data } = await apiClient.post<ApiResponse<Account>>(
      '/accounts',
      payload,
    );
    return data.data;
  },

  async update(id: string, payload: UpdateAccountPayload): Promise<Account> {
    const { data } = await apiClient.put<ApiResponse<Account>>(
      `/accounts/${id}`,
      payload,
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/accounts/${id}`);
  },
};
