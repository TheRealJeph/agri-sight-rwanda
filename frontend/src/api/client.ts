
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorBody } from '../types/api';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

// Store the CSRF token returned by Django.
let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

// Attach the token to requests that can modify server data.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toLowerCase();

  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(method ?? '')) {
    config.headers.set('X-CSRFToken', csrfToken);
  }

  return config;
});

/** Turn any failure into a short message safe to show to a user. */
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const e = error as AxiosError<ApiErrorBody>;

    if (!e.response) {
      return 'Cannot reach the server. Check your connection and try again.';
    }

    if (e.response.status === 503) {
      return 'The service is running but its database is unavailable.';
    }

    return e.response.data?.detail ??
      `The server returned an error (${e.response.status}).`;
  }

  return 'Something went wrong. Please try again.';
}

/** Map Django REST validation errors to form fields. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error) || !error.response || error.response.status !== 400) {
    return {};
  }

  const body = error.response.data as Record<string, unknown>;
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(body)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === 'string') out[key] = first;
  }

  return out;
}

/** Read a machine-readable API error code. */
export function errorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;

  const code = (error.response?.data as { code?: unknown } | undefined)?.code;
  return typeof code === 'string' ? code : undefined;
}
