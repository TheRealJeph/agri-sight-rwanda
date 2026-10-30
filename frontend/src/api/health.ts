import { api } from './client';
import type { HealthResponse } from '../types/api';

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health/', { validateStatus: (s) => s === 200 || s === 503 });
  return data;
}
