import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { Home, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../../api/client';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

type Phase = 'idle' | 'working' | 'done' | 'failed' | 'not-signed-in';

/** Ends the server session first. "You have been logged out" is shown only after the server confirms it. */
export default function LogoutPage() {
  const { status, signOut } = useAuth();
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const started = useRef(false);
  const run = () => {
    setPhase('working'); setError('');
    signOut().then(() => setPhase('done')).catch((e) => { setError(errorMessage(e)); setPhase('failed'); });
  };
  useEffect(() => {
    if (started.current || status === 'loading') return;
    started.current = true;
    if (status === 'authenticated') run(); else setPhase('not-signed-in');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  return (
    <AuthLayout headline={<>Better data. Stronger agriculture. A food secure Rwanda.</>} description="Thank you for being part of Agri-Sight Rwanda.">
      <Box role="status" aria-live="polite" sx={{ textAlign: 'center' }}>
        {(phase === 'idle' || phase === 'working') && <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}><CircularProgress size={22} /><span>Signing you out…</span></Box>}
        {phase === 'failed' && <Box sx={{ display: 'grid', gap: 2 }}><Alert severity="error">{error}</Alert><Button variant="contained" onClick={run}>Try again</Button></Box>}
        {(phase === 'done' || phase === 'not-signed-in') && (<>
          <Box sx={{ color: 'primary.main' }}><LogOut size={48} aria-hidden /></Box>
          <Typography variant="h3" component="h1" sx={{ my: 1 }}>{phase === 'done' ? 'You have been logged out' : 'You are not signed in'}</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>{phase === 'done' ? 'Thank you for using Agri-Sight Rwanda. Your session has been ended.' : 'There is no active session on this device.'}</Typography>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <Button component={Link} to="/" variant="contained" size="large" startIcon={<Home size={18} />}>Back to Home</Button>
            <Button component={Link} to="/login" variant="outlined" size="large" startIcon={<User size={18} />}>Sign In Again</Button>
          </Box></>)}
      </Box>
    </AuthLayout>
  );
}
