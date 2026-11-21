import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { authApi } from '../api/client.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (emailOrEmployeeId: string, password?: string) => Promise<void>;
  logout: () => void;
  switchUserDemo: (email: string) => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('freedom_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('freedom_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('freedom_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
          localStorage.setItem('freedom_user', JSON.stringify(res.data.user));
        } catch {
          localStorage.removeItem('freedom_token');
          localStorage.removeItem('freedom_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (emailOrEmployeeId: string, password = 'Password123!') => {
    const res = await authApi.login({ emailOrEmployeeId, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('freedom_token', receivedToken);
    localStorage.setItem('freedom_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const logout = () => {
    localStorage.removeItem('freedom_token');
    localStorage.removeItem('freedom_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const switchUserDemo = async (email: string) => {
    await login(email, 'Password123!');
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        switchUserDemo,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
