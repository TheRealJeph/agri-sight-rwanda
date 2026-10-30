/** Typed contracts for the Django REST API (/api/v1). Extend as endpoints are added. */
export interface HealthResponse {
  status: 'ok' | 'degraded';
  database: 'ok' | 'unavailable';
  version: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorBody {
  detail?: string;
  [field: string]: unknown;
}
