import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse, LoginRequest, LoginResponse, MeResponse } from '../types/auth';

const TOKEN_KEY = 'financial_analytics_token';
export const AUTH_UNAUTHORIZED_EVENT = 'financial_analytics:unauthorized';
export const AUTH_EVENT_CHANNEL = 'financial_analytics_auth_channel';

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
        try {
          window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
          if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel(AUTH_EVENT_CHANNEL);
            channel.postMessage({ type: 'logout' });
            channel.close();
          }
        } catch {
          // no-op
        }
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    const status = error.response?.status;
    const code = error.code;

    if (code === AxiosError.ERR_NETWORK || !error.response) {
      return 'Unable to connect to server. Please check your network connection and try again.';
    }

    if (code === AxiosError.ETIMEDOUT || error.message?.toLowerCase().includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    if (code === AxiosError.ERR_CANCELED) {
      return 'Request was cancelled.';
    }

    if (status === 400) {
      if (responseData?.message) {
        return responseData.message;
      }
      return 'Invalid request. Please check your filters and try again.';
    }

    if (status === 401) {
      if (responseData?.message) {
        const msg = responseData.message.toLowerCase();
        if (msg.includes('email') || msg.includes('password')) {
          return 'Invalid email or password.';
        }
      }
      return 'Your session has expired. Please sign in again.';
    }

    if (status === 403) {
      return 'Access denied. You do not have permission to perform this action.';
    }

    if (status === 404) {
      return responseData?.message ?? 'Requested resource was not found.';
    }

    if (status && status >= 500) {
      return 'Server error. Please try again in a moment.';
    }

    if (responseData?.message) {
      return responseData.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
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
