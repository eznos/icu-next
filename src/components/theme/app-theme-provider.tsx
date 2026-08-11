'use client'

import {
 createTheme,
 CssBaseline,
 ThemeProvider as MuiThemeProvider,
 ThemeOptions,
} from '@mui/material'
import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

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

const componentsOverrides: ThemeOptions['components'] = {
 MuiCssBaseline: {
  styleOverrides: {
   body: {
    // keep theme toggle smooth but avoid a long flash
    transition: 'background-color 0.25s ease-in-out, color 0.25s ease-in-out',
   },
  },
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
  ...componentsOverrides,
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
  MuiButton: {
   styleOverrides: {
    root: {
     borderRadius: 10,
     //  variant: 'contained',
     variants: [
      {
       props: { variant: 'outlined' },
       style: {
        borderWidth: '3px',
       },
      },
      {
       props: { variant: 'contained' },
       style: {
        borderWidth: '3px',
        borderRadius: 10,
        backgroundColor: '#14B8A6',
        color: '#FFFFFF',
       },
      },
     ],
    },
   },
  },
  // MuiInputBase: {
  //  styleOverrides: {
  //   root: {
  //    //  borderRadius: 8,
  //    props: { variant: 'outlined' },
  //    style: {
  //     input: {
  //      style: {
  //       borderRadius: 10,
  //      },
  //      borderRadius: 8,
  //     },
  //    },
  //   },
  //  },
  // },

  // 🌟 จัดการกับตัวช่องกรอกข้อมูล (ตัวหนังสือ, ช่องว่างด้านใน)
  MuiInputBase: {
   styleOverrides: {
    input: {
     // ไม่ต้องใส่ borderRadius ตรงนี้ เพราะเส้นกรอบมันอยู่ที่ตัวครอบด้านบน
     // แต่สามารถปรับพวก padding หรือ font ได้ที่นี่
     // padding: '12px 14px',
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
  ...componentsOverrides,
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
  MuiButton: {
   styleOverrides: {
    root: {
     borderRadius: '4px',
     variants: [
      {
       props: { variant: 'outlined' },
       style: {
        borderWidth: '3px',
        borderRadius: '4px',
       },
      },
      {
       props: { variant: 'contained' },
       style: {
        borderWidth: '3px',
        borderRadius: '4px',
        backgroundColor: '#14B8A6',
        color: '#FFFFFF',
       },
      },
     ],
    },
   },
  },
 },
}

export function AppThemeProvider({
 children,
 initialMode,
}: {
 children: ReactNode
 initialMode?: ThemeMode
}) {
 const [mode, setMode] = useState<ThemeMode>(initialMode ?? 'light')

 const toggleMode = () => {
  setMode((currentMode) => {
   const nextMode = currentMode === 'light' ? 'dark' : 'light'
   window.localStorage.setItem('theme-mode', nextMode)
   document.cookie = `theme-mode=${nextMode}; path=/; max-age=31536000; SameSite=Lax`
   return nextMode
  })
 }

 // 🌟 4. เรียกใช้ Schema ที่แยกไว้ ทำให้โค้ดส่วนนี้สะอาดขึ้นมาก
 const theme = useMemo(
  () => createTheme(mode === 'light' ? lightModeSchema : darkModeSchema),
  [mode],
 )

 const value = useMemo(() => ({ mode, toggleMode }), [mode])

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
