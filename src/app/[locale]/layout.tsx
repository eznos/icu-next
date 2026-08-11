// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
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

 // หลังจากบรรทัดบน getMessages จะรู้ทันทีว่าต้องโหลดภาษาอะไร
 const messages = await getMessages()

 return (
  <html lang={locale}>
   <body>
    <NextIntlClientProvider locale={locale} messages={messages}>
     <SnackbarProvider>
      <AppThemeProvider>{children}</AppThemeProvider>
     </SnackbarProvider>
    </NextIntlClientProvider>
   </body>
  </html>
 )
}
