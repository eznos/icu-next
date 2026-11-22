'use client'

import { useLoginPost } from '@/apis/auth'
import { useWardList } from '@/apis/ward'
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
import { useMemo } from 'react'
import {
  FieldValues,
  FormContainer,
  SelectElement,
  TextFieldElement,
  useForm,
} from 'react-hook-form-mui'

type LoginFormData = {
  username: string
  password: string
  ward: string
}

export default function LoginPage() {
  const t = useTranslationsNext('login')
  const { showSnackbar } = useSnackBarNotification()
  const {
    mutate: loginMutate,
    isLoading: loginIsLoading,
  } = useLoginPost()
  const { locale } = useParams<{ locale: string }>()
  const router = useRouter()

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

  const form = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
      ward: 'MICU3',
    },
  })

  const handleSubmit = async (data: FieldValues) => {
    const payload = {
      username: data.username,
      password: data.password,
      ward: data.ward,
    }

    try {
      await loginMutate(payload)
      showSnackbar('✅ เข้าสู่ระบบสำเร็จ', 'success')
      window.location.href = `/${locale}/dashboard`
    } catch (error: any) {
      showSnackbar(error.message || 'เข้าสู่ระบบไม่สำเร็จ', 'error')
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
          <FormContainer formContext={form} onSuccess={(e) => handleSubmit(e)}>
            <Stack spacing={2}>
              <Typography variant='h5' sx={{ fontWeight: 700 }}>
                {t('title')}
              </Typography>

              <TextFieldElement
                name='username'
                label={t('username')}
                fullWidth
                required
                disabled={loginIsLoading}
              />

              <TextFieldElement
                name='password'
                label={t('password')}
                type='password'
                fullWidth
                required
                disabled={loginIsLoading}
              />

              <SelectElement
                name='ward'
                label={t('ward')}
                options={wardOptions}
                fullWidth
                required
                disabled={loginIsLoading || isLoadingWards}
              />

              <Button
                variant='contained'
                type='submit'
                size='large'
                fullWidth
                disabled={loginIsLoading}
                sx={{
                  bgcolor: '#0D9488',
                  '&:hover': { bgcolor: '#0b8a64' },
                  fontWeight: 700,
                  py: 1.25,
                }}
              >
                {loginIsLoading ? 'กำลังเข้าสู่ระบบ...' : t('submit')}
              </Button>
            </Stack>

            <Stack direction='row' sx={{ mt: 1.5, justifyContent: 'space-between' }}>
              <Button
                variant='text'
                size='small'
                onClick={() => router.push(`/${locale}/register`)}
                sx={{ textTransform: 'none' }}
              >
                {t('menu.register')}
              </Button>

              <Button
                variant='text'
                size='small'
                onClick={() => router.push(`/${locale}/forgot-password`)}
                sx={{ textTransform: 'none' }}
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
