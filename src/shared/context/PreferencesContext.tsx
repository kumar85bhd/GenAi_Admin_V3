/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState } from 'react';

interface PreferencesContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  openInNewTab: boolean;
  toggleOpenInNewTab: () => void;
}

export const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Open in New Tab State (Default: false -> Same tab)
  const [openInNewTab, setOpenInNewTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('openInNewTab');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    console.log('Toggling dark mode:', isDarkMode);
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('openInNewTab', String(openInNewTab));
  }, [openInNewTab]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleOpenInNewTab = () => setOpenInNewTab(prev => !prev);

  return (
    <PreferencesContext.Provider value={{ isDarkMode, toggleDarkMode, openInNewTab, toggleOpenInNewTab }}>
      {children}
    </PreferencesContext.Provider>
  );
};
