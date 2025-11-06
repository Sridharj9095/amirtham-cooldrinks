import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './index.css';

// Theme storage utility
const THEME_STORAGE_KEY = 'amirtham-theme-mode';

const getStoredTheme = (): 'light' | 'dark' => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  // Default to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const saveTheme = (mode: 'light' | 'dark') => {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
};

function Root() {
  const [mode, setMode] = useState<'light' | 'dark'>(getStoredTheme());

  useEffect(() => {
    saveTheme(mode);
  }, [mode]);

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#ef4444',
      },
      secondary: {
        main: '#dc2626',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1a1a1a' : '#ef4444',
          },
        },
      },
    },
  });

  const handleThemeChange = (darkMode: boolean) => {
    setMode(darkMode ? 'dark' : 'light');
  };

  return (
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App darkMode={mode === 'dark'} onDarkModeChange={handleThemeChange} />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);

