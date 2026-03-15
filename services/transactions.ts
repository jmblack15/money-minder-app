import apiClient from './api';
import {
  ApiResponse,
  PaginatedResponse,
  Transaction,
  TransactionFilters,
} from '@/types';

export interface CreateTransactionPayload {
  account_id: string;
  category_id: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer';
  description: string;
  notes?: string;
  date: string;
  destination_account_id?: string;
}

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export const transactionsService = {
  async getAll(
    filters: TransactionFilters = {},
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
      `/transactions?${params.toString()}`,
    );
    return data.data;
  },

  async getById(id: string): Promise<Transaction> {
    const { data } = await apiClient.get<ApiResponse<Transaction>>(
      `/transactions/${id}`,
    );
    return data.data;
  },

  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const { data } = await apiClient.post<ApiResponse<Transaction>>(
      '/transactions',
      payload,
    );
    return data.data;
  },

  async update(
    id: string,
    payload: UpdateTransactionPayload,
  ): Promise<Transaction> {
    const { data } = await apiClient.put<ApiResponse<Transaction>>(
      `/transactions/${id}`,
      payload,
    );
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  },
};
