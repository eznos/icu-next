import { Elysia, t } from 'elysia'
import { authSetup } from '../../auth.setup'
import { WardItemSchema } from './model'
import { wardService } from './service'

export const wardRoutes = new Elysia({ prefix: '/ward' })
 .use(authSetup)
 .get(
  '/',
  async ({ query }) => {
   const includeInactive = query?.includeInactive === 'true'
   const wards = await wardService.getWardList(includeInactive)
   return {
    data: wards,
    message: 'ดึงรายชื่อ Ward สำเร็จ',
    statusCode: 200,
   }
  },
  {
   query: t.Object({
    includeInactive: t.Optional(t.String()),
   }),
   response: {
    200: t.Object({
     data: t.Array(WardItemSchema),
     message: t.String(),
     statusCode: t.Number(),
    }),
   },
  },
 )
 .post(
  '/',
  async ({ body, set }) => {
   try {
    const ward = await wardService.createWard(body)
    return {
     data: ward,
     message: 'สร้าง Ward ใหม่สำเร็จ',
     statusCode: 201,
    }
   } catch (error: any) {
    set.status = 400
    return {
     data: null,
     message: error.message || 'ไม่สามารถสร้าง Ward ได้',
     statusCode: 400,
    }
   }
  },
  {
   body: t.Object({
    code: t.String({ minLength: 2 }),
    name: t.String({ minLength: 2 }),
    description: t.Optional(t.String()),
    totalBeds: t.Optional(t.Number({ minimum: 1 })),
    targetMonthlyAdmissions: t.Optional(t.Number({ minimum: 0 })),
   }),
  },
 )
 .patch(
  '/:id',
  async ({ params, body, set }) => {
   try {
    const ward = await wardService.updateWard(params.id, body)
    return {
     data: ward,
     message: 'อัปเดตข้อมูล Ward สำเร็จ',
     statusCode: 200,
    }
   } catch (error: any) {
    set.status = 400
    return {
     data: null,
     message: error.message || 'ไม่สามารถอัปเดตข้อมูลได้',
     statusCode: 400,
    }
   }
  },
  {
   params: t.Object({
    id: t.String(),
   }),
   body: t.Object({
    name: t.Optional(t.String()),
    description: t.Optional(t.String()),
    totalBeds: t.Optional(t.Number({ minimum: 1 })),
    targetMonthlyAdmissions: t.Optional(t.Number({ minimum: 0 })),
    isActive: t.Optional(t.Boolean()),
   }),
  },
 )
 .delete(
  '/:id',
  async ({ params, set }) => {
   try {
    await wardService.deleteWard(params.id)
    return {
     message: 'ปิดการใช้งาน Ward สำเร็จ',
     statusCode: 200,
    }
   } catch (error: any) {
    set.status = 400
    return {
     message: error.message || 'ลบไม่สำเร็จ',
     statusCode: 400,
    }
   }
  },
  {
   params: t.Object({
    id: t.String(),
   }),
  },
 )

export * from './model'
export * from './service'
