'use client'

import {
 createTheme,
 CssBaseline,
 ThemeProvider as MuiThemeProvider,
 ThemeOptions,
} from '@mui/material'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ThemeMode = 'light' | 'dark'

type ThemeModeContextValue = {
 mode: ThemeMode
 toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
 undefined,
)

// 🌟 1. แยกการตั้งค่าที่ใช้ร่วมกัน (Shared/Common) เพื่อลดการเขียนโค้ดซ้ำ
const commonOptions: ThemeOptions = {
 typography: {
  fontFamily: "'Prompt', 'Kanit', sans-serif",
  button: {
   textTransform: 'none',
   fontWeight: 500,
  },
 },
 shape: {
  borderRadius: 8,
 },
}

// 🌟 2. Schema สำหรับ Light Mode โดยเฉพาะ
const lightModeSchema: ThemeOptions = {
 ...commonOptions,
 palette: {
  mode: 'light',
  primary: { main: '#14B8A6', contrastText: '#FFFFFF' },
  secondary: { main: '#0F4C3A', contrastText: '#FFFFFF' },
  background: { default: '#F4F6F8', paper: '#FFFFFF' },
  text: { primary: '#1E293B', secondary: '#64748B' },
  divider: '#E2E8F0',
 },
 components: {
  MuiCard: {
   styleOverrides: {
    root: {
     boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
     border: 'none',
     backgroundImage: 'none',
    },
   },
  },
  MuiOutlinedInput: {
   styleOverrides: {
    root: {
     borderRadius: 8,
     backgroundColor: '#FFFFFF',
    },
   },
  },
  MuiTableCell: {
   styleOverrides: {
    head: {
     fontWeight: 600,
     backgroundColor: '#F8FAFC',
    },
   },
  },
 },
}

// 🌟 3. Schema สำหรับ Dark Mode โดยเฉพาะ
const darkModeSchema: ThemeOptions = {
 ...commonOptions,
 palette: {
  mode: 'dark',
  primary: { main: '#14B8A6', contrastText: '#FFFFFF' },
  secondary: { main: '#0F4C3A', contrastText: '#FFFFFF' },
  background: { default: '#0B0F19', paper: '#111827' },
  text: { primary: '#F1F5F9', secondary: '#94A3B8' },
  divider: '#334155',
 },
 components: {
  MuiCard: {
   styleOverrides: {
    root: {
     boxShadow: 'none',
     border: '1px solid #334155',
     backgroundImage: 'none',
    },
   },
  },
  MuiOutlinedInput: {
   styleOverrides: {
    root: {
     borderRadius: 8,
     backgroundColor: '#1E293B',
    },
   },
  },
  MuiTableCell: {
   styleOverrides: {
    head: {
     fontWeight: 600,
     backgroundColor: '#1E293B',
    },
   },
  },
 },
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
 const [mode, setMode] = useState<ThemeMode>('light')
 const [mounted, setMounted] = useState(false)

 useEffect(() => {
  setMounted(true)
  const storedMode = window.localStorage.getItem(
   'theme-mode',
  ) as ThemeMode | null
  if (storedMode) {
   setMode(storedMode)
  }
 }, [])

 const toggleMode = () => {
  setMode((currentMode) => {
   const nextMode = currentMode === 'light' ? 'dark' : 'light'
   window.localStorage.setItem('theme-mode', nextMode)
   return nextMode
  })
 }

 // 🌟 4. เรียกใช้ Schema ที่แยกไว้ ทำให้โค้ดส่วนนี้สะอาดขึ้นมาก
 const theme = useMemo(
  () => createTheme(mode === 'light' ? lightModeSchema : darkModeSchema),
  [mode],
 )

 const value = useMemo(() => ({ mode, toggleMode }), [mode])

 if (!mounted) {
  return null
 }

 return (
  <ThemeModeContext.Provider value={value}>
   <MuiThemeProvider theme={theme}>
    <CssBaseline />
    {children}
   </MuiThemeProvider>
  </ThemeModeContext.Provider>
 )
}

export function useThemeMode() {
 const context = useContext(ThemeModeContext)
 if (!context) {
  throw new Error('useThemeMode must be used within AppThemeProvider')
 }
 return context
}
