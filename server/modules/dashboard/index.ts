import { Elysia, t } from 'elysia'
import { authSetup } from '../../auth.setup'
import { DashboardResponseSchema } from './model'
import { dashboardService } from './service'

export const dashboardRoutes = new Elysia({ prefix: '/dashboard' })
 .use(authSetup)
 .get(
  '/',
  async ({ query, currentUser }) => {
   const data = await dashboardService.getDashboardData({
    requestedWard: query.ward,
    currentUser,
   })

   return {
    data,
    message: 'ดึงข้อมูล Dashboard สำเร็จ',
    statusCode: 200,
   }
  },
  {
   query: t.Object({
    ward: t.Optional(t.String({ description: 'รหัส Ward ที่ต้องการดูข้อมูล (Admin เท่านั้น)' })),
   }),
   response: {
    200: DashboardResponseSchema,
   },
  },
 )

export * from './model'
export * from './service'
