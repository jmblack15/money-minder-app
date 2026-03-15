import apiClient from './api';
import { ApiResponse, AuthTokens, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthData {
  user: User;
  access_token: string;
  refresh_token: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthData> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(
      '/auth/login',
      payload,
    );
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthData> {
    const { data } = await apiClient.post<ApiResponse<AuthData>>(
      '/auth/register',
      payload,
    );
    return data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refresh_token: refreshToken });
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<ApiResponse<AuthTokens>>(
      '/auth/refresh',
      { refresh_token: refreshToken },
    );
    return data.data;
  },
};
