import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { MailCheck, RefreshCw } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { resendVerification, verifyEmail } from '../../api/auth';
import { errorMessage } from '../../api/client';
import AuthLayout from '../../components/layout/AuthLayout';

const COOLDOWN_SECONDS = 60;
type Phase = 'checking' | 'verified' | 'failed';

function CheckEmail() {
  const initial = (useLocation().state as { email?: string } | null)?.email ?? '';
  const [email, setEmail] = useState(initial);
  const [left, setLeft] = useState(initial ? COOLDOWN_SECONDS : 0);   // a link was just sent at registration
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const resend = async () => {
    setBusy(true); setMsg(null);
    try { setMsg({ ok: true, text: (await resendVerification(email)).detail }); setLeft(COOLDOWN_SECONDS); }
    catch (e) { setMsg({ ok: false, text: errorMessage(e) }); }
    finally { setBusy(false); }
  };
  return (<>
    <Box sx={{ color: 'primary.main', mb: 1 }}><MailCheck size={48} aria-hidden /></Box>
    <Typography variant="h3" component="h1" sx={{ mb: 1 }}>Check Your Email</Typography>
    <Typography color="text.secondary" sx={{ mb: 2 }}>We’ve sent a verification link to your email address. Open it to activate your account. If it doesn’t arrive within a few minutes, check your spam folder.</Typography>
    {msg && <Alert severity={msg.ok ? 'success' : 'error'} role="status" sx={{ mb: 2 }}>{msg.text}</Alert>}
    <TextField label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth sx={{ mb: 2 }} />
    <Button variant="outlined" fullWidth size="large" disabled={busy || left > 0 || !email} onClick={() => void resend()} startIcon={busy ? <CircularProgress size={18} /> : <RefreshCw size={18} />}>
      {left > 0 ? `You can request a new link in ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : 'Resend Verification Email'}
    </Button>
  </>);
}

function Verifying({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [text, setText] = useState('');
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;                    // the link works once: never call it twice (React StrictMode)
    started.current = true;
    verifyEmail(token).then((r) => { setText(r.detail); setPhase('verified'); }).catch((e) => { setText(errorMessage(e)); setPhase('failed'); });
  }, [token]);
  return (<>
    <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Email verification</Typography>
    <Box role="status" aria-live="polite">
      {phase === 'checking' && <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}><CircularProgress size={22} /><span>Verifying your email…</span></Box>}
      {phase === 'verified' && <Alert severity="success">{text}</Alert>}
      {phase === 'failed' && <Alert severity="error">{text} <Link to="/verify-email">Request a new link</Link></Alert>}
    </Box>
    {phase === 'verified' && <Button component={Link} to="/login" variant="contained" size="large" sx={{ mt: 3 }}>Sign In</Button>}
  </>);
}

export default function VerifyEmailPage() {
  const token = useSearchParams()[0].get('token');
  return (
    <AuthLayout headline={<>A healthier agriculture sector for a prosperous Rwanda</>} description="We provide data-driven insights to help decision-makers improve agricultural productivity." backTo={{ to: '/login', label: 'Back to Login' }}>
      {token ? <Verifying token={token} /> : <CheckEmail />}
    </AuthLayout>
  );
}
