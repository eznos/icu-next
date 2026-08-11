// server/routes/user.route.ts
import { User } from '@server/models'
import { ResponseTypeBasic } from '@server/types/baseType'
import { Elysia, t } from 'elysia'
import { authSetup } from '../auth.setup'

export const userRoutes = new Elysia({ prefix: '/user' })
 .use(authSetup)
 // 2. Route: Register (สมัครสมาชิก)
 .post(
  '/register',
  async ({ body, set }): Promise<ResponseTypeBasic<undefined>> => {
   const { username, email, password, role } = body

   const existingUser = await User.findOne({ $or: [{ username }, { email }] })
   if (existingUser) {
    set.status = 400
    return {
     error: 'Username หรือ Email นี้มีในระบบแล้ว',
     message: 'Username หรือ Email นี้มีในระบบแล้ว',
     statusCode: 409,
    }
   }

   const passwordHash = await Bun.password.hash(password)

   const newUser = new User({ username, email, passwordHash, role })
   await newUser.save()

   return { message: 'สมัครสมาชิกสำเร็จ', statusCode: 200, data: undefined }
  },
  {
   body: t.Object({
    username: t.String(),
    email: t.String(),
    password: t.String(),
    role: t.Optional(t.String({ pattern: '^(user|admin)$' })),
   }),
  },
 )

 // 3. Route: Login (เข้าสู่ระบบ)
 // 🌟 สังเกตตรงนี้: ดึง jwt ออกมาจาก Context ตรงๆ (อย่าลืมใส่ :any ถ้าระบบ Type แจ้งเตือน เพราะเราจะไปผูก JWT ที่หน้า index.ts)
 .post(
  '/login',
  async ({
   body,
   set,
   jwt,
  }): Promise<
   ResponseTypeBasic<{
    token: string
    user: { username: string; role: 'user' | 'admin' }
   }>
  > => {
   // 🌟 สังเกตว่าเราไม่ต้องพิมพ์ :any หรือ :AuthContext เลย! พิมพ์ jwt. แล้ว Auto-complete จะขึ้นมาเอง
   const { username, password } = body

   const user = await User.findOne({ username })
   if (!user || !(await Bun.password.verify(password, user.passwordHash))) {
    set.status = 401
    return {
     message: 'Username หรือ Password ไม่ถูกต้อง',
     statusCode: 401,
     data: undefined,
    }
   }

   const token = await jwt.sign({
    id: user._id.toString(),
    role: user.role,
   })

   return {
    message: 'เข้าสู่ระบบสำเร็จ',
    statusCode: 200,
    data: {
     token,
     user: { username: user.username, role: user.role },
    },
   }
  },
  {
   body: t.Object({
    username: t.String(),
    password: t.String(),
   }),
  },
 )

 // 4. Route: Forget Password
 .post(
  '/forgetPassword',
  async ({ body, set }) => {
   const { email, newPassword } = body

   const user = await User.findOne({ email })
   if (!user) {
    set.status = 404
    return { message: 'ไม่พบ Email นี้ในระบบ' }
   }

   user.passwordHash = await Bun.password.hash(newPassword)
   await user.save()

   return { message: 'รีเซ็ตรหัสผ่านใหม่สำเร็จ' }
  },
  {
   body: t.Object({
    email: t.String(),
    newPassword: t.String(),
   }),
  },
 )

 // 5. Route: Edit Password (Admin Only)
 // 🌟 สังเกตตรงนี้: ดึง currentUser ออกมาจาก Context
 .post(
  '/editPassword',
  async ({ body, set, currentUser }) => {
   if (!currentUser || currentUser.role !== 'admin') {
    set.status = 403
    return { message: 'Forbidden: คุณไม่มีสิทธิ์เข้าถึง (Admin Only)' }
   }

   const { targetUsername, newPassword } = body

   const targetUser = await User.findOne({ username: targetUsername })
   if (!targetUser) {
    set.status = 404
    return { message: 'ไม่พบ Username ที่ต้องการแก้ไข' }
   }

   targetUser.passwordHash = await Bun.password.hash(newPassword)
   await targetUser.save()

   return { message: `อัปเดตรหัสผ่านของ ${targetUsername} สำเร็จโดย Admin` }
  },
  {
   body: t.Object({
    targetUsername: t.String(),
    newPassword: t.String(),
   }),
  },
 )
