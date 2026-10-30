import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { AuthUser, LoginPayload } from '../types/auth';
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await authApi.fetchCsrf();                      // sets the CSRF cookie
        const me = await authApi.fetchMe();             // 403 when there is no session
        if (!cancelled) { setUser(me); setStatus('authenticated'); }
      } catch {
        if (!cancelled) { setUser(null); setStatus('anonymous'); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const signIn = useCallback(async (payload: LoginPayload) => {
    const me = await authApi.login(payload);
    setUser(me); setStatus('authenticated');
    return me;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.logout();                             // only clear local state once the server has ended the session
    setUser(null); setStatus('anonymous');
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, status, signIn, signOut }), [user, status, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
