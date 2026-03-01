export interface AppData {
  id: number;
  name: string;
  desc: string;
  keyFeatures?: string;
  category: string;
  isFavorite: boolean;
  baseActivity: string;
  icon: string;
  url: string;
  metrics: string;
  metricsEnabled?: boolean;
  status: string;
  lastUsed: string;
}

export interface AppMetric {
  name: string;
  value: string;
  trend?: 'up' | 'down';
}

export type FilterType = 'dashboard' | 'favorites';
export type ViewMode = 'card' | 'list';
