import crypto from 'crypto'
import { status } from 'elysia'
import { Content, IContent, PortalHeader } from './model'

function formatContentDoc(doc: any) {
 return {
  _id: doc._id?.toString(),
  objectUuId: doc.objectUuId,
  title: doc.title,
  slug: doc.slug,
  category: doc.category,
  summary: doc.summary || '',
  content: doc.content || '',
  coverImage: doc.coverImage || '',
  author: doc.author || 'ศูนย์บริการผู้ป่วยวิกฤต (ICU)',
  ward: doc.ward || 'ALL',
  isPublished: Boolean(doc.isPublished),
  isPinned: Boolean(doc.isPinned),
  viewCount: Number(doc.viewCount) || 0,
  tags: doc.tags || [],
  createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
  updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
 }
}

const INITIAL_CONTENTS = [
 {
  title: 'ระเบียบและแนวทางปฏิบัติการเข้าเยี่ยมผู้ป่วยในหออภิบาลผู้ป่วยวิกฤต (ICU Visiting Policy)',
  slug: 'icu-visiting-policy-guidelines',
  category: 'policy',
  summary: 'ข้อกำหนดและช่วงเวลาการเยี่ยมผู้ป่วยวิกฤต เพื่อความปลอดภัยและลดความเสี่ยงการแพร่กระจายเชื้อแก่ผู้ป่วย',
  content: `### วัตถุประสงค์และข้อกำหนดการเยี่ยม
เพื่อความปลอดภัยสูงสุดของผู้ป่วยในหอผู้ป่วยวิกฤต และให้การดูแลรักษาดำเนินไปอย่างมีประสิทธิภาพ หอผู้ป่วยวิกฤต (ICU) ขอความร่วมมือญาติและผู้เข้าเยี่ยมปฏิบัติตามระเบียบดังนี้:

1. **ช่วงเวลาการเข้าเยี่ยม:**
   - **รอบเที่ยง:** 12:00 น. - 13:00 น.
   - **รอบเย็น:** 17:00 น. - 19:00 น.
   *(กรณีผู้ป่วยมีอาการเปลี่ยนแปลงวิกฤต ทีมแพทย์และพยาบาลจะติดต่อญาติสายตรงเป็นกรณีพิเศษ)*

2. **จำนวนผู้เข้าเยี่ยม:**
   - อนุญาตให้เข้าเยี่ยมเตียงละไม่เกิน 2 ท่านพร้อมกัน เพื่อลดความแออัดและเสียงรบกวนผู้ป่วยข้างเคียง

3. **สุขอนามัยและการป้องกันการติดเชื้อ:**
   - ล้างมือด้วยแอลกอฮอล์เจลก่อนเข้าและหลังออกจากห้องผู้ป่วยทุกครั้ง
   - สวมหน้ากากอนามัยตลอดเวลาขณะอยู่ในหออภิบาล
   - หากมีอาการไข้ ไอ เจ็บคอ หรือมีอาการระบบทางเดินหายใจ กรุณางดเข้าเยี่ยม

4. **การบันทึกภาพและเสียง:**
   - ขอความร่วมมือ **งดถ่ายภาพ บันทึกวิดีโอ หรือบันทึกเสียง** ภายในหอผู้ป่วยวิกฤตทุกกรณี เพื่อเคารพสิทธิความเป็นส่วนตัวของผู้ป่วยท่านอื่นตาม พ.ร.บ. สุขภาพแห่งชาติ`,
  coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  author: 'คณะกรรมการควบคุมการติดเชื้อและงานบริการผู้ป่วยวิกฤต',
  ward: 'ALL',
  isPublished: true,
  isPinned: true,
  viewCount: 142,
  tags: ['ระเบียบการเยี่ยม', 'ความปลอดภัย', 'ICU Policy'],
 },
 {
  title: 'แนวทางการเตรียมตัวและส่งเสริมการฟื้นฟูสำหรับญาติผู้ป่วยวิกฤต (Family Support & Patient Recovery)',
  slug: 'family-support-and-recovery-guide',
  category: 'education',
  summary: 'บทบาทสำคัญของครอบครัวในการเป็นพลังใจ และการสื่อสารเชิงบวกเพื่อช่วยฟื้นฟูสภาพจิตใจของผู้ป่วยระหว่างนอนพักรักษาใน ICU',
  content: `### พลังแห่งครอบครัวในการดูแลผู้ป่วยวิกฤต
การนอนพักรักษาตัวในหอผู้ป่วยวิกฤตอาจสร้างความกังวลใจให้แก่ทั้งผู้ป่วยและญาติ แต่การมีส่วนร่วมของครอบครัวอย่างถูกวิธีสามารถส่งผลดีต่อกระบวนการฟื้นตัวอย่างมหาศาล

- **การสัมผัสและการพูดคุย:** สัมผัสมือเบาๆ และพูดคุยด้วยน้ำเสียงอบอุ่น แม้ผู้ป่วยที่ได้รับยานอนหลับหรือใส่ท่อช่วยหายใจก็ยังสามารถรับรู้เสียงของคนในครอบครัวได้
- **การบอกเล่าวันเวลาและสภาพแวดล้อม:** ช่วยกระตุ้นการรับรู้ (Orientation) เช่น "วันนี้วันอาทิตย์ อากาศดี คุณหมอและพยาบาลกำลังดูแลใกล้ชิดนะ"
- **การให้กำลังใจ:** หลีกเลี่ยงการแสดงความวิตกกังวลจนเกินไปต่อหน้าผู้ป่วย เพื่อสร้างความมั่นใจและลดความเครียดทางสรีรวิทยา`,
  coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
  author: 'ทีมสหสาขาวิชาชีพและจิตวิทยาการพยาบาล',
  ward: 'MICU3',
  isPublished: true,
  isPinned: true,
  viewCount: 98,
  tags: ['สุขศึกษา', 'การฟื้นฟู', 'การดูแลจิตใจ'],
 },
 {
  title: 'ประกาศ: นวัตกรรมการติดตามประเมินสัญญาณชีพและการป้องกันแผลกดทับด้วยเซนเซอร์อัจฉริยะ',
  slug: 'icu-smart-sensor-innovation-update',
  category: 'news',
  summary: 'หอผู้ป่วยวิกฤตยกระดับมาตรฐานความปลอดภัยด้วยระบบประเมิน Bed Assessment รายวันและระบบเตือนอัจฉริยะ Zero Harm',
  content: `หอผู้ป่วยวิกฤตอายุรกรรม (MICU3) ได้นำระบบสารสนเทศติดตามประเมินเตียงรายวัน (Daily Bed Assessment Monitoring) และตัวชี้วัดความปลอดภัยคุณภาพ (ICU Quality KPIs) มาบูรณาการใช้งาน เพื่อเป้าหมาย Zero Harm:

- การพลิกตะแคงตัวสม่ำเสมอทุก 2 ชั่วโมง พร้อมประเมิน Braden Scale ต่อเนื่อง
- การเฝ้าระวังการติดเชื้อในกระแสเลือด (CLABSI) และปอดอักเสบจากเครื่องช่วยหายใจ (VAP) ตามเกณฑ์มาตรฐาน CDC
- ประชาชนและญาติสามารถติดตามข้อมูลข่าวสารและนโยบายความโปร่งใสผ่านระบบ Portal ได้ตลอด 24 ชั่วโมง`,
  coverImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
  author: 'ศูนย์นวัตกรรมและสารสนเทศการแพทย์',
  ward: 'ALL',
  isPublished: true,
  isPinned: false,
  viewCount: 65,
  tags: ['นวัตกรรม', 'Zero Harm', 'ความปลอดภัย'],
 },
]

