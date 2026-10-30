import { useCallback, useEffect, useState } from 'react';
import { getHealth } from '../api/health';
import { errorMessage } from '../api/client';
import type { HealthResponse } from '../types/api';

type State = { loading: boolean; data: HealthResponse | null; error: string | null };

export function useHealth() {
  const [state, setState] = useState<State>({ loading: true, data: null, error: null });
  const load = useCallback(async () => {
    setState({ loading: true, data: null, error: null });
    try {
      setState({ loading: false, data: await getHealth(), error: null });
    } catch (e) {
      setState({ loading: false, data: null, error: errorMessage(e) });
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return { ...state, reload: load };
}
