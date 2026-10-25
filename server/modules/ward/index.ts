import { Elysia, t } from 'elysia'
import { WardItemSchema } from './model'
import { wardService } from './service'

export const wardRoutes = new Elysia({ prefix: '/ward' }).get(
 '/',
 async () => {
  const wards = await wardService.getWardList()
  return {
   data: wards,
   message: 'ดึงรายชื่อ Ward สำเร็จ',
   statusCode: 200,
  }
 },
 {
  response: {
   200: t.Object({
    data: t.Array(WardItemSchema),
    message: t.String(),
    statusCode: t.Number(),
   }),
  },
 },
)

export * from './model'
export * from './service'
