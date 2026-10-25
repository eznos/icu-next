import { Elysia, t } from 'elysia'
import { authSetup } from '../../auth.setup'
import {
 CreatePatientInput,
 ResponsePatientSchema,
 UpdatePatientInput,
} from './model'
import { patientService } from './service'

export const patientRoutes = new Elysia({ prefix: '/patient' })
 .use(authSetup)
 .post(
  '/',
  async ({ body, currentUser }) => {
   const response = await patientService.createPatient(
    body as CreatePatientInput,
    currentUser,
   )
   return response
  },
  {
   body: ResponsePatientSchema.createBody,
   response: {
    200: ResponsePatientSchema.response,
    400: ResponsePatientSchema.response,
    409: ResponsePatientSchema.response,
    500: ResponsePatientSchema.response,
   },
  },
 )
 .get(
  '/',
  async ({ query, currentUser }) => {
   const response = await patientService.getPatientList({ query, currentUser })
   return response
  },
  {
   query: t.Object({
    limit: t.Optional(t.String({ description: 'จำนวนรายการต่อหน้า', default: '20' })),
    page: t.Optional(t.String({ description: 'หน้าที่ต้องการดึงข้อมูล', default: '1' })),
    searchQuery: t.Optional(
     t.String({ description: 'คำค้นหา (HN, AN, ชื่อผู้ป่วย, DX., แพทย์)', default: '' }),
    ),
    statusFilter: t.Optional(t.String({ description: 'กรองตามสถานะการรักษา', default: '' })),
    ward: t.Optional(t.String({ description: 'กรองตามรหัส Ward (Admin เท่านั้น)' })),
    sortBy: t.Optional(t.String({ description: 'ฟิลด์ที่ใช้เรียงลำดับ', default: 'admissionDate' })),
    order: t.Optional(
     t.Union([t.Literal('asc'), t.Literal('desc')], {
      description: 'ลำดับการเรียงข้อมูล',
      default: 'desc',
     }),
    ),
   }),
   response: {
    200: ResponsePatientSchema.getListResponse,
    500: ResponsePatientSchema.response,
   },
  },
 )
 .get(
  '/:id',
  async ({ params, currentUser }) => {
   const response = await patientService.getDetailPatient({
    id: params.id,
    currentUser,
   })
   return response
  },
  {
   params: t.Object({
    id: t.String({ description: 'รหัสผู้ป่วย (objectUuId หรือ MongoDB _id)' }),
   }),
   response: {
    200: ResponsePatientSchema.getDetailResponse,
    403: ResponsePatientSchema.response,
    404: ResponsePatientSchema.response,
    500: ResponsePatientSchema.response,
   },
  },
 )
 .put(
  '/:id',
  async ({ params, body, currentUser }) => {
   const response = await patientService.updatePatient({
    id: params.id,
    body: body as UpdatePatientInput,
    currentUser,
   })
   return response
  },
  {
   params: t.Object({
    id: t.String({ description: 'รหัสผู้ป่วย (objectUuId หรือ MongoDB _id)' }),
   }),
   body: ResponsePatientSchema.updateBody,
   response: {
    200: ResponsePatientSchema.response,
    400: ResponsePatientSchema.response,
    403: ResponsePatientSchema.response,
    404: ResponsePatientSchema.response,
    409: ResponsePatientSchema.response,
    500: ResponsePatientSchema.response,
   },
  },
 )
 .delete(
  '/:id',
  async ({ params, currentUser }) => {
   const response = await patientService.deletePatient({
    id: params.id,
    currentUser,
   })
   return response
  },
  {
   params: t.Object({
    id: t.String({ description: 'รหัสผู้ป่วย (objectUuId หรือ MongoDB _id)' }),
   }),
   response: {
    200: ResponsePatientSchema.response,
    400: ResponsePatientSchema.response,
    403: ResponsePatientSchema.response,
    404: ResponsePatientSchema.response,
    500: ResponsePatientSchema.response,
   },
  },
 )

export * from './model'
export * from './service'
