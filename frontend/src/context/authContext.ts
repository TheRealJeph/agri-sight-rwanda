import { createContext } from 'react';
import type { AuthUser, LoginPayload } from '../types/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  signIn: (payload: LoginPayload) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
