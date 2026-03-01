import { AppData, AppMetric } from '../types';

export const api = {
  login: async (formData: FormData): Promise<{access_token: string} | null> => {
    try {
      const params = new URLSearchParams();
      formData.forEach((value, key) => {
        params.append(key, value.toString());
      });

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });
      
      if (res.ok) {
        return res.json();
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `Login failed with status ${res.status}`);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getConfig: async (): Promise<{ cardsPerRow: number }> => {
    return { cardsPerRow: 4 };
  },

  getApps: async (): Promise<{ data: AppData[], isLive: boolean }> => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/workspace/apps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        return { data, isLive: true };
      }
      return { data: [], isLive: false };
    } catch (error) {
      console.error('Failed to fetch apps', error);
      return { data: [], isLive: false };
    }
  },

  getCategories: async (): Promise<any[]> => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/workspace/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch categories', error);
      return [];
    }
  },

  getMetrics: async (id: number | string): Promise<{ data: AppMetric }> => {
    // Mock metrics for now
    return {
      data: {
        name: 'Efficiency Score',
        value: '94/100',
        trend: 'up'
      }
    };
  },

  getPreferences: async (): Promise<{ theme: string, favorites: number[] } | null> => {
    const theme = localStorage.getItem('theme') || 'dark';
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return { theme, favorites };
  },

  updateTheme: async (theme: string): Promise<void> => {
    localStorage.setItem('theme', theme);
  },

  updateFavorites: async (favorites: number[]): Promise<void> => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  },
};
