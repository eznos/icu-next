import crypto from 'crypto'
import { status } from 'elysia'
import mongoose from 'mongoose'
import { Feedback, IFeedback } from './model'

function formatFeedbackDoc(doc: any) {
  return {
    _id: doc._id?.toString(),
    objectUuId: doc.objectUuId,
    overallRating: Number(doc.overallRating) || 5,
    nurseRating: Number(doc.nurseRating) || 5,
    doctorRating: Number(doc.doctorRating) || 5,
    cleanlinessRating: Number(doc.cleanlinessRating) || 5,
    coordinationRating: Number(doc.coordinationRating) || 5,
    relationship: doc.relationship || 'relative',
    patientOrBedInfo: doc.patientOrBedInfo || '',
    visitorName: doc.visitorName || '',
    contactPhone: doc.contactPhone || '',
    comment: doc.comment || '',
    status: doc.status || 'new',
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  }
}

const INITIAL_FEEDBACKS = [
  {
    overallRating: 5,
    nurseRating: 5,
    doctorRating: 5,
    cleanlinessRating: 5,
    coordinationRating: 4,
    relationship: 'child',
    patientOrBedInfo: 'เตียง 1',
    visitorName: 'คุณกิตติศักดิ์ พ.',
    contactPhone: '081-234-5678',
    comment: 'ทีมพยาบาลใส่ใจดูแลคุณแม่อย่างดีมาก อธิบายอาการอย่างใจเย็นและให้กำลังใจครอบครัวตลอดเวลา ขอบคุณมากครับ',
    status: 'reviewed',
  },
  {
    overallRating: 5,
    nurseRating: 5,
    doctorRating: 5,
    cleanlinessRating: 4,
    coordinationRating: 5,
    relationship: 'spouse',
    patientOrBedInfo: 'เตียง 3',
    visitorName: 'คุณนภาวรรณ',
    contactPhone: '089-876-5432',
    comment: 'คุณหมอให้ข้อมูลผลตรวจละเอียด เข้าใจง่าย ทำให้ครอบครัวคลายกังวลเรื่องการผ่าตัดอย่างมากค่ะ',
    status: 'new',
  },
  {
    overallRating: 4,
    nurseRating: 4,
    doctorRating: 5,
    cleanlinessRating: 4,
    coordinationRating: 3,
    relationship: 'parent',
    patientOrBedInfo: 'เตียง 2',
    visitorName: 'คุณสมคิด ร.',
    contactPhone: '',
    comment: 'การดูแลทางการแพทย์ดีเยี่ยม แต่อยากให้มีเก้าอี้พักคอยหน้าห้องไอซียูเพิ่มอีกสักนิดในช่วงเวลารอเข้าเยี่ยมครับ',
    status: 'new',
  },
  {
    overallRating: 5,
    nurseRating: 5,
    doctorRating: 4,
    cleanlinessRating: 5,
    coordinationRating: 5,
    relationship: 'relative',
    patientOrBedInfo: 'เตียง 5',
    visitorName: '',
    contactPhone: '',
    comment: 'ห้องสะอาด เป็นระเบียบ เจ้าหน้าที่ประสานงานรวดเร็ว มีมาตรการคัดกรองความปลอดภัยดีมากครับ',
    status: 'resolved',
  },
  {
    overallRating: 3,
    nurseRating: 4,
    doctorRating: 3,
    cleanlinessRating: 4,
    coordinationRating: 3,
    relationship: 'other',
    patientOrBedInfo: 'เตียง 4',
    visitorName: 'ผู้มาเยี่ยม',
    contactPhone: '',
    comment: 'อยากให้สามารถสอบถามอาการทางโทรศัพท์ได้สะดวกขึ้นในช่วงบ่าย เพราะบางครั้งโทรติดยากครับ',
    status: 'reviewed',
  },
]

