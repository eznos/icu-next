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
