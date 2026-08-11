'use client'

import { ThemeModeSwitch } from '@/components/theme/theme-mode-switch'
import { useTranslationsNext } from '@/i18n/use-translate-next'
import { Logout } from '@mui/icons-material'
import CircleRoundedIcon from '@mui/icons-material/CircleRounded'
import {
 Box,
 Button,
 IconButton,
 Stack,
 Tooltip,
 Typography,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
export function HeaderBar() {
 const t = useTranslationsNext('navBar')
 const router = useRouter()
 const [now, setNow] = useState(new Date())
 const [isMounted, setIsMounted] = useState(false)

 useEffect(() => {
  setIsMounted(true)

  const timer = setInterval(() => {
   setNow(new Date())
  }, 1000)

  return () => clearInterval(timer)
 }, [])

 const logout = () => {
  // ลบ Token จาก Cookie
  document.cookie = 'token=; path=/; max-age=0;'

  router.push('/th/login') // 🌟 6. พาผู้ใช้ไปยังหน้า Login
  router.refresh()
 }

 return (
  <Box
   sx={{
    backgroundColor: (t) => t.palette.background.paper,
    borderBottom: '1px solid',
    borderColor: 'divider',
    px: { xs: 2, md: 3 }, // 🌟 1. ลด Padding ด้านข้างเมื่ออยู่บนหน้าจอมือถือ (xs)
    py: 1.5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
   }}
  >
   <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
    <CircleRoundedIcon sx={{ color: '#22C55E', fontSize: 14 }} />
    <Typography
     variant='body2'
     //  fontWeight={600}
     // 🌟 (Optional) หากจอมือถือเล็กมากๆ สามารถซ่อนคำว่า Online แล้วเหลือแค่จุดสีเขียวได้
     sx={{ fontWeight: 600 }}
    >
     {t('online')}
    </Typography>
   </Stack>

   <Stack
    direction='row'
    spacing={{ xs: 0.5, sm: 2 }} // 🌟 2. ลดช่องว่าง (Gap) ระหว่างไอคอนบนมือถือ
    // alignItems='center'
    sx={{ alignItems: 'center' }}
   >
    <Typography
     variant='body2'
     color='text.secondary'
     sx={{ display: { xs: 'none', md: 'block' } }} // 🌟 3. ซ่อนเวลาบนหน้าจอมือถือ/แท็บเล็ต เพื่อป้องกันข้อความล้น
    >
     {isMounted ? now.toLocaleString() : ''}
    </Typography>
    <ButtonChangeLocale />
    <ThemeModeSwitch />

    <IconButton edge='end' onClick={logout}>
     {' '}
     {/* 🌟 4. ดัน IconButton ให้ชิดขอบพอดี */}
     <Logout />
    </IconButton>
   </Stack>
  </Box>
 )
}

const ButtonChangeLocale = () => {
 const t = useTranslationsNext('language')
 const router = useRouter()
 const currentPath = window.location.pathname

 const changeLocale = (newLocale: string) => {
  const newPath = currentPath.replace(/^\/(th|en)/, `/${newLocale}`)
  router.push(newPath)
 }

 return (
  <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
   <Tooltip placement='auto' title={t('changeLanguage')}>
    <Button
     onClick={() => changeLocale(currentPath.startsWith('/en') ? 'th' : 'en')}
    >
     {t('en')}
    </Button>
   </Tooltip>
  </Stack>
 )
}
