// server/routes/user.route.ts
import { User } from '@server/models'
import { ResponseTypeBasic } from '@server/types/baseType'
import { Elysia, t } from 'elysia'
import { authSetup } from '../auth.setup'

export const userRoutes = new Elysia({ prefix: '/user' })
 .use(authSetup)
 .get(
  '/me',
  async ({ currentUser, set }) => {
   if (!currentUser) {
    set.status = 401
    return { message: 'Unauthorized', statusCode: 401, data: null }
   }

   const user: any = await User.findById(currentUser.id).lean()
   if (!user) {
    return {
     message: 'User found',
     statusCode: 200,
     data: {
      id: currentUser.id,
      username: currentUser.username || 'Staff',
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      role: currentUser.role,
      ward: currentUser.ward || 'MICU3',
     },
    }
   }

   return {
    message: 'User found',
    statusCode: 200,
    data: {
     id: user._id.toString(),
     username: user.username,
     firstName: user.firstName || '',
     lastName: user.lastName || '',
     role: user.role,
     ward: user.ward || 'MICU3',
    },
   }
  },
 )
 // 2. Route: Register (สมัครสมาชิก)
 .post(
  '/register',
  async ({ body, set }): Promise<ResponseTypeBasic<undefined>> => {
   const { username, firstName, lastName, email, password, role, ward } = body

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

   const newUser = new User({
    username,
    firstName: firstName?.trim() || '',
    lastName: lastName?.trim() || '',
    email,
    passwordHash,
    role: role || 'user',
    ward: ward?.toUpperCase() || 'MICU3',
    status: 'pending',
   })
   await newUser.save()

   return {
    message: 'สมัครสมาชิกสำเร็จ กรุณารอผู้ดูแลระบบ (Admin) อนุมัติการเข้าใช้งาน',
    statusCode: 200,
    data: undefined,
   }
  },
  {
   body: t.Object({
    username: t.String(),
    firstName: t.Optional(t.String()),
    lastName: t.Optional(t.String()),
    email: t.String(),
    password: t.String(),
    role: t.Optional(t.String({ pattern: '^(user|admin)$' })),
    ward: t.Optional(t.String()),
   }),
  },
 )

 // 3. Route: Login (เข้าสู่ระบบ)
 .post(
  '/login',
  async ({
   body,
   set,
   jwt,
  }): Promise<
   ResponseTypeBasic<{
    token: string
    user: {
     username: string
     firstName: string
     lastName: string
     role: 'user' | 'admin'
     ward: string
    }
   }>
  > => {
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

   if (user.status === 'pending') {
    set.status = 403
    return {
     message: 'บัญชีของคุณอยู่ระหว่างรอผู้ดูแลระบบ (Admin) อนุมัติการเข้าใช้งาน',
     statusCode: 403,
     data: undefined,
    }
   }

   if (user.status === 'rejected') {
    set.status = 403
    return {
     message: 'บัญชีของคุณไม่ได้รับการอนุมัติ กรุณาติดต่อผู้ดูแลระบบ',
     statusCode: 403,
     data: undefined,
    }
   }

   const userWard = user.ward || 'MICU3'

   const token = await jwt.sign({
    id: user._id.toString(),
    username: user.username,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role,
    ward: userWard,
   })

   return {
    message: 'เข้าสู่ระบบสำเร็จ',
    statusCode: 200,
    data: {
     token,
     user: {
      username: user.username,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      ward: userWard,
     },
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

  // 6. Route: Get User List (Admin Only)
  .get('/list', async ({ currentUser, set }) => {
   if (!currentUser || currentUser.role !== 'admin') {
    set.status = 403
    return { message: 'Forbidden: Admin Only', statusCode: 403, data: [] }
   }

   const users = await User.find({})
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .lean()

   const formattedUsers = users.map((u: any) => ({
    _id: u._id.toString(),
    username: u.username,
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email,
    role: u.role || 'user',
    ward: u.ward || 'MICU3',
    status: u.status || 'active',
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
   }))

   return {
    message: 'ดึงรายชื่อผู้ใช้งานสำเร็จ',
    statusCode: 200,
    data: formattedUsers,
   }
  })

  // 7. Route: Update User Status (Admin Only)
  .patch(
   '/:id/status',
   async ({ params: { id }, body, currentUser, set }) => {
    if (!currentUser || currentUser.role !== 'admin') {
     set.status = 403
     return { message: 'Forbidden: Admin Only', statusCode: 403, data: null }
    }

    const targetUser: any = await User.findById(id)
    if (!targetUser) {
     set.status = 404
     return { message: 'ไม่พบผู้ใช้งาน', statusCode: 404, data: null }
    }

    targetUser.status = body.status
    await targetUser.save()

    return {
     message: `อัปเดตสถานะเป็น ${body.status} สำเร็จ`,
     statusCode: 200,
     data: {
      id: targetUser._id.toString(),
      status: targetUser.status,
     },
    }
   },
   {
    body: t.Object({
     status: t.Union([
      t.Literal('pending'),
      t.Literal('active'),
      t.Literal('rejected'),
     ]),
    }),
   },
  )

  // 8. Route: Update User Role (Admin Only)
  .patch(
   '/:id/role',
   async ({ params: { id }, body, currentUser, set }) => {
    if (!currentUser || currentUser.role !== 'admin') {
     set.status = 403
     return { message: 'Forbidden: Admin Only', statusCode: 403, data: null }
    }

    const targetUser: any = await User.findById(id)
    if (!targetUser) {
     set.status = 404
     return { message: 'ไม่พบผู้ใช้งาน', statusCode: 404, data: null }
    }

    targetUser.role = body.role
    await targetUser.save()

    return {
     message: `อัปเดตบทบาทเป็น ${body.role} สำเร็จ`,
     statusCode: 200,
     data: {
      id: targetUser._id.toString(),
      role: targetUser.role,
     },
    }
   },
   {
    body: t.Object({
     role: t.Union([t.Literal('user'), t.Literal('admin')]),
    }),
   },
  )

  // 9. Route: Delete User (Admin Only)
  .delete('/:id', async ({ params: { id }, currentUser, set }) => {
   if (!currentUser || currentUser.role !== 'admin') {
    set.status = 403
    return { message: 'Forbidden: Admin Only', statusCode: 403 }
   }

   if (currentUser.id === id) {
    set.status = 400
    return { message: 'ไม่สามารถลบบัญชีที่กำลังใช้งานอยู่ได้', statusCode: 400 }
   }

   const deleted = await User.findByIdAndDelete(id)
   if (!deleted) {
    set.status = 404
    return { message: 'ไม่พบผู้ใช้งานที่ต้องการลบ', statusCode: 404 }
   }

   return { message: 'ลบผู้ใช้งานสำเร็จ', statusCode: 200 }
  })
