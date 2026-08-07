'use client'

import { HeaderBar } from '@/components/admin/header'
import { Sidebar } from '@/components/admin/sidebar'
import MenuIcon from '@mui/icons-material/Menu'
import { Box, IconButton } from '@mui/material'
import { useState, type ReactNode } from 'react'

type ResponsiveAdminLayoutProps = {
 children: ReactNode
 locale?: string
}

export default function AdminLayout({
 children,
 locale,
}: ResponsiveAdminLayoutProps) {
 const [mobileOpen, setMobileOpen] = useState(false)

 const handleDrawerToggle = () => {
  setMobileOpen(!mobileOpen)
 }

 return (
  <Box
   sx={{
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: (e) => e.palette.background.default,
   }}
  >
   <Sidebar
    locale={locale || 'th'}
    mobileOpen={mobileOpen}
    onClose={handleDrawerToggle}
   />

   <Box
    sx={{
     flexGrow: 1,
     display: 'flex',
     flexDirection: 'column',
     width: { md: `calc(100% - 280px)` },
    }}
   >
    {/* คลุม HeaderBar เดิม และเพิ่มปุ่ม Hamburger สำหรับหน้าจอมือถือ */}
    <Box
     sx={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: (e) => e.palette.background.paper,
      borderBottom: (e) => `1px solid ${e.palette.divider}`,
     }}
    >
     <IconButton
      color='inherit'
      aria-label='open drawer'
      edge='start'
      onClick={handleDrawerToggle}
      sx={{ ml: 2, display: { md: 'none' }, color: '#1E2235' }}
     >
      <MenuIcon />
     </IconButton>
     <Box sx={{ flexGrow: 1 }}>
      <HeaderBar />
     </Box>
    </Box>

    <Box
     component='main'
     sx={{
      p: 3,
      flexGrow: 1,
      maxHeight: 'calc(100vh - 64px)',
      overflowY: 'auto',
     }}
    >
     {children}
    </Box>
   </Box>
  </Box>
 )
}
