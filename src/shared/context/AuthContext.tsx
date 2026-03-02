/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  username: string;
  email?: string;
  is_admin?: boolean;
}



interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (formData: FormData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Context provider for authentication state and operations.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Initializes authentication state by checking for an existing token.
     */
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

          const userRes = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
          } else {
            localStorage.removeItem('access_token');
          }
        } catch (error) {
          console.error('Auth initialization failed', error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Logs in a user with the provided credentials.
   * @param formData - The login form data.
   */
  const login = async (formData: FormData) => {
    try {
      const data = await api.login(formData);
      if (data && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        
        const userRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${data.access_token}` }
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        } else {
          // Profile fetch failed - rollback login
          localStorage.removeItem('access_token');
          const errorData = await userRes.json().catch(() => ({ detail: 'Failed to fetch user profile' }));
          throw new Error(errorData.detail || 'Authentication succeeded but profile loading failed.');
        }
      } else {
        throw new Error('Invalid response from login server.');
      }
    } catch (error: any) {
      console.error('Login process failed:', error);
      throw error;
    }
  };

  /**
   * Logs out the current user.
   */
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
