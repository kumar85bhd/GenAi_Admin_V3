import { AppData, AppMetric } from '../types';

/**
 * API service for handling backend interactions.
 */
export const api = {
  /**
   * Authenticates a user and retrieves an access token.
   * @param formData - The login form data containing username and password.
   * @returns A promise resolving to the access token or null if authentication fails.
   */
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

  /**
   * Retrieves the application configuration.
   * @returns A promise resolving to the configuration object.
   */
  getConfig: async (): Promise<{ cardsPerRow: number }> => {
    return { cardsPerRow: 4 };
  },

  /**
   * Retrieves all workspace applications.
   * @returns A promise resolving to the list of apps and their live status.
   */
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

  /**
   * Retrieves all workspace categories.
   * @returns A promise resolving to the list of categories.
   */
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

  /**
   * Retrieves metrics for a specific application.
   * @param id - The ID of the application.
   * @returns A promise resolving to the application metrics.
   */
  getMetrics: async (_id: number | string): Promise<{ data: AppMetric }> => {
    // Mock metrics for now
    return {
      data: {
        name: 'Efficiency Score',
        value: '94/100',
        trend: 'up'
      }
    };
  },

  /**
   * Retrieves user preferences from local storage.
   * @returns A promise resolving to the user preferences.
   */
  getPreferences: async (): Promise<{ theme: string, favorites: number[] } | null> => {
    const theme = localStorage.getItem('theme') || 'dark';
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return { theme, favorites };
  },

  /**
   * Updates the user's theme preference.
   * @param theme - The theme to set (e.g., 'light' or 'dark').
   */
  updateTheme: async (theme: string): Promise<void> => {
    localStorage.setItem('theme', theme);
  },

  /**
   * Updates the user's favorite applications.
   * @param favorites - The list of favorite application IDs.
   */
  updateFavorites: async (favorites: number[]): Promise<void> => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  },
};
