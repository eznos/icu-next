import { Static, t, UnwrapSchema } from 'elysia'

// 🌟 1. สร้าง TypeBox Schema พร้อมคำอธิบาย
export const OfficialSchema = t.Object({
 id: t.Optional(
  t.String({
   description: 'รหัสผู้ปฏิบัติการ (ID)',
   default: '64f8e1c2b5a1c2d3e4f5a1b2',
  }),
 ),
 fullName: t.String({
  description: 'ชื่อ-นามสกุล เต็มของผู้ปฏิบัติการ',
  default: 'นพ. สมชาย ใจดี',
  trim: true, // ตัดช่องว่างด้านหน้าและด้านหลังออก
  minLength: 3, // (Optional) สามารถตั้งค่าความยาวขั้นต่ำได้ด้วย
  maxLength: 100, // (Optional) สามารถตั้งค่าความยาวสูงสุดได้ด้วย
 }),
 age: t.Number({
  description: 'อายุ (ปี)',
  default: 35,
  minimum: 18, // (Optional) สามารถตั้งค่าขั้นต่ำได้ด้วย
 }),
 gender: t.Union([t.Literal('ชาย'), t.Literal('หญิง'), t.Literal('อื่นๆ')], {
  description: 'เพศ (ชาย, หญิง, หรือ อื่นๆ)',
  default: 'ชาย',
 }),
 position: t.String({
  description: 'ตำแหน่งหน้าที่',
  default: 'พยาบาลวิชาชีพ',
  trim: true,
  minLength: 2,
 }),
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
  message: t.String(),
  statusCode: t.Number(),
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
  totalPages: t.Number(),
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
 }),
 signInInvalid: t.Literal('Invalid username or password'),
} as const

export type OfficialType = Static<typeof OfficialSchema>

export type OfficialModel = {
 [k in keyof typeof OfficialSchema]: UnwrapSchema<(typeof OfficialSchema)[k]>
}
