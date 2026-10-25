import { Static, t } from 'elysia'
import mongoose, { Document, Schema } from 'mongoose'

export const KpiPeriodTypeSchema = t.Union(
 [t.Literal('yearly'), t.Literal('monthly')],
 {
  description: 'รอบการจัดเก็บข้อมูล: yearly (รายปี), monthly (รายเดือน)',
  default: 'yearly',
 },
)

export const KpiItemSchema = t.Object({
 code: t.String({ description: 'รหัสตัวชี้วัด เช่น VAP, PRESSURE_INJURY, MED_ERROR' }),
 tag: t.Optional(t.String({ description: 'ป้ายกำกับ เช่น มาตรฐานสำคัญ', default: 'มาตรฐานสำคัญ' })),
 title: t.String({ description: 'ชื่อตัวชี้วัด' }),
 targetDescription: t.Optional(t.String({ description: 'คำอธิบายเป้าหมายสากล' })),
 targetValue: t.Number({ description: 'ค่าเป้าหมายตัวเลข' }),
 actualValue: t.Number({ description: 'ค่าที่เกิดขึ้นจริง' }),
 unit: t.String({ description: 'หน่วยวัด เช่น / 1,000 วัน, %, ครั้ง' }),
 progressPercent: t.Optional(t.Number({ description: 'เปอร์เซ็นต์ความคืบหน้า (0-100)' })),
 isPassed: t.Optional(t.Boolean({ description: 'สถานะผ่านเกณฑ์การประเมินหรือไม่' })),
 statusText: t.Optional(t.String({ description: 'ข้อความผลการประเมิน' })),
 statusColor: t.Optional(t.String({ description: 'สีสถานะ เช่น success, warning, error', default: 'success' })),
})

export const KpiStatsSchema = t.Object({
 totalPatients: t.Number({ description: 'จำนวนผู้ป่วยที่นำมาประเมินทั้งหมด' }),
 activePatients: t.Number({ description: 'ผู้ป่วยปัจจุบันที่กำลังรักษา' }),
 totalPatientDays: t.Number({ description: 'วันนอนสะสมรวม (Patient-Days)' }),
 estimatedVentilatorDays: t.Number({ description: 'วันใช้เครื่องช่วยหายใจสะสม' }),
 bedOccupancyPercent: t.Number({ description: 'อัตราการครองเตียง (%)' }),
 evaluationYearBe: t.Number({ description: 'ปี พ.ศ. ที่ทำการประเมิน' }),
})

export const KpiSchema = t.Object({
 _id: t.Optional(t.String({ description: 'MongoDB ObjectID' })),
 objectUuId: t.Optional(t.String({ format: 'uuid', description: 'UUID ของข้อมูล KPI' })),
 ward: t.String({ description: 'รหัสหอผู้ป่วย เช่น MICU3', default: 'MICU3' }),
 periodType: KpiPeriodTypeSchema,
 year: t.Number({ description: 'ปี พ.ศ. เช่น 2569' }),
 month: t.Optional(t.Union([t.Number(), t.Null()])),
 title: t.String({ description: 'หัวข้อหลัก เช่น ตัวชี้วัดประสิทธิภาพงานบริการวิกฤต (MICU3 Quality KPIs)' }),
 subtitle: t.Optional(t.String({ description: 'คำบรรยายเปรียบเทียบสถิติและดัชนีชี้วัดคุณภาพ' })),
 items: t.Array(KpiItemSchema, { description: 'รายการตัวชี้วัดย่อย' }),
 stats: t.Optional(KpiStatsSchema),
 isDeleted: t.Optional(t.Boolean({ default: false })),
 deletedAt: t.Optional(t.Union([t.String({ format: 'date-time' }), t.Null()])),
 createdAt: t.Optional(t.String({ format: 'date-time' })),
 updatedAt: t.Optional(t.String({ format: 'date-time' })),
})

export const CreateKpiBody = t.Object({
 ward: t.Optional(t.String({ default: 'MICU3' })),
 periodType: KpiPeriodTypeSchema,
 year: t.Number(),
 month: t.Optional(t.Number()),
 title: t.String({ minLength: 1 }),
 subtitle: t.Optional(t.String()),
 items: t.Array(KpiItemSchema),
})

export const UpdateKpiBody = t.Partial(CreateKpiBody)

export const ResponseKpiSchema = {
 createBody: CreateKpiBody,
 updateBody: UpdateKpiBody,
 detailResponse: t.Object({
  data: KpiSchema,
  message: t.String(),
  statusCode: t.Number(),
 }),
 listResponse: t.Object({
  data: t.Array(KpiSchema),
  stats: t.Optional(KpiStatsSchema),
  message: t.Optional(t.String()),
  statusCode: t.Number(),
  pagination: t.Object({
   page: t.Number(),
   limit: t.Number(),
   totalPages: t.Number(),
   totalItems: t.Number(),
  }),
 }),
 basicResponse: t.Object({
  message: t.String(),
  statusCode: t.Number(),
  error: t.Optional(t.String()),
 }),
} as const

export interface IKpiItem {
 code: string
 tag?: string
 title: string
 targetDescription?: string
 targetValue: number
 actualValue: number
 unit: string
 progressPercent?: number
 isPassed?: boolean
 statusText?: string
 statusColor?: string
}

export interface IKpi extends Document {
 objectUuId: string
 ward: string
 periodType: 'yearly' | 'monthly'
 year: number
 month?: number | null
 title: string
 subtitle?: string
 items: IKpiItem[]
 isDeleted: boolean
 deletedAt?: Date | null
 createdAt: Date
 updatedAt: Date
}

export const KpiMongooseSchema = new Schema<IKpi>(
 {
  objectUuId: { type: String, required: true, unique: true },
  ward: { type: String, required: true, uppercase: true, trim: true, default: 'MICU3', index: true },
  periodType: { type: String, enum: ['yearly', 'monthly'], required: true, default: 'yearly' },
  year: { type: Number, required: true, index: true },
  month: { type: Number, default: null },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '' },
  items: [
   {
    code: { type: String, required: true },
    tag: { type: String, default: 'มาตรฐานสำคัญ' },
    title: { type: String, required: true },
    targetDescription: { type: String, default: '' },
    targetValue: { type: Number, required: true },
    actualValue: { type: Number, required: true },
    unit: { type: String, required: true },
    progressPercent: { type: Number, default: 0 },
    isPassed: { type: Boolean, default: true },
    statusText: { type: String, default: '' },
    statusColor: { type: String, default: 'success' },
   },
  ],
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
 },
 { timestamps: true },
)

export const Kpi = mongoose.models.Kpi || mongoose.model<IKpi>('Kpi', KpiMongooseSchema)

export type KpiType = Static<typeof KpiSchema>
export type KpiItemType = Static<typeof KpiItemSchema>
export type CreateKpiType = Static<typeof CreateKpiBody>
export type UpdateKpiType = Static<typeof UpdateKpiBody>
