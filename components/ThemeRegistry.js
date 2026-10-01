'use client';
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF8C00', // Using the orange from the image
    },
    secondary: {
      main: '#2E7D32',
    },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", sans-serif',
  },
});

export default function ThemeRegistry({ children }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
