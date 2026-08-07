import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// กำหนดหน้าเว็บที่ต้อง Login ก่อนเข้าใช้งาน (Private Routes)
const protectedRoutes = ['/dashboard', '/personnel', '/reports', '/settings']

export default function middleware(req: NextRequest) {
 const { pathname } = req.nextUrl

 // 1. ตรวจสอบ Token จาก Cookie
 const token = req.cookies.get('token')?.value

 // 2. ดึง locale ปัจจุบันจาก path (เช่น /th/dashboard -> 'th')
 const pathnameLocale = routing.locales.find(
  (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
 )
 const currentLocale = pathnameLocale || routing.defaultLocale

 // 3. ตัด prefix ภาษาออก เพื่อเช็คว่า path ปัจจุบันเป็น Protected Route หรือไม่
 const pathWithoutLocale =
  pathname.replace(new RegExp(`^/(${routing.locales.join('|')})`), '') || '/'
 const isProtectedRoute = protectedRoutes.some((route) =>
  pathWithoutLocale.startsWith(route),
 )

 // 4. ถ้าเป็นหน้า Protected แล้วไม่มี Token -> Redirect ไปหน้า Login
 if (isProtectedRoute && !token) {
  const loginUrl = new URL(`/${currentLocale}/login`, req.url)
  return NextResponse.redirect(loginUrl)
 }

 // 🌟 5. (เพิ่มใหม่) ถ้ามี Token แล้ว แต่พยายามเข้าหน้า Login -> Redirect ไป Dashboard
 const isLoginRoute = pathWithoutLocale.startsWith('/login')
 if (isLoginRoute && token) {
  const dashboardUrl = new URL(`/${currentLocale}/dashboard`, req.url)
  return NextResponse.redirect(dashboardUrl)
 }

 return intlMiddleware(req)
}

export const config = {
 matcher: ['/', '/(th|en)/:path*'],
}
