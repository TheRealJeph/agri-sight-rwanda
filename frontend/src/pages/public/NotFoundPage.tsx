import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', p: 3 }}>
      <Box>
        <img src="/logo/agri-sight-logo-transparent.png" alt="Agri-Sight Rwanda" style={{ height: 48, maxWidth: '100%' }} />
        <Typography variant="h1" sx={{ fontSize: 72, mt: 3 }}>404</Typography>
        <Typography variant="h3" component="h1" sx={{ mb: 1 }}>Page not found</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>The page you are looking for does not exist or has moved.</Typography>
        <Button component={Link} to="/" variant="contained">Back to Home</Button>
      </Box>
    </Box>
  );
}