export const feedbackService = {
  async ensureSeedData() {
    try {
      const count = await Feedback.countDocuments({ isDeleted: { $ne: true } })
      if (count === 0) {
        const seedDocs = INITIAL_FEEDBACKS.map((item) => ({
          ...item,
          objectUuId: crypto.randomUUID(),
          isDeleted: false,
        }))
        await Feedback.insertMany(seedDocs)
      }
    } catch {
      // Ignore database seed error
    }
  },

  async createFeedback({ body }: { body: any }) {
    try {
      const overallRating = Math.max(1, Math.min(5, Number(body.overallRating) || 5))
      const nurseRating = Math.max(1, Math.min(5, Number(body.nurseRating) || 5))
      const doctorRating = Math.max(1, Math.min(5, Number(body.doctorRating) || 5))
      const cleanlinessRating = Math.max(1, Math.min(5, Number(body.cleanlinessRating) || 5))
      const coordinationRating = Math.max(1, Math.min(5, Number(body.coordinationRating) || 5))

      const doc = new Feedback({
        objectUuId: crypto.randomUUID(),
        overallRating,
        nurseRating,
        doctorRating,
        cleanlinessRating,
        coordinationRating,
        relationship: body.relationship || 'relative',
        patientOrBedInfo: body.patientOrBedInfo?.trim() || '',
        visitorName: body.visitorName?.trim() || '',
        contactPhone: body.contactPhone?.trim() || '',
        comment: body.comment?.trim() || '',
        status: 'new',
        isDeleted: false,
      })

      const saved = await doc.save()

      return {
        data: formatFeedbackDoc(saved),
        message: 'ส่งความคิดเห็นและคะแนนการให้บริการเรียบร้อยแล้ว ขอบคุณที่ร่วมประเมิน',
        statusCode: 201,
      }
    } catch (err: any) {
      return status(500, {
        message: 'เกิดข้อผิดพลาดในการบันทึกความคิดเห็น',
        statusCode: 500,
        error: err.message,
      })
    }
  },

  async getFeedbackList({ query }: { query: any }) {
    try {
      await this.ensureSeedData()

      const filter: Record<string, any> = { isDeleted: { $ne: true } }

      if (query.status && query.status !== 'all') {
        filter.status = query.status
      }

      if (query.rating && query.rating !== 'all') {
        if (query.rating === 'low') {
          filter.overallRating = { $lte: 2 }
        } else {
          filter.overallRating = Number(query.rating)
        }
      }

      if (query.search) {
        const searchRegex = new RegExp(query.search.trim(), 'i')
        filter.$or = [
          { comment: searchRegex },
          { visitorName: searchRegex },
          { patientOrBedInfo: searchRegex },
          { contactPhone: searchRegex },
        ]
      }

      const page = Math.max(1, Number(query.page) || 1)
      const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
      const skip = (page - 1) * limit

      const [docs, totalItems] = await Promise.all([
        Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Feedback.countDocuments(filter),
      ])

      const totalPages = Math.ceil(totalItems / limit) || 1

      return {
        data: docs.map(formatFeedbackDoc),
        message: 'ดึงรายการข้อเสนอแนะสำเร็จ',
        statusCode: 200,
        pagination: {
          page,
          limit,
          totalPages,
          totalItems,
        },
      }
    } catch (err: any) {
      return status(500, {
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลความคิดเห็น',
        statusCode: 500,
        error: err.message,
      })
    }
  },

  async getFeedbackStats() {
    try {
      await this.ensureSeedData()

      const allDocs = await Feedback.find({ isDeleted: { $ne: true } }).lean()

      const totalItems = allDocs.length
      if (totalItems === 0) {
        return {
          data: {
            total: 0,
            averageOverall: 0,
            averageNurse: 0,
            averageDoctor: 0,
            averageCleanliness: 0,
            averageCoordination: 0,
            csatPercentage: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            statusCounts: { new: 0, reviewed: 0, resolved: 0 },
          },
          message: 'ดึงสถิติสำเร็จ',
          statusCode: 200,
        }
      }

      let sumOverall = 0
      let sumNurse = 0
      let sumDoctor = 0
      let sumCleanliness = 0
      let sumCoordination = 0
      let highSatisfactionCount = 0

      const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      const statusCounts: Record<string, number> = { new: 0, reviewed: 0, resolved: 0 }

      for (const item of allDocs) {
        const overall = Number(item.overallRating) || 5
        sumOverall += overall
        sumNurse += Number(item.nurseRating) || 5
        sumDoctor += Number(item.doctorRating) || 5
        sumCleanliness += Number(item.cleanlinessRating) || 5
        sumCoordination += Number(item.coordinationRating) || 5

        if (overall >= 4) {
          highSatisfactionCount++
        }

        ratingDistribution[overall] = (ratingDistribution[overall] || 0) + 1
        const st = item.status || 'new'
        statusCounts[st] = (statusCounts[st] || 0) + 1
      }

      const averageOverall = Number((sumOverall / totalItems).toFixed(1))
      const averageNurse = Number((sumNurse / totalItems).toFixed(1))
      const averageDoctor = Number((sumDoctor / totalItems).toFixed(1))
      const averageCleanliness = Number((sumCleanliness / totalItems).toFixed(1))
      const averageCoordination = Number((sumCoordination / totalItems).toFixed(1))
      const csatPercentage = Math.round((highSatisfactionCount / totalItems) * 100)

      return {
        data: {
          total: totalItems,
          averageOverall,
          averageNurse,
          averageDoctor,
          averageCleanliness,
          averageCoordination,
          csatPercentage,
          ratingDistribution,
          statusCounts,
        },
        message: 'ดึงสถิติความคิดเห็นสำเร็จ',
        statusCode: 200,
      }
    } catch (err: any) {
      return status(500, {
        message: 'เกิดข้อผิดพลาดในการคำนวณสถิติ',
        statusCode: 500,
        error: err.message,
      })
    }
  },

  async updateFeedbackStatus({ id, status: newStatus }: { id: string; status: string }) {
    try {
      const doc = await Feedback.findOneAndUpdate(
        {
          $or: [{ objectUuId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
          isDeleted: { $ne: true },
        },
        { status: newStatus },
        { new: true },
      )

      if (!doc) {
        return status(404, {
          message: 'ไม่พบรายการความคิดเห็นที่ต้องการอัปเดต',
          statusCode: 404,
        })
      }

      return {
        data: formatFeedbackDoc(doc),
        message: 'อัปเดตสถานะสำเร็จ',
        statusCode: 200,
      }
    } catch (err: any) {
      return status(500, {
        message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ',
        statusCode: 500,
        error: err.message,
      })
    }
  },

  async deleteFeedback({ id }: { id: string }) {
    try {
      const doc = await Feedback.findOneAndUpdate(
        {
          $or: [{ objectUuId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
          isDeleted: { $ne: true },
        },
        { isDeleted: true, deletedAt: new Date() },
        { new: true },
      )

      if (!doc) {
        return status(404, {
          message: 'ไม่พบรายการความคิดเห็นที่ต้องการลบ',
          statusCode: 404,
        })
      }

      return {
        message: 'ลบความคิดเห็นเรียบร้อยแล้ว',
        statusCode: 200,
      }
    } catch (err: any) {
      return status(500, {
        message: 'เกิดข้อผิดพลาดในการลบความคิดเห็น',
        statusCode: 500,
        error: err.message,
      })
    }
  },
}
