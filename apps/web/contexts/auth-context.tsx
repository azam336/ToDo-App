'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { api, ApiError } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const scheduleRefresh = useCallback((expiresIn: number) => {
    // Refresh 1 minute before expiry
    const refreshIn = (expiresIn - 60) * 1000;
    if (refreshIn > 0) {
      setTimeout(async () => {
        try {
          const result = await api.refresh();
          api.setAccessToken(result.data.tokens.accessToken);
          scheduleRefresh(result.data.tokens.expiresIn);
        } catch {
          // Refresh failed, user needs to login again
          setUser(null);
          api.setAccessToken(null);
        }
      }, refreshIn);
    }
  }, []);

  // Try to restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const result = await api.refresh();
        api.setAccessToken(result.data.tokens.accessToken);
        scheduleRefresh(result.data.tokens.expiresIn);

        const meResult = await api.getMe();
        setUser({
          id: meResult.data.id,
          email: meResult.data.email,
          name: meResult.data.name,
        });
      } catch {
        // No valid session
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [scheduleRefresh]);

  const login = async (email: string, password: string) => {
    const result = await api.login({ email, password });
    api.setAccessToken(result.data.tokens.accessToken);
    scheduleRefresh(result.data.tokens.expiresIn);
    setUser({
      id: result.data.user.id,
      email: result.data.user.email,
      name: result.data.user.name,
    });
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await api.register({ email, password, name });
    api.setAccessToken(result.data.tokens.accessToken);
    scheduleRefresh(result.data.tokens.expiresIn);
    setUser({
      id: result.data.user.id,
      email: result.data.user.email,
      name: result.data.user.name,
    });
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      api.setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
