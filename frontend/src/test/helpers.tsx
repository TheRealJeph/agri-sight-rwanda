import { render } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../context/authContext';
import type { AuthUser } from '../types/auth';

export const USER: AuthUser = {
  id: 1, email: 'user@example.com', email_verified: true,
  profile: { full_name: 'Test User', email: 'user@example.com', email_verified: true, phone: '', organization: 'NISR', biography: '', occupation: 'researcher', access_level: 'viewer', created_at: '2026-01-01T00:00:00Z' },
  preferences: { theme: 'system', default_season: '', default_crop: '', default_district: '', email_notifications: true, system_alerts: true },
};

export function apiError(status: number, data: unknown): AxiosError {
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, { status, data, statusText: '', headers: {}, config: {} as never } as AxiosResponse);
}

export function renderWithAuth(ui: ReactElement, auth: Partial<AuthContextValue> = {}, route: string | { pathname: string; state?: unknown } = '/') {
  const value: AuthContextValue = { user: null, status: 'anonymous', signIn: async () => USER, signOut: async () => undefined, ...auth };
  return render(<AuthContext.Provider value={value}><MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter></AuthContext.Provider>);
}
