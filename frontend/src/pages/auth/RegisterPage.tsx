import { useState } from 'react';
import { Alert, Box, Button, ButtonBase, Checkbox, CircularProgress, FormControlLabel, FormHelperText, TextField, Typography } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart3, GraduationCap, Leaf, MoreHorizontal, UserPlus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage, fieldErrors } from '../../api/client';
import { register as registerUser } from '../../api/auth';
import PasswordField from '../../components/auth/PasswordField';
import AuthLayout from '../../components/layout/AuthLayout';
import { field } from '../../utils/forms';
import { registerSchema, type RegisterForm } from '../../utils/schemas';

const ROLES = [
  { value: 'researcher', label: 'Researcher / Analyst', icon: BarChart3 }, { value: 'farmer', label: 'Farmer', icon: Leaf },
  { value: 'student', label: 'Student', icon: GraduationCap }, { value: 'other', label: 'Other', icon: MoreHorizontal },
] as const;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, control, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', phone: '', organization: '', occupation: 'researcher', password: '', password_confirm: '', accept_terms: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await registerUser(values);
      navigate('/verify-email', { state: { email: values.email } });
    } catch (e) {
      const server = fieldErrors(e);
      const keys = Object.keys(server);
      keys.forEach((k) => setFieldError(k === 'non_field_errors' ? 'password' : (k as keyof RegisterForm), { message: server[k] }));
      if (!keys.length) setError(errorMessage(e));
    }
  });

  return (
    <AuthLayout headline={<>Join Agri-Sight Rwanda and be part of a smarter agricultural future</>}
      description="Get access to real data, powerful insights and tools to explore, analyse and improve agricultural productivity across Rwanda.">
      <Box sx={{ textAlign: 'right' }}><Typography variant="body2" color="text.secondary">Already have an account? <Link to="/login" style={{ color: '#047857', fontWeight: 600 }}>Sign In →</Link></Typography></Box>
      <Typography variant="h3" component="h1" sx={{ mb: 0.5 }}>Create Your Account</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Fill in the details below to get started.</Typography>
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ display: 'grid', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: '1fr 1fr' } }}>
          <TextField label="Full Name *" autoComplete="name" {...field(register('full_name'))} error={!!errors.full_name} helperText={errors.full_name?.message} />
          <TextField label="Email Address *" type="email" autoComplete="email" {...field(register('email'))} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Phone Number (Optional)" placeholder="+250 7XX XXX XXX" autoComplete="tel" {...field(register('phone'))} error={!!errors.phone} helperText={errors.phone?.message} />
          <TextField label="Organization / Institution *" placeholder="e.g. Ministry, University, NGO" {...field(register('organization'))} error={!!errors.organization} helperText={errors.organization?.message} />
        </Box>
        <PasswordField label="Password *" autoComplete="new-password" {...field(register('password'))} error={!!errors.password} helperText={errors.password?.message ?? 'At least 8 characters; avoid common passwords.'} />
        <PasswordField label="Confirm Password *" autoComplete="new-password" {...field(register('password_confirm'))} error={!!errors.password_confirm} helperText={errors.password_confirm?.message} />
        <Controller name="occupation" control={control} render={({ field: f }) => (
          <Box role="radiogroup" aria-label="Select your role">
            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Select Your Role *</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4,1fr)' }, gap: 1.5 }}>
              {ROLES.map(({ value, label, icon: Icon }) => (
                <ButtonBase key={value} role="radio" aria-checked={f.value === value} onClick={() => f.onChange(value)}
                  sx={{ border: '1.5px solid', borderColor: f.value === value ? 'primary.main' : 'divider', bgcolor: f.value === value ? '#ECFDF5' : 'transparent', color: f.value === value ? 'primary.main' : 'text.primary', borderRadius: 2, p: 1.5, flexDirection: 'column', gap: 0.5, fontSize: 12, fontWeight: 600 }}>
                  <Icon size={20} aria-hidden />{label}
                </ButtonBase>))}
            </Box>
          </Box>)} />
        <Controller name="accept_terms" control={control} render={({ field: f }) => (
          <Box>
            <FormControlLabel control={<Checkbox checked={f.value} onChange={(e) => f.onChange(e.target.checked)} />} label={<Typography variant="body2">I agree to the Terms of Service and Privacy Policy</Typography>} />
            {errors.accept_terms && <FormHelperText error>{errors.accept_terms.message}</FormHelperText>}
          </Box>)} />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <UserPlus size={18} />}>Create Account</Button>
      </Box>
      <Typography sx={{ mt: 2 }}><Link to="/login" style={{ color: '#047857', fontWeight: 600 }}>← Back to Login</Link></Typography>
    </AuthLayout>
  );
}
