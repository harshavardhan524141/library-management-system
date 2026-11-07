import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/index.ts';
import { api } from '../api/client.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  quickDemoLogin: (role: 'admin' | 'user') => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserInState: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      if (res.token) {
        localStorage.setItem('lib_token', res.token);
      }
      setUser(res.user);
      success(`Welcome back, ${res.user.name}!`);
    } catch (err: any) {
      error(err.message || 'Login failed. Please check credentials.');
      throw err;
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    try {
      const res = await api.register(data);
      if (res.token) {
        localStorage.setItem('lib_token', res.token);
      }
      setUser(res.user);
      success('Account created successfully! Welcome to the library.');
    } catch (err: any) {
      error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('lib_token');
      setUser(null);
      success('You have been logged out.');
    }
  };

  const quickDemoLogin = async (role: 'admin' | 'user') => {
    if (role === 'admin') {
      await login('admin@university.edu', 'admin123');
    } else {
      await login('aarav.sharma@university.edu', 'password123');
    }
  };

  const updateUserInState = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser,
        updateUserInState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
