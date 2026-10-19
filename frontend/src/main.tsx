import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { theme } from './theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline: MUI's CSS reset (margins, box-sizing, background color) */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
