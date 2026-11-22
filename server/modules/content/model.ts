import mongoose, { Document, Schema } from 'mongoose'
import { t } from 'elysia'

export interface IContent extends Document {
 objectUuId: string
 title: string
 slug: string
 category: 'announcement' | 'news' | 'policy' | 'education' | 'guideline'
 summary: string
 content: string
 coverImage?: string
 author: string
 ward: string
 isPublished: boolean
 isPinned: boolean
 viewCount: number
 tags: string[]
 isDeleted: boolean
 deletedAt?: Date | null
 createdAt: Date
 updatedAt: Date
}

const ContentSchema = new Schema<IContent>(
 {
  objectUuId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  category: {
   type: String,
   enum: ['announcement', 'news', 'policy', 'education', 'guideline'],
   default: 'announcement',
  },
  summary: { type: String, default: '', trim: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  author: { type: String, default: 'ศูนย์บริการผู้ป่วยวิกฤต (ICU)' },
  ward: { type: String, default: 'ALL' },
  isPublished: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
 },
 {
  timestamps: true,
 },
)

export const Content =
 mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema)

// Model สำหรับตั้งค่าส่วนหัว Portal (Portal Header Config)
export interface IPortalHeader extends Document {
 key: string
 badgeText: string
 title: string
 description: string
 visitingHoursLabel: string
 visitingHours: string
 safetyMeasuresLabel: string
 safetyMeasures: string
 guidelinesTitle: string
 guidelines: string[]
 emergencyPhone: string
 updatedAt: Date
}

const PortalHeaderSchema = new Schema<IPortalHeader>(
 {
  key: { type: String, default: 'main_portal_header', unique: true },
  badgeText: { type: String, default: 'บริการสารสนเทศและประชาสัมพันธ์สำหรับญาติผู้ป่วย' },
  title: { type: String, default: 'หออภิบาลผู้ป่วยวิกฤตอายุรกรรม (MICU)' },
  description: {
   type: String,
   default:
    'ศูนย์รวมข้อมูลระเบียบการเข้าเยี่ยม คำแนะนำการปฏิบัติตัวสำหรับครอบครัว และสาระความรู้ในการร่วมมือดูแลฟื้นฟูสุขภาพผู้ป่วยวิกฤตตามมาตรฐานความปลอดภัยสากล',
  },
  visitingHoursLabel: { type: String, default: 'เวลาเข้าเยี่ยมผู้ป่วย' },
  visitingHours: { type: String, default: '12:00 - 13:00 น. | 17:00 - 19:00 น.' },
  safetyMeasuresLabel: { type: String, default: 'มาตรการความปลอดภัย' },
  safetyMeasures: { type: String, default: 'ล้างมือก่อนเข้า-ออก | สวมหน้ากากอนามัย' },
  guidelinesTitle: { type: String, default: 'ข้อพึงปฏิบัติสำคัญ' },
  guidelines: {
   type: [String],
   default: [
    'เข้าเยี่ยมเตียงละไม่เกิน 2 ท่าน พร้อมกัน',
    'งดถ่ายภาพและบันทึกวิดีโอเพื่อคุ้มครองสิทธิผู้ป่วย',
    'ติดต่อสอบถามข้อมูลอาการได้ที่เคาน์เตอร์พยาบาล',
   ],
  },
  emergencyPhone: { type: String, default: 'สายด่วน ICU: 02-xxx-xxxx ต่อ 1234' },
 },
 {
  timestamps: true,
 },
)

export const PortalHeader =
 mongoose.models.PortalHeader || mongoose.model<IPortalHeader>('PortalHeader', PortalHeaderSchema)

export const ResponseContentSchema = {
 basicResponse: t.Object({
  message: t.String(),
  statusCode: t.Number(),
  error: t.Optional(t.String()),
 }),
 detailResponse: t.Object({
  data: t.Any(),
  message: t.String(),
  statusCode: t.Number(),
 }),
 listResponse: t.Object({
  data: t.Array(t.Any()),
  message: t.String(),
  statusCode: t.Number(),
  pagination: t.Optional(
   t.Object({
    page: t.Number(),
    limit: t.Number(),
    totalPages: t.Number(),
    totalItems: t.Number(),
   }),
  ),
 }),
}
