import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import { errorMessage, fieldErrors } from '../../api/client';
import PasswordField from '../../components/auth/PasswordField';
import AuthLayout from '../../components/layout/AuthLayout';
import { field } from '../../utils/forms';
import { resetSchema, type ResetForm } from '../../utils/schemas';

export default function ResetPasswordPage() {
  const { token = '' } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });
  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try { setDone((await resetPassword({ token, ...values })).detail); }
    catch (e) {
      const server = fieldErrors(e);
      if (server.password) setFieldError('password', { message: server.password });
      else setError(errorMessage(e));
    }
  });
  return (
    <AuthLayout headline="Choose a new password" description="Pick a strong password you have not used elsewhere." backTo={{ to: '/login', label: 'Back to Login' }}>
      <Typography variant="h3" component="h1" sx={{ mb: 2 }}>Reset Password</Typography>
      {done ? (
        <Box sx={{ display: 'grid', gap: 2 }}><Alert severity="success" role="status">{done}</Alert><Button component={Link} to="/login" variant="contained" size="large">Sign In</Button></Box>
      ) : (
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ display: 'grid', gap: 2 }}>
          {error && <Alert severity="error">{error} <Link to="/forgot-password">Request a new link</Link></Alert>}
          <PasswordField label="New password" autoComplete="new-password" {...field(register('password'))} error={!!errors.password} helperText={errors.password?.message ?? 'At least 8 characters; avoid common passwords.'} />
          <PasswordField label="Confirm new password" autoComplete="new-password" {...field(register('password_confirm'))} error={!!errors.password_confirm} helperText={errors.password_confirm?.message} />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}>Change password</Button>
        </Box>
      )}
    </AuthLayout>
  );
}
