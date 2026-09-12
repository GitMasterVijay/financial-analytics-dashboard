import { AxiosError } from 'axios';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, extractErrorMessage, tokenStorage } from '../services/api';
import type { AuthenticatedUser } from '../types/auth';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthenticatedState = useCallback((newToken: string, newUser: AuthenticatedUser) => {
    tokenStorage.set(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const clearAuthenticatedState = useCallback(() => {
    tokenStorage.clear();
    setTokenState(null);
    setUser(null);
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
    } catch {
      clearAuthenticatedState();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthenticatedState]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

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

  const logout = useCallback(() => {
    clearAuthenticatedState();
  }, [clearAuthenticatedState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: user !== null && token !== null,
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout]
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
