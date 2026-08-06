'use client'

import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { IconButton, Tooltip } from '@mui/material'
import { useThemeMode } from './app-theme-provider'

export function ThemeModeSwitch() {
 const { mode, toggleMode } = useThemeMode()

 return (
  <Tooltip
   title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
  >
   <IconButton color='inherit' onClick={toggleMode}>
    {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
   </IconButton>
  </Tooltip>
 )
}
