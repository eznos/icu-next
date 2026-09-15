import { Static, t, UnwrapSchema } from 'elysia'
import { Schema } from 'mongoose'
// 🌟 1. สร้าง TypeBox Schema พร้อมคำอธิบาย
export const OfficialSchema = t.Object({
 objectUuId: t.Optional(
  t.String({
   description: 'UUID ของผู้ปฏิบัติการ',
   default: '550e8400-e29b-41d4-a716-446655440000',
   format: 'uuid', // ตรวจสอบว่าเป็น UUID ที่ถูกต้อง
  }),
 ),
 fullName: t.Optional(
  t.String({
   description: 'ชื่อ-นามสกุล เต็มของผู้ปฏิบัติการ',
   trim: true,
   minLength: 3, // (Optional) สามารถตั้งค่าความยาวขั้นต่ำได้ด้วย
   maxLength: 100, // (Optional) สามารถตั้งค่าความยาวสูงสุดได้ด้วย
  }),
 ),
 age: t.Optional(
  t.Number({
   description: 'อายุ (ปี)',
   default: 35,
   minimum: 18, // (Optional) สามารถตั้งค่าขั้นต่ำได้ด้วย
  }),
 ),
 gender: t.Union([t.Literal('ชาย'), t.Literal('หญิง'), t.Literal('อื่นๆ')], {
  description: 'เพศ (ชาย, หญิง, หรือ อื่นๆ)',
  default: 'ชาย',
 }),
 position: t.Optional(
  t.String({
   description: 'ตำแหน่งหน้าที่',
   default: 'พยาบาลวิชาชีพ',
   trim: true,
   minLength: 2,
  }),
 ),
 competencyLevel: t.Union(
  [
   t.Literal('Novice'),
   t.Literal('Advanced Beginner'),
   t.Literal('Competent'),
   t.Literal('Proficient'),
   t.Literal('Expert'),
  ],
  {
   description: 'ระดับความเชี่ยวชาญตามมาตรฐาน (Competency Level)',
   default: 'Competent',
  },
 ),
 licenseNumber: t.String({
  description: 'เลขที่ใบประกอบวิชาชีพ',
  default: '1234567890',
 }),
 licenseExpiryDate: t.String({
  format: 'date-time', // ตรวจสอบว่าเป็นรูปแบบวันที่ ISO
  description: 'วันหมดอายุของใบประกอบวิชาชีพ (ISO 8601 format)',
  default: '2026-12-31T00:00:00.000Z',
 }),
 phoneNumber: t.String({
  description: 'เบอร์โทรศัพท์ติดต่อ',
  default: '0812345678',
 }),
 licenseDocumentUrl: t.String({
  format: 'uri', // ตรวจสอบว่าเป็น URL ที่ถูกต้อง
  description: 'URL สำหรับเข้าดูไฟล์ PDF หลักฐานใบประกอบวิชาชีพ',
  default: 'https://example.com/docs/license_123.pdf',
 }),
 // 💡 createdAt และ updatedAt มักจะถูกสร้างโดย DB
 // เลยใส่เป็น Optional ไว้ เผื่อใช้ Schema นี้ตอน Create
 createdAt: t.Optional(
  t.String({
   format: 'date-time',
   description: 'วันที่สร้างข้อมูล (ระบบสร้างให้อัตโนมัติ)',
  }),
 ),
 updatedAt: t.Optional(
  t.String({
   format: 'date-time',
   description: 'วันที่อัปเดตข้อมูลล่าสุด (ระบบสร้างให้อัตโนมัติ)',
  }),
 ),
})

export const OfficialSchemaX: Schema = new Schema(
 {
  objectUuId: {
   type: String,
   required: [true, 'ไม่พบ UUID ของผู้ปฏิบัติการ'],
   unique: true,
   sparse: true,
   trim: true,
  },
  fullName: {
   type: String,
   required: [true, 'กรุณาระบุชื่อจริง-นามสกุล'],
   trim: true,
  },
  age: {
   type: Number,
   required: [true, 'กรุณาระบุอายุ'],
   min: [18, 'อายุต้องไม่ต่ำกว่า 18 ปี'],
  },
  gender: {
   type: String,
   required: [true, 'กรุณาระบุเพศ'],
   enum: ['ชาย', 'หญิง', 'อื่นๆ'], // ปรับตาม Dropdown ที่มีในระบบ
  },
  position: {
   type: String,
   required: [true, 'กรุณาระบุตำแหน่ง'],
  },
  competencyLevel: {
   type: String,
   required: [true, 'กรุณาระบุระดับสมรรถนะ'],
   enum: ['Novice', 'Advanced Beginner', 'Competent', 'Proficient', 'Expert'],
  },
  licenseNumber: {
   type: String,
   required: [true, 'กรุณาระบุเลขที่ใบอนุญาต'],
   trim: true,
  },
  licenseExpiryDate: {
   type: Date,
   required: [true, 'กรุณาระบุวันหมดอายุใบอนุญาต'],
  },
  phoneNumber: {
   type: String,
   required: [true, 'กรุณาระบุเบอร์โทรศัพท์'],
   trim: true,
  },
  licenseDocumentUrl: {
   type: String,
   required: [true, 'กรุณาอัปโหลดไฟล์ PDF หลักฐาน'],
  },
 },
 {
  timestamps: true,
 },
)

export const ResponseOfficialSchema = {
 createBody: OfficialSchema,
 editBody: OfficialSchema,

 getDetailResponse: t.Object({
  data: OfficialSchema,
  message: t.String(),
  statusCode: t.Number(),
 }),

 getListResponse: t.Object({
  data: t.Array(OfficialSchema),
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
 signInInvalid: t.Literal('Invalid username or password'),
} as const

export type OfficialType = Static<typeof OfficialSchema>

export type OfficialModel = {
 [k in keyof typeof OfficialSchema]: UnwrapSchema<(typeof OfficialSchema)[k]>
}
