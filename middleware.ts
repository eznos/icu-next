import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(req: NextRequest) {
 // วางกับดักที่ 1: ดูว่า Middleware ทำงานไหม
 console.log('🚀 Middleware Hit:', req.nextUrl.pathname)
 return intlMiddleware(req)
}

export const config = {
 matcher: ['/', '/(th|en)/:path*'],
}
