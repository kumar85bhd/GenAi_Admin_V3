import { useContext } from 'react';
import { UserPreferenceContext } from './UserPreferenceContext';

export const useUserPreference = () => {
  const context = useContext(UserPreferenceContext);
  if (context === undefined) {
    throw new Error('useUserPreference must be used within a UserPreferenceProvider');
  }
  return context;
};
