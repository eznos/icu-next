// server/auth.setup.ts
import { jwt } from '@elysia/jwt'
import { Elysia } from 'elysia'

export type CurrentUser = {
 id: string
 role: 'user' | 'admin'
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
  .derive(async ({ jwt, headers: { authorization } }) => {
   if (!authorization?.startsWith('Bearer ')) {
    return { currentUser: null as CurrentUser | null }
   }

   const token = authorization.split(' ')[1]
   const payload = await jwt.verify(token)

   if (!payload) {
    return { currentUser: null as CurrentUser | null }
   }

   return {
    currentUser: payload as CurrentUser,
   }
  })
