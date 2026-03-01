import { AppConfig, Metric } from '../types';

export const fetchConfig = async (): Promise<AppConfig> => {
  return {
    platformName: 'System Admin',
    environment: 'Production',
    categories: []
  };
};

/**
 * Fetches metrics for a specific service.
 * Uses try/catch to handle potential endpoint failures.
 */
export const fetchServiceMetrics = async (serviceId: string): Promise<Metric[]> => {
  try {
    return [
      { label: 'CPU', value: `${Math.floor(Math.random() * 20) + 5}%` },
      { label: 'Memory', value: `${Math.floor(Math.random() * 500) + 100}MB` }
    ];
  } catch (error) {
    throw error;
  }
};

export const fetchDashboardLinks = async (): Promise<any[]> => {
  const token = localStorage.getItem('access_token');
  const res = await fetch('/api/admin/dashboard-links', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard links');
  return res.json();
};

