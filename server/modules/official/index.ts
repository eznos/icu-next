import { Elysia, t } from 'elysia'

import { OfficialModel, ResponseOfficialSchema } from './model'

import { officialService } from './service'

export const officialRoutes = new Elysia({ prefix: '/official' })
 .post(
  '/',
  async ({ body }) => {
   const bodyTyped = body as unknown as OfficialModel

   const response = await officialService.createOfficial(bodyTyped)
   return response
  },
  {
   body: ResponseOfficialSchema.createBody,

   Response: {
    200: ResponseOfficialSchema.response,
    409: ResponseOfficialSchema.response,
    400: ResponseOfficialSchema.response,
   },
  },
 )
 .get(
  '/:id',
  async ({ params }) => {
   const response = await officialService.getDetailOfficial({
    id: params.id as string,
   })

   return response
  },
  {
   params: t.Object({
    id: t.String({
     description: 'รหัสผู้ปฏิบัติการ',
     default: '64f8e1c2b5a1c2d3e4f5g6h7',
    }),
   }),
   Response: {
    200: ResponseOfficialSchema.getDetailResponse,
    404: ResponseOfficialSchema.response,
   },
  },
 )
 .get(
  '/',
  // 1. ลบ Type ที่เขียนกำกับไว้ทิ้งได้เลย Elysia จะฉลาดพอที่จะรู้ Type จาก Schema ด้านล่าง
  async ({ query }) => {
   const response = await officialService.getOfficialList({
    query: query,
   })

   return response
  },
  {
   query: t.Object({
    limit: t.Optional(
     t.String({
      description: 'จำนวนรายการต่อหน้า',
      default: '10',
     }),
    ),
    page: t.Optional(
     t.String({
      description: 'หน้าที่ต้องการดึงข้อมูล',
      default: '1',
     }),
    ),
    search: t.Optional(
     t.String({
      description: 'คำค้นหา (ชื่อ, นามสกุล, เลขที่ใบประกอบวิชาชีพ)',
      default: '',
     }),
    ),
    // 2. เปลี่ยน t.String เป็น t.Union เพื่อระบุรับแค่ 'asc' หรือ 'desc'
    order: t.Optional(
     t.Union([t.Literal('asc'), t.Literal('desc')], {
      description: 'ลำดับการเรียงข้อมูล (asc หรือ desc)',
      default: 'asc',
     }),
    ),
   }),
   Response: {
    200: ResponseOfficialSchema.getListResponse,
    400: ResponseOfficialSchema.response,
   },
  },
 )
