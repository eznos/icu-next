// server/auth.setup.ts
import { jwt } from '@elysia/jwt'
import { Elysia } from 'elysia'

export type CurrentUser = {
 id: string
 role: 'user' | 'admin'
 ward: string
}

export const authSetup = (app: Elysia) =>
 app
  .use(
   jwt({
    name: 'jwt',
    secret: 'YOUR_SUPER_SECRET_KEY',
    exp: '1d',
   }),
  )
  .derive(async ({ jwt, headers: { authorization }, cookie: { token: cookieToken } }) => {
   let rawToken: string | undefined
   if (authorization?.startsWith('Bearer ')) {
    rawToken = authorization.split(' ')[1]
   } else if (typeof cookieToken?.value === 'string') {
    rawToken = cookieToken.value
   }

   if (!rawToken) {
    return { currentUser: null as CurrentUser | null }
   }

   const payload = await jwt.verify(rawToken)

   if (!payload) {
    return { currentUser: null as CurrentUser | null }
   }

   return {
    currentUser: payload as unknown as CurrentUser,
   }
  })
