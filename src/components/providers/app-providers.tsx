'use client';

import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter';
import type {ReactNode} from 'react';
import {AppThemeProvider} from '@/components/theme/app-theme-provider';

export function AppProviders({children}: {children: ReactNode}) {
  return (
    <AppRouterCacheProvider>
      <AppThemeProvider>{children}</AppThemeProvider>
    </AppRouterCacheProvider>
  );
}
