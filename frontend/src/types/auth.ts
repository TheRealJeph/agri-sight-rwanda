export type Occupation = 'researcher' | 'farmer' | 'student' | 'other';
export type AccessLevel = 'viewer' | 'analyst' | 'administrator';

export interface UserProfile {
  full_name: string;
  email: string;
  email_verified: boolean;
  phone: string;
  organization: string;
  biography: string;
  occupation: Occupation;
  access_level: AccessLevel;
  created_at: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  default_season: '' | 'A' | 'B' | 'C';
  default_crop: string;
  default_district: string;
  email_notifications: boolean;
  system_alerts: boolean;
}

export interface AuthUser {
  id: number;
  email: string;
  email_verified: boolean;
  profile: UserProfile;
  preferences: UserPreferences;
}

export interface Detail { detail: string }
export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  full_name: string; email: string; phone: string; organization: string; occupation: Occupation;
  password: string; password_confirm: string; accept_terms: boolean;
}
export interface ResetPasswordPayload { token: string; password: string; password_confirm: string }