export abstract class contentService {
 static async seedInitialData() {
  try {
   const count = await Content.countDocuments({ isDeleted: { $ne: true } })
   if (count === 0) {
    for (const item of INITIAL_CONTENTS) {
     await Content.create({
      objectUuId: crypto.randomUUID(),
      ...item,
     })
    }
   }
  } catch (err) {
   // ignore seed error
  }
 }

 static async getContentList({
  query,
 }: {
  query?: {
   category?: string
   search?: string
   ward?: string
   isPublished?: string
   page?: string
   limit?: string
   publicOnly?: string
  }
 }) {
  await this.seedInitialData()

  const limit = Math.max(1, Number(query?.limit) || 20)
  const page = Math.max(1, Number(query?.page) || 1)
  const skip = (page - 1) * limit

  const filterQuery: any = { isDeleted: { $ne: true } }

  // ถ้าเป็น public query หรือไม่ได้ส่ง isPublished มาเฉพาะเจาะจง ให้กรองเฉพาะที่ published
  if (query?.publicOnly === 'true') {
   filterQuery.isPublished = true
  } else if (query?.isPublished !== undefined && query?.isPublished !== '') {
   filterQuery.isPublished = query.isPublished === 'true'
  }

  if (query?.category && query.category !== 'all') {
   filterQuery.category = query.category
  }

  if (query?.ward && query.ward !== 'ALL') {
   filterQuery.$or = [{ ward: query.ward }, { ward: 'ALL' }]
  }

  if (query?.search) {
   const regex = new RegExp(query.search.trim(), 'i')
   filterQuery.$or = [
    { title: regex },
    { summary: regex },
    { content: regex },
    { tags: { $in: [regex] } },
   ]
  }

  try {
   const [docs, totalItems] = await Promise.all([
    Content.find(filterQuery)
     .sort({ isPinned: -1, createdAt: -1 })
     .skip(skip)
     .limit(limit)
     .lean(),
    Content.countDocuments(filterQuery),
   ])

   return {
    data: docs.map(formatContentDoc),
    message: 'ดึงรายการเนื้อหาสำเร็จ',
    statusCode: 200,
    pagination: {
     page,
     limit,
     totalPages: Math.ceil(totalItems / limit) || 1,
     totalItems,
    },
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'ดึงรายการเนื้อหาไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async getContentById({ id }: { id: string }) {
  try {
   const query: any = { isDeleted: { $ne: true } }
   if (/^[0-9a-fA-F]{24}$/.test(id)) {
    query.$or = [{ _id: id }, { objectUuId: id }, { slug: id }]
   } else {
    query.$or = [{ objectUuId: id }, { slug: id }]
   }

   const doc = await Content.findOneAndUpdate(
    query,
    { $inc: { viewCount: 1 } },
    { new: true },
   ).lean()

   if (!doc) {
    return status(404, {
     error: 'Content not found',
     message: 'ไม่พบเนื้อหาที่ระบุ',
     statusCode: 404,
    })
   }

   return {
    data: formatContentDoc(doc),
    message: 'ดึงข้อมูลเนื้อหาสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเนื้อหา',
    statusCode: 500,
   })
  }
 }

 static async createContent({ body }: { body: any }) {
  try {
   const title = (body.title || '').trim()
   if (!title) {
    return status(400, {
     error: 'Title is required',
     message: 'กรุณาระบุหัวข้อเนื้อหา',
     statusCode: 400,
    })
   }

   const baseSlug =
    body.slug?.trim() ||
    title
     .toLowerCase()
     .replace(/[^\w\s-]/g, '')
     .replace(/\s+/g, '-') ||
    `content-${Date.now()}`
   const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`

   const newDoc = new Content({
    objectUuId: crypto.randomUUID(),
    title,
    slug,
    category: body.category || 'announcement',
    summary: (body.summary || '').trim(),
    content: (body.content || '').trim(),
    coverImage: (body.coverImage || '').trim(),
    author: (body.author || 'ศูนย์บริการผู้ป่วยวิกฤต (ICU)').trim(),
    ward: (body.ward || 'ALL').trim(),
    isPublished: body.isPublished !== false,
    isPinned: Boolean(body.isPinned),
    viewCount: 0,
    tags: Array.isArray(body.tags) ? body.tags : [],
    isDeleted: false,
   })

   await newDoc.save()

   return {
    data: formatContentDoc(newDoc.toObject()),
    message: 'สร้างเนื้อหาสำเร็จ',
    statusCode: 201,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message || 'Create failed',
    message: 'สร้างเนื้อหาไม่สำเร็จ',
    statusCode: 400,
   })
  }
 }

 static async updateContent({ id, body }: { id: string; body: any }) {
  try {
   const query: any = { isDeleted: { $ne: true } }
   if (/^[0-9a-fA-F]{24}$/.test(id)) {
    query.$or = [{ _id: id }, { objectUuId: id }]
   } else {
    query.objectUuId = id
   }

   const existing = await Content.findOne(query)
   if (!existing) {
    return status(404, {
     error: 'Content not found',
     message: 'ไม่พบเนื้อหาที่ต้องการอัปเดต',
     statusCode: 404,
    })
   }

   const updateData: any = {}
   if (body.title !== undefined) updateData.title = body.title.trim()
   if (body.category !== undefined) updateData.category = body.category
   if (body.summary !== undefined) updateData.summary = body.summary.trim()
   if (body.content !== undefined) updateData.content = body.content.trim()
   if (body.coverImage !== undefined) updateData.coverImage = body.coverImage.trim()
   if (body.author !== undefined) updateData.author = body.author.trim()
   if (body.ward !== undefined) updateData.ward = body.ward.trim()
   if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished)
   if (body.isPinned !== undefined) updateData.isPinned = Boolean(body.isPinned)
   if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : []

   await Content.updateOne(query, { $set: updateData })
   const updated = await Content.findOne(query).lean()

   return {
    data: formatContentDoc(updated),
    message: 'อัปเดตเนื้อหาสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message || 'Update failed',
    message: 'อัปเดตเนื้อหาไม่สำเร็จ',
    statusCode: 400,
   })
  }
 }

 static async deleteContent({ id }: { id: string }) {
  try {
   const query: any = { isDeleted: { $ne: true } }
   if (/^[0-9a-fA-F]{24}$/.test(id)) {
    query.$or = [{ _id: id }, { objectUuId: id }]
   } else {
    query.objectUuId = id
   }

   const existing = await Content.findOne(query)
   if (!existing) {
    return status(404, {
     error: 'Content not found',
     message: 'ไม่พบเนื้อหาที่ต้องการลบ',
     statusCode: 404,
    })
   }

   await Content.updateOne(query, {
    $set: { isDeleted: true, deletedAt: new Date() },
   })

   return {
    message: 'ลบเนื้อหาสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Delete failed',
    message: 'ลบเนื้อหาไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async getPortalHeader() {
  try {
   let header = await PortalHeader.findOne({ key: 'main_portal_header' }).lean()
   if (!header) {
    header = await PortalHeader.create({
     key: 'main_portal_header',
     badgeText: 'บริการสารสนเทศและประชาสัมพันธ์สำหรับญาติผู้ป่วย',
     title: 'หออภิบาลผู้ป่วยวิกฤตอายุรกรรม (MICU)',
     description:
      'ศูนย์รวมข้อมูลระเบียบการเข้าเยี่ยม คำแนะนำการปฏิบัติตัวสำหรับครอบครัว และสาระความรู้ในการร่วมมือดูแลฟื้นฟูสุขภาพผู้ป่วยวิกฤตตามมาตรฐานความปลอดภัยสากล',
     visitingHoursLabel: 'เวลาเข้าเยี่ยมผู้ป่วย',
     visitingHours: '12:00 - 13:00 น. | 17:00 - 19:00 น.',
     safetyMeasuresLabel: 'มาตรการความปลอดภัย',
     safetyMeasures: 'ล้างมือก่อนเข้า-ออก | สวมหน้ากากอนามัย',
     guidelinesTitle: 'ข้อพึงปฏิบัติสำคัญ',
     guidelines: [
      'เข้าเยี่ยมเตียงละไม่เกิน 2 ท่าน พร้อมกัน',
      'งดถ่ายภาพและบันทึกวิดีโอเพื่อคุ้มครองสิทธิผู้ป่วย',
      'ติดต่อสอบถามข้อมูลอาการได้ที่เคาน์เตอร์พยาบาล',
     ],
     emergencyPhone: 'สายด่วน ICU: 02-xxx-xxxx ต่อ 1234',
    })
   }

   return {
    data: header,
    message: 'ดึงข้อมูลส่วนหัว Portal สำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'ดึงข้อมูลส่วนหัว Portal ไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async updatePortalHeader({ body }: { body: any }) {
  try {
   const updateData: any = {}
   if (body.badgeText !== undefined) updateData.badgeText = body.badgeText.trim()
   if (body.title !== undefined) updateData.title = body.title.trim()
   if (body.description !== undefined) updateData.description = body.description.trim()
   if (body.visitingHoursLabel !== undefined)
    updateData.visitingHoursLabel = body.visitingHoursLabel.trim()
   if (body.visitingHours !== undefined)
    updateData.visitingHours = body.visitingHours.trim()
   if (body.safetyMeasuresLabel !== undefined)
    updateData.safetyMeasuresLabel = body.safetyMeasuresLabel.trim()
   if (body.safetyMeasures !== undefined)
    updateData.safetyMeasures = body.safetyMeasures.trim()
   if (body.guidelinesTitle !== undefined)
    updateData.guidelinesTitle = body.guidelinesTitle.trim()
   if (body.guidelines !== undefined)
    updateData.guidelines = Array.isArray(body.guidelines) ? body.guidelines : []
   if (body.emergencyPhone !== undefined)
    updateData.emergencyPhone = body.emergencyPhone.trim()

   const updated = await PortalHeader.findOneAndUpdate(
    { key: 'main_portal_header' },
    { $set: updateData },
    { upsert: true, new: true },
   ).lean()

   return {
    data: updated,
    message: 'อัปเดตข้อมูลส่วนหัว Portal สำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message || 'Update header failed',
    message: 'อัปเดตข้อมูลส่วนหัว Portal ไม่สำเร็จ',
    statusCode: 400,
   })
  }
 }
}
