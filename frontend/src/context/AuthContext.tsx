import { AxiosError } from 'axios';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AUTH_EVENT_CHANNEL,
  AUTH_UNAUTHORIZED_EVENT,
  authApi,
  extractErrorMessage,
  tokenStorage,
} from '../services/api';
import type { AuthenticatedUser } from '../types/auth';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: (message?: string) => void;
  logoutReason: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutReason, setLogoutReason] = useState<string | null>(null);

  const clearAuthenticatedState = useCallback((reason?: string) => {
    tokenStorage.clear();
    setTokenState(null);
    setUser(null);
    if (reason) {
      setLogoutReason(reason);
    }
  }, []);

  const setAuthenticatedState = useCallback((newToken: string, newUser: AuthenticatedUser) => {
    tokenStorage.set(newToken);
    setTokenState(newToken);
    setUser(newUser);
    setLogoutReason(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = tokenStorage.get();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.me();
      setTokenState(storedToken);
      setUser(response.data);
      setLogoutReason(null);
    } catch {
      clearAuthenticatedState();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthenticatedState]);

  const handleGlobalUnauthorized = useCallback(() => {
    clearAuthenticatedState('Your session has expired. Please sign in again.');
  }, [clearAuthenticatedState]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handler = () => handleGlobalUnauthorized();
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handler);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(AUTH_EVENT_CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === 'logout') {
          handleGlobalUnauthorized();
        }
      };
    }

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
      if (channel) {
        channel.close();
      }
    };
  }, [handleGlobalUnauthorized]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      setAuthenticatedState(response.token, response.user);
    } catch (error: unknown) {
      clearAuthenticatedState();
      if (error instanceof AxiosError) {
        throw new Error(extractErrorMessage(error));
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  }, [setAuthenticatedState, clearAuthenticatedState]);

  const logout = useCallback(
    (message?: string) => {
      clearAuthenticatedState(message);
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const channel = new BroadcastChannel(AUTH_EVENT_CHANNEL);
          channel.postMessage({ type: 'logout' });
          channel.close();
        } catch {
          // no-op
        }
      }
    },
    [clearAuthenticatedState]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: user !== null && token !== null,
      isLoading,
      login,
      logout,
      logoutReason,
    }),
    [user, token, isLoading, login, logout, logoutReason]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
