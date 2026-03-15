import apiClient from './api';
import { ApiResponse, Category } from '@/types';

export interface CreateCategoryPayload {
  name: string;
  icon: string;
  type: 'expense' | 'income' | 'both';
  color: string;
}

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return data.data;
  },

  async create(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await apiClient.post<ApiResponse<Category>>(
      '/categories',
      payload,
    );
    return data.data;
  },
};
