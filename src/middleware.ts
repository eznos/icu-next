import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const authRoutes = ['/login', '/register']
const publicRoutes = ['/login', '/register', '/portal']
const adminOnlyRoutes = ['/users']

function parseTokenPayload(token?: string): { role?: string; exp?: number } | null {
 if (!token) return null
 try {
  const parts = token.split('.')
  if (parts.length >= 2) {
   const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
   const decoded = atob(base64)
   const payload = JSON.parse(decoded)
   if (payload.exp && Date.now() >= payload.exp * 1000) {
    return null
   }
   return payload
  }
 } catch {
  // Ignore parsing error
 }
 return { role: 'user' }
}

export default function middleware(req: NextRequest) {
 const { pathname } = req.nextUrl

 const pathnameLocale = routing.locales.find(
  (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
 )
 const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value
 const currentLocale =
  pathnameLocale ||
  (routing.locales.includes(cookieLocale as any) ? cookieLocale : null) ||
  routing.defaultLocale

 const pathWithoutLocale =
  pathname.replace(new RegExp(`^/(${routing.locales.join('|')})`), '') || '/'

 const token = req.cookies.get('token')?.value
 const payload = parseTokenPayload(token)
 const isAuthenticated = Boolean(payload)

 const isAuthRoute = authRoutes.some((route) =>
  pathWithoutLocale.startsWith(route),
 )
 const isPublicRoute = publicRoutes.some((route) =>
  pathWithoutLocale.startsWith(route),
 )

 if (!isAuthenticated && !isPublicRoute) {
  const loginUrl = new URL(`/${currentLocale}/login`, req.url)
  const response = NextResponse.redirect(loginUrl)
  if (token) {
   response.cookies.delete('token')
  }
  return response
 }

 if (isAuthenticated && isAuthRoute) {
  const dashboardUrl = new URL(`/${currentLocale}/dashboard`, req.url)
  return NextResponse.redirect(dashboardUrl)
 }

 const isAdminRoute = adminOnlyRoutes.some((route) =>
  pathWithoutLocale.startsWith(route),
 )
 if (isAuthenticated && isAdminRoute && payload?.role !== 'admin') {
  const dashboardUrl = new URL(`/${currentLocale}/dashboard`, req.url)
  return NextResponse.redirect(dashboardUrl)
 }

 return intlMiddleware(req)
}

export const config = {
 matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
