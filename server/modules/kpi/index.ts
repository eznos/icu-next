import { Elysia, t } from 'elysia'
import {
 CreateKpiType,
 ResponseKpiSchema,
 UpdateKpiType,
} from './model'
import { kpiService } from './service'

export const kpiRoutes = new Elysia({ prefix: '/kpi' })
 .get(
  '/',
  async ({ query }) => {
   const response = await kpiService.getKpiList({ query })
   return response
  },
  {
   query: t.Object({
    ward: t.Optional(
     t.String({
      description: 'รหัสหอผู้ป่วย เช่น MICU3',
      default: 'MICU3',
     }),
    ),
    year: t.Optional(
     t.String({
      description: 'ปี พ.ศ. เช่น 2569',
     }),
    ),
    periodType: t.Optional(
     t.Union([t.Literal('yearly'), t.Literal('monthly')], {
      description: 'รอบการจัดเก็บ: yearly หรือ monthly',
     }),
    ),
    month: t.Optional(
     t.String({
      description: 'เดือน (1-12)',
     }),
    ),
    page: t.Optional(
     t.String({
      description: 'หน้าที่ต้องการดึงข้อมูล',
      default: '1',
     }),
    ),
    limit: t.Optional(
     t.String({
      description: 'จำนวนรายการต่อหน้า',
      default: '20',
     }),
    ),
   }),
   response: {
    200: ResponseKpiSchema.listResponse,
    400: ResponseKpiSchema.basicResponse,
   },
  },
 )
 .get(
  '/:id',
  async ({ params }) => {
   const response = await kpiService.getKpiDetail({ id: params.id })
   return response
  },
  {
   params: t.Object({
    id: t.String({ description: 'ID หรือ objectUuId ของ KPI' }),
   }),
   response: {
    200: ResponseKpiSchema.detailResponse,
    404: ResponseKpiSchema.basicResponse,
    500: ResponseKpiSchema.basicResponse,
   },
  },
 )
 .post(
  '/',
  async ({ body }) => {
   const response = await kpiService.createKpi(body as CreateKpiType)
   return response
  },
  {
   body: ResponseKpiSchema.createBody,
   response: {
    201: ResponseKpiSchema.detailResponse,
    400: ResponseKpiSchema.basicResponse,
   },
  },
 )
 .put(
  '/:id',
  async ({ params, body }) => {
   const response = await kpiService.updateKpi({
    id: params.id,
    body: body as UpdateKpiType,
   })
   return response
  },
  {
   params: t.Object({
    id: t.String({ description: 'ID หรือ objectUuId ของ KPI' }),
   }),
   body: ResponseKpiSchema.updateBody,
   response: {
    200: ResponseKpiSchema.detailResponse,
    400: ResponseKpiSchema.basicResponse,
    404: ResponseKpiSchema.basicResponse,
   },
  },
 )
 .delete(
  '/:id',
  async ({ params }) => {
   const response = await kpiService.deleteKpi({ id: params.id })
   return response
  },
  {
   params: t.Object({
    id: t.String({ description: 'ID หรือ objectUuId ของ KPI' }),
   }),
   response: {
    200: ResponseKpiSchema.basicResponse,
    404: ResponseKpiSchema.basicResponse,
    500: ResponseKpiSchema.basicResponse,
   },
  },
 )

export * from './model'
export * from './service'
