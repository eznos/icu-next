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
  <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
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
      backgroundColor: '#fff',
      borderBottom: '1px solid #e0e0e0',
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

    <Box component='main' sx={{ p: 3, flexGrow: 1 }}>
     {children}
    </Box>
   </Box>
  </Box>
 )
}
