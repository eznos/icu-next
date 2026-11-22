// 'use client'
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { cookies } from 'next/headers'
// 1. นำเข้า setRequestLocale เพิ่มเติม
import { SnackbarProvider } from '@/components/providers/snackbar-provider'
import { AppThemeProvider } from '@/components/theme/app-theme-provider'
import { routing } from '@/i18n/routing'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
 const cookieStore = await cookies()
 const wardCookie = cookieStore.get('ward')?.value
 let ward = wardCookie ? decodeURIComponent(wardCookie) : null

 if (!ward) {
  const token = cookieStore.get('token')?.value
  if (token) {
   try {
    const parts = token.split('.')
    if (parts.length >= 2) {
     const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
     const decoded = Buffer.from(base64, 'base64').toString('utf-8')
     const payload = JSON.parse(decoded)
     if (payload.ward) {
      ward = payload.ward
     }
    }
   } catch {
    // Ignore decoding errors
   }
  }
 }

 const activeWard = ward || 'MICU3'

 return {
  title: {
   default: `${activeWard} System`,
   template: `%s | ${activeWard} System`,
  },
  description: `ระบบจัดการหออภิบาลผู้ป่วยวิกฤตอายุรกรรม (${activeWard} System)`,
 }
}

export default async function LocaleLayout({
 children,
 params,
}: {
 children: React.ReactNode
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params

 if (!routing.locales.includes(locale as any)) {
  notFound()
 }

 // 🚨 2. บังคับเซ็ต Locale สำหรับหน้านี้โดยตรง (แก้ปัญหา undefined หายขาด)
 setRequestLocale(locale)

 const themeMode = (
  (await cookies()).get('theme-mode')?.value === 'dark' ? 'dark' : 'light'
 ) as 'light' | 'dark'

 // หลังจากบรรทัดบน getMessages จะรู้ทันทีว่าต้องโหลดภาษาอะไร
 const messages = await getMessages()

 return (
  <html lang={locale} suppressHydrationWarning>
   <body>
    <NextIntlClientProvider locale={locale} messages={messages}>
     {/* <LocalizationProvider dateAdapter={AdapterDayjs}> */}
     <SnackbarProvider>
      <AppThemeProvider initialMode={themeMode}>{children}</AppThemeProvider>
     </SnackbarProvider>
     {/* </LocalizationProvider> */}
    </NextIntlClientProvider>
   </body>
  </html>
 )
}
