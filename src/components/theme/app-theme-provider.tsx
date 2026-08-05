'use client';

import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark' 

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export function AppThemeProvider({children}: {children: ReactNode}) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const storedMode = window.localStorage.getItem('theme-mode') as ThemeMode | null;
    if (storedMode) {
      setMode(storedMode);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMode(prefersDark ? 'dark' : 'light');
  }, []);

  const toggleMode = () => {
    setMode((currentMode) => {
      const nextMode = currentMode === 'light' ? 'dark' : 'light';
      window.localStorage.setItem('theme-mode', nextMode);
      return nextMode;
    });
  };
  // TODO FIX Theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          primary: {
            main: '#14B8A6'
          },
          background: {
            default: mode === 'light' ? '#F3F4F6' : '#0f172a'
          }
        },
        shape: {
          borderRadius: 10
        }
      }),
    [mode]
  );

  const value = useMemo(() => ({mode, toggleMode}), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within AppThemeProvider');
  }
  return context;
}
