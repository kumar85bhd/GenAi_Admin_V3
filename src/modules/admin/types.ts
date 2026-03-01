export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  MAINTENANCE = 'maintenance',
  ACTIVE = 'active'
}

export interface Metric {
  label: string;
  value: string | number;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  status: HealthStatus;
  metrics: Metric[];
  lastUpdated: string;
  type: string;
  description?: string;
  version?: string;
  owner?: string;
  url?: string;
}

export interface AppConfig {
  platformName: string;
  environment: string;
  categories: {
    id: string;
    name: string;
    services: { id: string; name: string; type: string; url?: string; description?: string }[];
  }[];
}
