import axios, { AxiosError } from 'axios';
import type { ApiErrorBody } from '../types/api';

/** Base URL comes from VITE_API_BASE_URL; in development Vite proxies /api to Django. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  withCredentials: true, // session cookies
  xsrfCookieName: 'csrftoken', // Django CSRF cookie ...
  xsrfHeaderName: 'X-CSRFToken', // ... echoed back on unsafe requests
  withXSRFToken: true,
  timeout: 15000,
});

/** Turn any failure into a short message that is safe to show to a user. */
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const e = error as AxiosError<ApiErrorBody>;
    if (!e.response) return 'Cannot reach the server. Check your connection and try again.';
    if (e.response.status === 503) return 'The service is running but its database is unavailable.';
    return e.response.data?.detail ?? `The server returned an error (${e.response.status}).`;
  }
  return 'Something went wrong. Please try again.';
}

/** Map Django REST validation errors ({field: [messages]}) to {field: first message} for form display. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error) || !error.response || error.response.status !== 400) return {};
  const body = error.response.data as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === 'string') out[key] = first;
  }
  return out;
}

/** The machine-readable code (e.g. "email_not_verified") the API attaches to some errors. */
export function errorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const code = (error.response?.data as { code?: unknown } | undefined)?.code;
  return typeof code === 'string' ? code : undefined;
}
