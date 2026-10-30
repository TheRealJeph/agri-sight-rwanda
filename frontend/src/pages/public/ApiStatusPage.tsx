import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useHealth } from '../../hooks/useHealth';

/** Phase 1 verification page: proves the React app can reach the Django API and its database.
 *  It is replaced by the real Home page in Phase 3. */
export default function ApiStatusPage() {
  const { loading, data, error, reload } = useHealth();
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Card sx={{ maxWidth: 520, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <img src="/logo/agri-sight-logo-transparent.png" alt="Agri-Sight Rwanda" style={{ height: 56, maxWidth: "100%", marginBottom: 16 }} />
          <Typography variant="h3" component="h1" gutterBottom>System status</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Better data. Stronger agriculture. A food secure Rwanda.
          </Typography>
          <Box role="status" aria-live="polite">
            {loading && <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}><CircularProgress size={22} /><span>Checking the API…</span></Stack>}
            {error && <Alert severity="error">{error}</Alert>}
            {data && (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><b>API</b>
                  <Chip size="small" color={data.status === 'ok' ? 'success' : 'warning'} label={data.status} /></Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><b>Database</b>
                  <Chip size="small" color={data.database === 'ok' ? 'success' : 'error'} label={data.database} /></Stack>
                <Typography variant="body2" color="text.secondary">API version {data.version}</Typography>
              </Stack>
            )}
          </Box>
          <Button sx={{ mt: 3 }} variant="outlined" onClick={() => void reload()} disabled={loading}>Check again</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
