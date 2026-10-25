'use client'

import { useRegisterPost } from '@/apis/auth'
import { useWardList } from '@/apis/ward'
import { useSnackBarNotification } from '@/hooks'
import { useTranslationsNext } from '@/i18n/use-translate-next'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import {
 Box,
 Button,
 Card,
 CardContent,
 Stack,
 Typography,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { FormContainer, SelectElement, TextFieldElement, useForm } from 'react-hook-form-mui'

type RegisterFormData = {
 username: string
 password: string
 email: string
 ward: string
 confirmPassword: string
}
export default function RegisterPage() {
 const t = useTranslationsNext('register')

 const router = useRouter()
 const { showSnackbar } = useSnackBarNotification()
 const [showPassword, setShowPassword] = useState(false)
 const { mutate, isLoading } = useRegisterPost()
 const { data: wardResponse, isLoading: isLoadingWards } = useWardList()

 const wardOptions = useMemo(() => {
  if (wardResponse?.data && wardResponse.data.length > 0) {
   return wardResponse.data.map((w) => ({
    id: w.code,
    label: `${w.code} - ${w.name}`,
   }))
  }
  return [
   { id: 'MICU3', label: 'MICU3 - หอผู้ป่วยวิกฤตอายุรกรรม 3 (MICU 3)' },
   { id: 'SICU', label: 'SICU - หอผู้ป่วยวิกฤตศัลยกรรม (SICU)' },
   { id: 'CCU', label: 'CCU - หอผู้ป่วยวิกฤตโรคหัวใจ (CCU)' },
  ]
 }, [wardResponse])

 const formContext = useForm<RegisterFormData>({
  defaultValues: {
   username: '',
   email: '',
   ward: 'MICU3',
   password: '',
   confirmPassword: '',
  },
 })

 const passwordWatch = formContext.watch('password')

 const handleSubmit = async (data: RegisterFormData) => {
  const payload = {
   username: data.username,
   password: data.password,
   email: data.email,
   ward: data.ward || 'MICU3',
   role: 'admin' as const,
  }

  try {
   await mutate(payload)
   showSnackbar('✅ สมัครสมาชิกสำเร็จ', 'success')
   router.push('/th/login')
   return
  } catch (error: any) {
   showSnackbar(error.message, 'error')
   return
  }
 }

 const reCheckPassword = (value: string) => {
  if (value !== passwordWatch) {
   formContext.setError('confirmPassword', {
    type: 'manual',
    message: t('confirmPasswordError'),
   })
   return
  } else {
   formContext.clearErrors('confirmPassword')
   return
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
     <FormContainer formContext={formContext} onSuccess={handleSubmit}>
      <Stack spacing={2}>
       <Typography variant='h5' sx={{ fontWeight: 700 }}>
        {t('title')}
       </Typography>

       {/* 🌟 6. เพิ่ม name="username" และ name="password" และ name="email" */}
       <TextFieldElement
        name='username'
        label={t('username')}
        fullWidth
        required
        disabled={isLoading}
       />
       <TextFieldElement
        name='email'
        label={t('email')}
        type='email'
        fullWidth
        required
        disabled={isLoading}
       />
       <SelectElement
        name='ward'
        label={t('ward')}
        options={wardOptions}
        fullWidth
        required
        disabled={isLoading || isLoadingWards}
       />
       <TextFieldElement
        name='password'
        label={t('password')}
        type={!showPassword ? 'text' : 'password'}
        fullWidth
        required
        slotProps={{
         input: {
          autoComplete: 'new-password',
          endAdornment: (
           <>{!showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</>
          ),
          sx: {
           cursor: 'pointer',
          },
          onClick: () => setShowPassword((prev) => !prev),
         },
        }}
        disabled={isLoading}
       />
       <TextFieldElement
        name='confirmPassword'
        label={t('confirmPassword')}
        type='password'
        fullWidth
        required
        disabled={isLoading}
        onChange={(e) => {
         reCheckPassword(e.target.value)
        }}
       />

       <Stack
        direction='row'
        spacing={1}
        sx={{ justifyContent: 'space-between' }}
       >
        <Button color='error' variant='outlined' onClick={() => router.back()}>
         ยกเลิก
        </Button>

        <Button loading={isLoading} variant='contained' type='submit'>
         {t('submit')}
        </Button>
       </Stack>
      </Stack>
     </FormContainer>
    </CardContent>
   </Card>
  </Box>
 )
}
