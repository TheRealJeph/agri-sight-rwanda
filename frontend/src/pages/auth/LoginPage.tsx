import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, InputAdornment, TextField, Typography } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { errorCode, errorMessage } from '../../api/client';
import PasswordField from '../../components/auth/PasswordField';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { field } from '../../utils/forms';
import { loginSchema, type LoginForm } from '../../utils/schemas';

export default function LoginPage() {
  const { signIn, status } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/dashboard';
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (status === 'authenticated') return <Navigate to={from} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setError(null); setUnverified(null);
    try {
      await signIn(values);
      navigate(from, { replace: true });
    } catch (e) {
      if (errorCode(e) === 'email_not_verified') setUnverified(values.email);
      setError(errorMessage(e));
    }
  });

  return (
    <AuthLayout headline="Data-Driven Insights for a More Productive Agriculture"
      description="Agri-Sight Rwanda helps decision-makers explore agricultural data, discover trends and see where yield gaps persist across Rwanda.">
      <Typography variant="h3" component="h1" sx={{ mb: 0.5 }}>Welcome Back</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Sign in to your account to continue.</Typography>
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ display: 'grid', gap: 2 }}>
        {error && <Alert severity="error">{error}{unverified && <> <Link to="/verify-email" state={{ email: unverified }}>Verify your email</Link></>}</Alert>}
        <TextField label="Email" type="email" autoComplete="email" fullWidth {...field(register('email'))} error={!!errors.email} helperText={errors.email?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={18} aria-hidden /></InputAdornment> } }} />
        <PasswordField label="Password" autoComplete="current-password" {...field(register('password'))} error={!!errors.password} helperText={errors.password?.message} />
        <Box sx={{ textAlign: 'right' }}><Link to="/forgot-password" style={{ color: '#047857', fontWeight: 600 }}>Forgot password?</Link></Box>
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} endIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <ArrowRight size={18} />}>Sign In</Button>
      </Box>
      <Typography sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">Don’t have an account? <Link to="/register" style={{ color: '#047857', fontWeight: 600 }}>Create one</Link></Typography>
    </AuthLayout>
  );
}
