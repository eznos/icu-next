'use client'

import { useTranslationsNext } from '@/i18n/use-translate-next'
import {
 Box,
 Button,
 Card,
 CardContent,
 Stack,
 Typography,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import {
 FieldValues,
 FormContainer,
 TextFieldElement,
 useFormContext,
} from 'react-hook-form-mui'
type LoginFormData = {
 username: string
 password: string
}
export default function LoginPage() {
 const t = useTranslationsNext('login')
 const formContext = useFormContext<LoginFormData>()

 const router = useRouter() // 🌟 2. เรียกใช้งาน router

 const handleSubmit = (data: FieldValues) => {
  // 🌟 3. จำลองการสร้าง Token
  const mockToken = `mock-token-${data.username}-${Date.now()}`

  document.cookie = `token=${mockToken}; path=/; max-age=86400;`
  console.log(document.cookie)
  // 🌟 5. พาผู้ใช้ไปยังหน้า Dashboard (ปรับภาษาให้ตรงกับระบบของคุณ)
  router.push('/th/dashboard')

  router.refresh()
 }

 return (
  <Box
   sx={{
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.default',
    p: 2,
   }}
  >
   <Card sx={{ width: '100%', maxWidth: 420 }}>
    <CardContent>
     <FormContainer context={formContext} onSuccess={(e) => handleSubmit(e)}>
      <Stack spacing={2}>
       <Typography variant='h5' fontWeight={700}>
        {t('title')}
       </Typography>

       {/* 🌟 6. เพิ่ม name="username" และ name="password" */}
       <TextFieldElement
        name='username'
        label={t('username')}
        fullWidth
        required
       />
       <TextFieldElement
        name='password'
        label={t('password')}
        type='password'
        fullWidth
        required
       />

       <Button variant='contained' type='submit' size='large' fullWidth>
        {t('submit')}
       </Button>
      </Stack>
     </FormContainer>
    </CardContent>
   </Card>
  </Box>
 )
}
