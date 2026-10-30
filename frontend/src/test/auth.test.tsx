import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '../api/auth';
import LoginPage from '../pages/auth/LoginPage';
import LogoutPage from '../pages/auth/LogoutPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';
import ProtectedRoute from '../routes/ProtectedRoute';
import { USER, apiError, renderWithAuth } from './helpers';

vi.mock('../api/auth');
beforeEach(() => vi.resetAllMocks());

describe('ProtectedRoute', () => {
  const tree = (<Routes><Route path="/login" element={<p>login page</p>} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<p>secret</p>} /></Route></Routes>);
  it('sends signed-out visitors to the login page', () => {
    renderWithAuth(tree, { status: 'anonymous' }, '/dashboard');
    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });
  it('shows a loading indicator while the session is being checked', () => {
    renderWithAuth(tree, { status: 'loading' }, '/dashboard');
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });
  it('lets signed-in users through', () => {
    renderWithAuth(tree, { status: 'authenticated', user: USER }, '/dashboard');
    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});

describe('LoginPage', () => {
  it('validates before calling the server', async () => {
    const signIn = vi.fn();
    renderWithAuth(<LoginPage />, { signIn });
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Enter your email.')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });
  it('signs in with valid credentials', async () => {
    const signIn = vi.fn().mockResolvedValue(USER);
    renderWithAuth(<LoginPage />, { signIn });
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Str0ng-Passw0rd!x');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(signIn).toHaveBeenCalledWith({ email: 'user@example.com', password: 'Str0ng-Passw0rd!x' }));
  });
  it('shows the server error and never claims success when sign-in fails', async () => {
    const signIn = vi.fn().mockRejectedValue(apiError(401, { detail: 'Email or password is not correct.' }));
    renderWithAuth(<LoginPage />, { signIn });
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is not correct.');
  });
  it('offers email verification when the account is not verified', async () => {
    const signIn = vi.fn().mockRejectedValue(apiError(403, { detail: 'Please verify your email before signing in.', code: 'email_not_verified' }));
    renderWithAuth(<LoginPage />, { signIn });
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Str0ng-Passw0rd!x');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('link', { name: /verify your email/i })).toBeInTheDocument();
  });
  it('toggles password visibility', async () => {
    renderWithAuth(<LoginPage />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(input).toHaveAttribute('type', 'text');
  });
});

describe('RegisterPage', () => {
  it('blocks mismatched passwords and a missing terms agreement', async () => {
    renderWithAuth(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/organization/i), 'NISR');
    await userEvent.type(screen.getByLabelText(/^password \*/i), 'Str0ng-Passw0rd!x');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different-password');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(screen.getByText(/you must accept the terms/i)).toBeInTheDocument();
    expect(authApi.register).not.toHaveBeenCalled();
  });
  it('shows a field error returned by the server', async () => {
    vi.mocked(authApi.register).mockRejectedValue(apiError(400, { email: ['An account with this email already exists.'] }));
    renderWithAuth(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/organization/i), 'NISR');
    await userEvent.type(screen.getByLabelText(/^password \*/i), 'Str0ng-Passw0rd!x');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Str0ng-Passw0rd!x');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument();
  });
});

describe('VerifyEmailPage', () => {
  it('confirms a valid link', async () => {
    vi.mocked(authApi.verifyEmail).mockResolvedValue({ detail: 'Your email is verified. You can now sign in.' });
    renderWithAuth(<VerifyEmailPage />, {}, '/verify-email?token=abc');
    expect(await screen.findByText(/your email is verified/i)).toBeInTheDocument();
    expect(authApi.verifyEmail).toHaveBeenCalledTimes(1);
  });
  it('reports an invalid or expired link as an error', async () => {
    vi.mocked(authApi.verifyEmail).mockRejectedValue(apiError(400, { detail: 'This verification link is invalid or has expired.' }));
    renderWithAuth(<VerifyEmailPage />, {}, '/verify-email?token=bad');
    expect(await screen.findByRole('alert')).toHaveTextContent('invalid or has expired');
  });
  it('lets the user resend only after the cooldown and shows the cooldown', () => {
    renderWithAuth(<VerifyEmailPage />, {}, { pathname: '/verify-email', state: { email: 'a@example.com' } });
    expect(screen.getByRole('button', { name: /request a new link in 1:00/i })).toBeDisabled();
  });
});

describe('LogoutPage', () => {
  it('shows the success message only after the server ended the session', async () => {
    let finish: () => void = () => undefined;
    const signOut = vi.fn(() => new Promise<void>((res) => { finish = res; }));
    renderWithAuth(<LogoutPage />, { status: 'authenticated', user: USER, signOut });
    expect(await screen.findByText(/signing you out/i)).toBeInTheDocument();
    expect(screen.queryByText(/you have been logged out/i)).not.toBeInTheDocument();
    finish();
    expect(await screen.findByText(/you have been logged out/i)).toBeInTheDocument();
  });
  it('shows an error, not success, when logout fails', async () => {
    const signOut = vi.fn().mockRejectedValue(apiError(500, { detail: 'boom' }));
    renderWithAuth(<LogoutPage />, { status: 'authenticated', user: USER, signOut });
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText(/you have been logged out/i)).not.toBeInTheDocument();
  });
});
