import { createTheme } from '@mui/material/styles';

/** MUI theme built from the approved palette (mirrors src/styles/tokens.css). */
export const theme = createTheme({
  palette: {
    primary: { main: '#047857', dark: '#064E3B', light: '#10B981', contrastText: '#FFFFFF' },
    secondary: { main: '#064E3B' },
    background: { default: '#F7FBF9', paper: '#FFFFFF' },
    text: { primary: '#123C35', secondary: '#64748B' },
    divider: '#DDEBE5',
    error: { main: '#DC2626' },
    warning: { main: '#D97706' },
    success: { main: '#10B981' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
    h1: { fontWeight: 800, color: '#064E3B' },
    h2: { fontWeight: 800, color: '#064E3B' },
    h3: { fontWeight: 700, color: '#064E3B' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #DDEBE5', boxShadow: '0 1px 2px rgba(6,78,59,.06), 0 4px 14px rgba(6,78,59,.05)' } } },
  },
});
