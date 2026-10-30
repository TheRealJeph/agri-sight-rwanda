import { CircularProgress, Box } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/** Signed-out visitors are sent to /login and returned to the page they asked for after signing in. */
export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') {
    return <Box role="status" aria-label="Loading" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  }
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}
