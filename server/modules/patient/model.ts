import { Static, t, UnwrapSchema } from 'elysia'
import mongoose, { Document, Schema } from 'mongoose'

export const AdmissionTypeSchema = t.Union(
 [
  t.Literal('admit'),
  t.Literal('transfer'),
  t.Literal('refer'),
 ],
 {
  description: 'ประเภทการรับเข้า: admit (รับใหม่), transfer (ย้ายรับ), refer (Fast Track)',
  default: 'admit',
 },
)

export const PatientStatusSchema = t.Union(
 [
  t.Literal('admitted'),
  t.Literal('discharged'),
 ],
 {
  description: 'สถานะการรักษา: admitted (กำลังรักษา), discharged (จำหน่ายออก)',
  default: 'admitted',
 },
)

export const PatientSchema = t.Object({
 _id: t.Optional(t.String({ description: 'MongoDB ObjectID' })),
 objectUuId: t.Optional(t.String({ format: 'uuid', description: 'UUID ของผู้ป่วย' })),
 bedNumber: t.String({ description: 'หมายเลขเตียง เช่น เตียงที่ 2' }),
 hn: t.String({ description: 'หมายเลขประจำตัวผู้ป่วย (HN)' }),
 an: t.String({ description: 'หมายเลขการรับเข้ารักษา (AN)' }),
 admissionType: AdmissionTypeSchema,
 patientName: t.String({ description: 'ชื่อจริง - นามสกุลผู้ป่วย' }),
 diagnosis: t.String({ description: 'การวินิจฉัยโรคเบื้องต้น (DX.)' }),
 attendingDoctor: t.String({ description: 'แพทย์เจ้าของไข้' }),
 hometown: t.String({ description: 'ภูมิลำเนา (จังหวัด/อำเภอ)' }),
 admissionDate: t.String({ description: 'วันที่เข้ารับการรักษา' }),
 status: PatientStatusSchema,
 ward: t.Optional(t.String({ description: 'รหัสหอผู้ป่วย (Ward) เช่น MICU3' })),
 isDeleted: t.Optional(t.Boolean({ description: 'สถานะการลบข้อมูล (Soft delete)', default: false })),
 deletedAt: t.Optional(
  t.Union([t.String({ format: 'date-time' }), t.Null()], {
   description: 'วันที่ทำการลบข้อมูล',
  }),
 ),
 createdAt: t.Optional(t.String({ format: 'date-time', description: 'วันที่สร้างข้อมูล' })),
 updatedAt: t.Optional(t.String({ format: 'date-time', description: 'วันที่อัปเดตข้อมูล' })),
})

export const CreatePatientBody = t.Object({
 bedNumber: t.String({ minLength: 1, description: 'หมายเลขเตียง' }),
 hn: t.String({ minLength: 1, description: 'หมายเลข HN' }),
 an: t.String({ minLength: 1, description: 'หมายเลข AN' }),
 admissionType: AdmissionTypeSchema,
 patientName: t.String({ minLength: 1, description: 'ชื่อผู้ป่วย' }),
 diagnosis: t.String({ minLength: 1, description: 'การวินิจฉัยโรคเบื้องต้น' }),
 attendingDoctor: t.String({ minLength: 1, description: 'แพทย์เจ้าของไข้' }),
 hometown: t.String({ minLength: 1, description: 'ภูมิลำเนา' }),
 admissionDate: t.String({ minLength: 1, description: 'วันที่เข้ารับการรักษา' }),
 status: PatientStatusSchema,
 ward: t.Optional(t.String({ description: 'รหัสหอผู้ป่วย (Ward)' })),
})

export const UpdatePatientBody = t.Partial(CreatePatientBody)

export const ResponsePatientSchema = {
 createBody: CreatePatientBody,
 updateBody: UpdatePatientBody,

 getDetailResponse: t.Object({
  data: PatientSchema,
  message: t.String(),
  statusCode: t.Number(),
 }),

 getListResponse: t.Object({
  data: t.Array(PatientSchema),
  message: t.Optional(t.String()),
  statusCode: t.Number(),
  pagination: t.Object({
   page: t.Number(),
   limit: t.Number(),
   totalPages: t.Number(),
   totalItems: t.Number(),
  }),
 }),

 response: t.Object({
  message: t.String(),
  statusCode: t.Number(),
  referenceId: t.Optional(t.String()),
  error: t.Optional(t.String()),
 }),
} as const

export type PatientType = Static<typeof PatientSchema>
export type PatientModel = {
 [k in keyof typeof PatientSchema]: UnwrapSchema<(typeof PatientSchema)[k]>
}
export type CreatePatientInput = Static<typeof CreatePatientBody>
export type UpdatePatientInput = Static<typeof UpdatePatientBody>

export interface IPatientDocument extends Document {
 objectUuId: string
 bedNumber: string
 hn: string
 an: string
 admissionType: 'admit' | 'transfer' | 'refer'
 patientName: string
 diagnosis: string
 attendingDoctor: string
 hometown: string
 admissionDate: Date | string
 status: 'admitted' | 'discharged'
 ward: string
 isDeleted: boolean
 deletedAt?: Date | null
 createdAt?: Date
 updatedAt?: Date
}

export const PatientSchemaX: Schema = new Schema(
 {
  objectUuId: {
   type: String,
   required: true,
   unique: true,
   sparse: true,
   trim: true,
  },
  bedNumber: {
   type: String,
   required: [true, 'กรุณาระบุหมายเลขเตียง'],
   trim: true,
  },
  hn: {
   type: String,
   required: [true, 'กรุณาระบุหมายเลข HN'],
   trim: true,
   index: true,
  },
  an: {
   type: String,
   required: [true, 'กรุณาระบุหมายเลข AN'],
   unique: true,
   trim: true,
  },
  admissionType: {
   type: String,
   required: [true, 'กรุณาระบุประเภทการรับเข้า'],
   enum: ['admit', 'transfer', 'refer'],
   trim: true,
  },
  patientName: {
   type: String,
   required: [true, 'กรุณาระบุชื่อจริง-นามสกุลผู้ป่วย'],
   trim: true,
  },
  diagnosis: {
   type: String,
   required: [true, 'กรุณาระบุการวินิจฉัยโรคเบื้องต้น'],
   trim: true,
  },
  attendingDoctor: {
   type: String,
   required: [true, 'กรุณาระบุแพทย์เจ้าของไข้'],
   trim: true,
  },
  hometown: {
   type: String,
   required: [true, 'กรุณาระบุภูมิลำเนา'],
   trim: true,
  },
  admissionDate: {
   type: Date,
   required: [true, 'กรุณาระบุวันที่เข้ารับการรักษา'],
  },
  status: {
   type: String,
   required: [true, 'กรุณาระบุสถานะการรักษา'],
   enum: ['admitted', 'discharged'],
   trim: true,
   index: true,
  },
  ward: {
   type: String,
   default: 'MICU3',
   trim: true,
   index: true,
  },
  isDeleted: {
   type: Boolean,
   default: false,
   index: true,
  },
  deletedAt: {
   type: Date,
   default: null,
  },
 },
 {
  timestamps: true,
 },
)

export const Patient: mongoose.Model<IPatientDocument> =
 (mongoose.models.patients as mongoose.Model<IPatientDocument>) ||
 mongoose.model<IPatientDocument>('patients', PatientSchemaX)
