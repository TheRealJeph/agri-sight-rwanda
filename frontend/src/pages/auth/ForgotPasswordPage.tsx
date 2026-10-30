import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, InputAdornment, TextField, Typography } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../../api/auth';
import { errorMessage } from '../../api/client';
import AuthLayout from '../../components/layout/AuthLayout';
import { field } from '../../utils/forms';
import { forgotSchema, type ForgotForm } from '../../utils/schemas';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });
  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null); setSent(null);
    try { setSent((await forgotPassword(email)).detail); } catch (e) { setError(errorMessage(e)); }
  });
  return (
    <AuthLayout headline="Reset Your Password" description="No worries. Enter your email address and we will send you a secure link to reset your password." backTo={{ to: '/login', label: 'Back to Login' }}>
      <Typography variant="h3" component="h1" sx={{ mb: 0.5 }}>Forgot Your Password?</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Enter your email address and we’ll send you a link to reset your password.</Typography>
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ display: 'grid', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {sent && <Alert severity="success" role="status">{sent} The link expires in 15 minutes and works once.</Alert>}
        <TextField label="Email Address *" type="email" autoComplete="email" placeholder="you@example.com" fullWidth {...field(register('email'))} error={!!errors.email} helperText={errors.email?.message}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={18} aria-hidden /></InputAdornment> } }} />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <Send size={18} />}>Send Reset Link</Button>
      </Box>
    </AuthLayout>
  );
}
