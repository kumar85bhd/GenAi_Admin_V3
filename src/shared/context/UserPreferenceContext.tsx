/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './useAuth';

interface UserPreferenceContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  favorites: number[];
  setFavorites: (favorites: number[]) => void;
  toggleFavorite: (id: number) => void;
}

export const UserPreferenceContext = createContext<UserPreferenceContextType | undefined>(undefined);

export const UserPreferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    return 'light';
  });
  const [favorites, setFavoritesState] = useState<number[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      api.getPreferences().then(prefs => {
        if (prefs) {
          setThemeState(prefs.theme as 'light' | 'dark');
          setFavoritesState(prefs.favorites);
        }
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (isAuthenticated) {
      api.updateTheme(newTheme);
    }
  };

  const setFavorites = (newFavorites: number[]) => {
    setFavoritesState(newFavorites);
    if (isAuthenticated) {
      api.updateFavorites(newFavorites);
    }
  };

  const toggleFavorite = (id: number) => {
    const newFavorites = favorites.includes(id) 
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
  };

  return (
    <UserPreferenceContext.Provider value={{ theme, setTheme, favorites, setFavorites, toggleFavorite }}>
      {children}
    </UserPreferenceContext.Provider>
  );
};
