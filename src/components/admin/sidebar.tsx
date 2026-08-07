'use client'

import { useTranslationsNext } from '@/i18n/use-translate-next'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import {
 Box,
 Drawer,
 List,
 ListItemButton,
 ListItemIcon,
 ListItemText,
 Typography,
} from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const DRAWER_WIDTH = 280

const navIcons = {
 dashboard: <DashboardRoundedIcon fontSize='small' />,
 official: <PeopleAltRoundedIcon fontSize='small' />,
 reports: <DescriptionRoundedIcon fontSize='small' />,
 settings: <SettingsRoundedIcon fontSize='small' />,
}

type SidebarProps = {
 locale: string
 mobileOpen: boolean
 onClose: () => void
}

export function Sidebar({ locale, mobileOpen, onClose }: SidebarProps) {
 const t = useTranslationsNext('navBar')
 const x = useTranslationsNext('sidebar')
 const pathname = usePathname()

 const menuItems = [
  { key: 'dashboard', href: `/${locale}/dashboard` },
  { key: 'official', href: `/${locale}/official` },
  { key: 'reports', href: `/${locale}/reports` },
  { key: 'settings', href: `/${locale}/settings` },
 ]

 // แยกเนื้อหาเมนูออกมาเพื่อให้เรียกใช้ซ้ำได้ทั้ง 2 โหมด (มือถือ/เดสก์ท็อป)
 const drawerContent = (
  <Box
   sx={{
    backgroundColor: (e) => e.palette.background.paper,
    // color: () => '#fff',
    height: '100%',
    px: 2,
    py: 3,
   }}
  >
   <Box sx={{ px: 1.5, pb: 3 }}>
    <Typography variant='h6' fontWeight={700}>
     {t('brand')}
    </Typography>
   </Box>

   <List disablePadding>
    {menuItems.map((item) => {
     const active = pathname === item.href
     return (
      <ListItemButton
       key={item.key}
       component={Link}
       href={item.href}
       onClick={onClose} // กดแล้วปิดเมนูอัตโนมัติบนมือถือ
       sx={{
        borderRadius: 2,
        mb: 1,
        bgcolor: active ? '#14B8A6' : 'transparent',
        color: (e) => (active ? '#fff' : e.palette.text.primary),
        '&:hover': {
         bgcolor: active ? '#14B8A6' : 'rgba(255,255,255,0.08)',
        },
       }}
      >
       <ListItemIcon sx={{ minWidth: 36 }}>
        {navIcons[item.key as keyof typeof navIcons]}
       </ListItemIcon>
       <ListItemText primary={x(item.key as keyof typeof navIcons)} />
      </ListItemButton>
     )
    })}
   </List>
  </Box>
 )

 return (
  <Box
   component='nav'
   sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
  >
   {/* 📱 โหมดมือถือ: ซ่อนเมนูไว้ และแสดงเมื่อ mobileOpen = true */}
   <Drawer
    variant='temporary'
    open={mobileOpen}
    onClose={onClose}
    ModalProps={{ keepMounted: true }} // ช่วยลดปัญหา Performance บนมือถือ
    sx={{
     display: { xs: 'block', md: 'none' },
     '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      width: DRAWER_WIDTH,
      borderRight: 'none',
     },
    }}
   >
    {drawerContent}
   </Drawer>

   {/* 💻 โหมดเดสก์ท็อป: แสดงเมนูค้างไว้เสมอ */}
   <Drawer
    variant='permanent'
    sx={{
     display: { xs: 'none', md: 'block' },
     '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      width: DRAWER_WIDTH,
      borderRight: 'none',
     },
    }}
    open
   >
    {drawerContent}
   </Drawer>
  </Box>
 )
}
