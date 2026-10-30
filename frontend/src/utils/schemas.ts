import { z } from 'zod';

const password = z.string().min(8, 'Use at least 8 characters.');

export const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email.').pipe(z.email('Enter a valid email address.')),
  password: z.string().min(1, 'Enter your password.'),
});

export const registerSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name.'),
  email: z.string().min(1, 'Enter your email.').pipe(z.email('Enter a valid email address.')),
  phone: z.string().regex(/^[+\d\s()-]*$/, 'Use digits, spaces, + or - only.'),
  organization: z.string().trim().min(2, 'Enter your organization or institution.'),
  occupation: z.enum(['researcher', 'farmer', 'student', 'other']),
  password,
  password_confirm: z.string().min(1, 'Confirm your password.'),
  accept_terms: z.boolean().refine((v) => v, 'You must accept the Terms of Service and Privacy Policy.'),
}).refine((d) => d.password === d.password_confirm, { path: ['password_confirm'], message: 'Passwords do not match.' });

export const forgotSchema = z.object({ email: z.string().min(1, 'Enter your email.').pipe(z.email('Enter a valid email address.')) });

export const resetSchema = z.object({ password, password_confirm: z.string().min(1, 'Confirm your password.') })
  .refine((d) => d.password === d.password_confirm, { path: ['password_confirm'], message: 'Passwords do not match.' });

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ForgotForm = z.infer<typeof forgotSchema>;
export type ResetForm = z.infer<typeof resetSchema>;
