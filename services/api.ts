import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token helpers ────────────────────────────────────────────────────────────

export const TokenKeys = {
  access: 'access_token',
  refresh: 'refresh_token',
} as const;

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TokenKeys.access);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TokenKeys.refresh);
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TokenKeys.access, accessToken),
    SecureStore.setItemAsync(TokenKeys.refresh, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TokenKeys.access),
    SecureStore.deleteItemAsync(TokenKeys.refresh),
  ]);
}

// ─── Request interceptor: attach access token ─────────────────────────────────

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: unwrap envelope + handle 401 ──────────────────────

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (token) resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  // Unwrap { success, message, data } envelope so hooks receive data directly
  (response: AxiosResponse) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(friendlyError(error));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
      // After envelope unwrap the interceptor won't run on this direct axios call,
      // so unwrap manually
      const payload = data?.data ?? data;
      const newAccessToken: string = payload.accessToken;
      const newRefreshToken: string = payload.refreshToken ?? refreshToken;

      await saveTokens(newAccessToken, newRefreshToken);
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearTokens();
      router.replace('/(auth)/login');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Friendly error messages ──────────────────────────────────────────────────

function friendlyError(error: AxiosError): Error {
  if (!error.response) {
    return new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
  }

  // Debug logging to identify unexpected backend responses
  console.log('[API] HTTP status:', error.response.status);
  console.log('[API] Response data:', JSON.stringify(error.response.data));

  const data = error.response.data as { message?: string; error?: string };
  const msg = data?.message ?? data?.error;
  if (msg) {
    return Object.assign(new Error(msg), { data: error.response.data });
  }

  const statusMessages: Record<number, string> = {
    400: 'Solicitud inválida.',
    401: 'Sesión expirada. Inicia sesión nuevamente.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'Recurso no encontrado.',
    409: 'Ya existe un registro con esos datos.',
    422: 'Los datos enviados no son válidos.',
    429: 'Demasiadas solicitudes. Intenta más tarde.',
    500: 'Error interno del servidor.',
  };

  const message = statusMessages[error.response.status] ?? 'Ocurrió un error inesperado.';
  return Object.assign(new Error(message), { data: error.response.data });
}

// ─── API resource endpoints ───────────────────────────────────────────────────

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    api.post('/auth/login', payload),
  register: (payload: { name: string; email: string; password: string; currency?: string }) =>
    api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const accountsApi = {
  list: () => api.get('/accounts'),
  get: (id: string) => api.get(`/accounts/${id}`),
  create: (payload: object) => api.post('/accounts', payload),
  update: (id: string, payload: object) => api.put(`/accounts/${id}`, payload),
  remove: (id: string) => api.delete(`/accounts/${id}`),
};

export const categoriesApi = {
  list: () => api.get('/categories'),
};

export const transactionsApi = {
  list: (params?: object) => api.get('/transactions', { params }),
  get: (id: string) => api.get(`/transactions/${id}`),
  create: (payload: object) => api.post('/transactions', payload),
  update: (id: string, payload: object) => api.put(`/transactions/${id}`, payload),
  remove: (id: string) => api.delete(`/transactions/${id}`),
};

export const budgetsApi = {
  list: () => api.get('/budgets'),
  get: (id: string) => api.get(`/budgets/${id}`),
  create: (payload: object) => api.post('/budgets', payload),
  update: (id: string, payload: object) => api.put(`/budgets/${id}`, payload),
  remove: (id: string) => api.delete(`/budgets/${id}`),
};

export const savingsApi = {
  list: () => api.get('/savings'),
  get: (id: string) => api.get(`/savings/${id}`),
  create: (payload: object) => api.post('/savings', payload),
  update: (id: string, payload: object) => api.put(`/savings/${id}`, payload),
  remove: (id: string) => api.delete(`/savings/${id}`),
};

export const reportsApi = {
  summary: () => api.get('/reports/summary'),
  byCategory: (params?: object) => api.get('/reports/by-category', { params }),
  monthlyTrend: () => api.get('/reports/monthly-trend'),
  accountBalances: () => api.get('/reports/account-balances'),
};
