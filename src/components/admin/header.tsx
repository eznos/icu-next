'use client'

import { useCurrentUser } from '@/apis/auth'
import { ThemeModeSwitch } from '@/components/theme/theme-mode-switch'
import { useTranslationsNext } from '@/i18n/use-translate-next'
import { Logout } from '@mui/icons-material'
import CircleRoundedIcon from '@mui/icons-material/CircleRounded'
import {
 Avatar,
 Box,
 Button,
 IconButton,
 Stack,
 Tooltip,
 Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
export function HeaderBar() {
 const t = useTranslationsNext('navBar')
 const router = useRouter()
 const { user } = useCurrentUser()
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
  document.cookie = 'token=; path=/; max-age=0;'
  if (typeof window !== 'undefined') {
   localStorage.removeItem('user')
  }

  router.push('/th/login')
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
    <CircleRoundedIcon
     sx={{
      color: '#22C55E',
      fontSize: 14,

      animation: 'blink 1s infinite', // 🌟 กำหนดความเร็วการกระพริบ (1.5 วินาที)
      '@keyframes blink': {
       '0%': { opacity: 1 },
       '25%': { opacity: 0.5 },
       '50%': { opacity: 0.3 },
       '75%': { opacity: 0.5 },
       '100%': { opacity: 1 },
      },
     }}
    />
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
    spacing={{ xs: 1, sm: 1.5 }}
    sx={{ alignItems: 'center' }}
   >
    <Typography
     variant='body2'
     color='text.secondary'
     sx={{ display: { xs: 'none', lg: 'block' } }}
    >
     {isMounted ? dayjs(now).format('YYYY-MM-DD HH:mm:ss') : ''}
    </Typography>
    <ButtonChangeLocale />
    <ThemeModeSwitch />

    {user && (
     <Box
      sx={{
       display: 'flex',
       alignItems: 'center',
       gap: 1.25,
       pl: 0.75,
       pr: 1.5,
       py: 0.4,
       borderRadius: '24px',
       bgcolor: (theme) =>
        theme.palette.mode === 'dark'
         ? 'rgba(255, 255, 255, 0.05)'
         : '#F1F5F9',
       border: '1px solid',
       borderColor: 'divider',
      }}
     >
      <Avatar
       sx={{
        width: 28,
        height: 28,
        bgcolor: '#0D9488',
        color: '#FFFFFF',
        fontWeight: 700,
        fontSize: '0.8rem',
       }}
      >
       {(user.firstName || user.username || 'U')[0].toUpperCase()}
      </Avatar>
      <Box
       sx={{
        display: { xs: 'none', sm: 'block' },
        textAlign: 'left',
        lineHeight: 1.2,
       }}
      >
       <Typography
        variant='body2'
        sx={{
         fontWeight: 700,
         fontSize: '0.82rem',
         color: 'text.primary',
         maxWidth: 160,
         overflow: 'hidden',
         textOverflow: 'ellipsis',
         whiteSpace: 'nowrap',
        }}
       >
        {[user.firstName, user.lastName].filter(Boolean).join(' ') ||
         user.username}
       </Typography>
       <Typography
        variant='caption'
        sx={{
         color: 'text.secondary',
         fontSize: '0.7rem',
         display: 'block',
        }}
       >
        {user.ward || 'MICU3'}{' '}
        {user.role ? '• ' + user.role : ''}
       </Typography>
      </Box>
     </Box>
    )}

    <Tooltip title='ออกจากระบบ'>
     <IconButton edge='end' onClick={logout} sx={{ ml: 0.5 }}>
      <Logout />
     </IconButton>
    </Tooltip>
   </Stack>
  </Box>
 )
}

const ButtonChangeLocale = () => {
 const t = useTranslationsNext('language')
 const router = useRouter()

 // 🌟 3. เปลี่ยนจาก window.location.pathname มาใช้ usePathname()
 const currentPath = usePathname()

 const changeLocale = (newLocale: string) => {
  // ดักไว้ก่อนเผื่อ currentPath ยังโหลดไม่เสร็จ
  if (!currentPath) return

  const newPath = currentPath.replace(/^\/(th|en)/, `/${newLocale}`)
  router.push(newPath)
 }

 return (
  <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
   <Tooltip placement='auto' title={t('changeLanguage')}>
    <Button
     onClick={() => changeLocale(currentPath?.startsWith('/en') ? 'th' : 'en')}
    >
     {t('en')}
    </Button>
   </Tooltip>
  </Stack>
 )
}
