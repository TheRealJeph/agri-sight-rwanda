import { api } from './client';
import type { AuthUser, Detail, LoginPayload, RegisterPayload, ResetPasswordPayload } from '../types/auth';

export const fetchCsrf = () => api.get<Detail>('/auth/csrf/');
export const fetchMe = async () => (await api.get<AuthUser>('/auth/me/')).data;
export const login = async (p: LoginPayload) => (await api.post<AuthUser>('/auth/login/', p)).data;
export const logout = async () => (await api.post<Detail>('/auth/logout/')).data;
export const register = async (p: RegisterPayload) => (await api.post<Detail>('/auth/register/', p)).data;
export const verifyEmail = async (token: string) => (await api.post<Detail>('/auth/verify-email/', { token })).data;
export const resendVerification = async (email: string) => (await api.post<Detail>('/auth/resend-verification/', { email })).data;
export const forgotPassword = async (email: string) => (await api.post<Detail>('/auth/forgot-password/', { email })).data;
export const resetPassword = async (p: ResetPasswordPayload) => (await api.post<Detail>('/auth/reset-password/', p)).data;
