import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse, LoginRequest, LoginResponse, MeResponse } from '../types/auth';

const TOKEN_KEY = 'financial_analytics_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown): Promise<never> => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: unknown): Promise<never> => {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        clearToken();
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    if (responseData?.message) {
      if (error.response?.status === 401 && (responseData.message.toLowerCase().includes('email') || responseData.message.toLowerCase().includes('password'))) {
        return 'Invalid email or password';
      }
      if (error.code === AxiosError.ERR_NETWORK || !error.response) {
        return 'Unable to connect to the server. Please check your network and try again.';
      }
      return responseData.message;
    }
    if (error.code === AxiosError.ERR_NETWORK || !error.response) {
      return 'Unable to connect to the server. Please check your network and try again.';
    }
    if (error.response.status === 401) {
      return 'Your session has expired. Please sign in again.';
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

export const authApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', request);
    return response.data;
  },

  async me(): Promise<MeResponse> {
    const response = await apiClient.get<MeResponse>('/auth/me');
    return response.data;
  },
};

export const tokenStorage = {
  get: getToken,
  set: setToken,
  clear: clearToken,
};
