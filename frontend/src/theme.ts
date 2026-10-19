import { createTheme } from '@mui/material/styles';

// One place for the app's look: colors, shape, typography
export const theme = createTheme({
  palette: {
    primary: { main: '#4f46e5' },
    background: { default: '#f5f5f7' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
});
