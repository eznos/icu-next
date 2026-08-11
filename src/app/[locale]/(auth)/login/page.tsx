'use client'

import { useLoginPost } from '@/apis/auth'
import { useSnackBarNotification } from '@/hooks/useSnackBarNotification'
import { useTranslationsNext } from '@/i18n/use-translate-next'
import {
 Box,
 Button,
 Card,
 CardContent,
 Stack,
 Typography,
} from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
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
 const { showSnackbar } = useSnackBarNotification()
 const {
  mutate: loginMutate,
  isLoading: loginIsLoading,
  data: loginData,
 } = useLoginPost()
 const formContext = useFormContext<LoginFormData>()
 const { locale } = useParams<{ locale: string }>()

 const router = useRouter() // 🌟 2. เรียกใช้งาน router

 const handleSubmit = async (data: FieldValues) => {
  // 🌟 3. จำลองการสร้าง Token
  // const mockToken = `mock-token-${data.username}-${Date.now()}`

  // document.cookie = `token=${mockToken}; path=/; max-age=86400;`

  // // 🌟 5. พาผู้ใช้ไปยังหน้า Dashboard (ปรับภาษาให้ตรงกับระบบของคุณ)
  // router.push(`/${locale}/dashboard`)

  // router.refresh()

  const payload = {
   username: data.username,
   password: data.password,
  }

  try {
   await loginMutate(payload)
   console.log(locale)
   showSnackbar('✅ เข้าสู่ระบบสำเร็จ', 'success')
   //  router.push(`/${locale}/k`)
   window.location.href = `/${locale}/dashboard`
   //  router.refresh()
  } catch (error: any) {
   showSnackbar(error.message, 'error')
   console.error('Login error:', error)
  }
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
       <Typography variant='h5' sx={{ fontWeight: 700 }}>
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
      <Stack direction='row' sx={{ mt: 1, justifyContent: 'space-between' }}>
       <Button
        variant='text'
        size='small'
        onClick={() => router.push(`/${locale}/register`)}
       >
        {t('menu.register')}
       </Button>

       <Button
        variant='text'
        size='small'
        onClick={() => router.push(`/${locale}/forgot-password`)}
       >
        {t('menu.forgotPassword')}
       </Button>
      </Stack>
     </FormContainer>
    </CardContent>
   </Card>
  </Box>
 )
}
