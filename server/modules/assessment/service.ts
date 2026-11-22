import crypto from 'crypto'
import dayjs from 'dayjs'
import { status } from 'elysia'
import mongoose from 'mongoose'
import { CurrentUser } from '../../auth.setup'
import { User } from '../../models/user.model'
import { Patient } from '../patient/model'
import { wardService } from '../ward/service'
import {
 CreateDailyAssessmentInput,
 DailyAssessment,
} from './model'

async function resolveStaffNames(assessments: any[]) {
 const recordedByIds = [...new Set(assessments.map((a) => a.recordedBy).filter(Boolean))]
 const userMap = new Map<string, string>()

 if (recordedByIds.length > 0) {
  const validObjectIds = recordedByIds.filter((id) => mongoose.isValidObjectId(id))
  const users = await User.find({
   $or: [
    { _id: { $in: validObjectIds } },
    { username: { $in: recordedByIds } },
   ],
  }).lean()

  for (const u of users) {
   const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || 'Staff'
   userMap.set(String(u._id), fullName)
   userMap.set(u.username, fullName)
  }
 }

 return assessments.map((a) => {
  const resolvedName = userMap.get(a.recordedBy) || a.recordedByName || a.recordedBy || 'Staff'
  return {
   ...a,
   recordedBy: resolvedName,
   recordedByName: resolvedName,
  }
 })
}

export abstract class assessmentService {
 static async saveAssessment(
  body: CreateDailyAssessmentInput,
  currentUser?: CurrentUser | null,
 ) {
  try {
   const ward = body.ward || currentUser?.ward || 'MICU3'
   const recordDate = body.recordDate || dayjs().format('YYYY-MM-DDTHH:mm')

   let recordedByName = 'Staff'
   if (currentUser) {
    const parts = [currentUser.firstName, currentUser.lastName].filter(Boolean)
    if (parts.length > 0) {
     recordedByName = parts.join(' ')
    } else if (currentUser.username) {
     recordedByName = currentUser.username
    } else if (currentUser.id && mongoose.isValidObjectId(currentUser.id)) {
     const dbUser: any = await User.findById(currentUser.id).lean()
     if (dbUser) {
      recordedByName = [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ') || dbUser.username || 'Staff'
     }
    }
   }

   let existing = null
   if (body.objectUuId) {
    existing = await DailyAssessment.findOne({ objectUuId: body.objectUuId })
   }

   if (existing) {
    existing.recordDate = recordDate
    existing.hasVentilator = Boolean(body.hasVentilator)
    existing.hasCentralLine = Boolean(body.hasCentralLine)
    existing.hasFoleyCatheter = Boolean(body.hasFoleyCatheter)
    existing.hasVap = Boolean(body.hasVap)
    existing.hasClabsi = Boolean(body.hasClabsi)
    existing.hasCauti = Boolean(body.hasCauti)
    existing.unplannedExtubation = Number(body.unplannedExtubation) || 0
    existing.pressureInjuryStage = body.pressureInjuryStage || 'none'
    existing.medicationErrorGradeEUp = Number(body.medicationErrorGradeEUp) || 0
    existing.note = body.note || ''
    existing.recordedBy = recordedByName
    existing.recordedByName = recordedByName
    existing.bedNumber = body.bedNumber
    existing.patientName = body.patientName
    await existing.save()

    return {
     message: 'อัปเดตข้อมูลประเมินเตียงสำเร็จ',
     statusCode: 200,
     referenceId: existing.objectUuId,
     data: existing,
    }
   }

   const objectUuId = crypto.randomUUID()
   const newDoc = new DailyAssessment({
    ...body,
    ward,
    recordDate,
    objectUuId,
    recordedBy: recordedByName,
    recordedByName,
    an: body.an.trim(),
    hn: body.hn.trim(),
   })

   await newDoc.save()

   return {
    message: 'บันทึกการประเมินรอบใหม่สำเร็จ',
    statusCode: 200,
    referenceId: objectUuId,
    data: newDoc,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'บันทึกข้อมูลประเมินเตียงไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async getTodayWardAssessments({
  ward = 'MICU3',
  date,
 }: {
  ward?: string
  date?: string
 }) {
  try {
   const targetDate = date || dayjs().format('YYYY-MM-DD')
   const rawAssessments = await DailyAssessment.find({
    ward: ward.toUpperCase(),
    recordDate: { $regex: `^${targetDate}` },
   })
    .sort({ recordDate: -1 })
    .lean()

   const assessments = await resolveStaffNames(rawAssessments)

   return {
    data: assessments,
    message: 'ดึงข้อมูลประเมินประจำวันสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'ดึงข้อมูลประเมินประจำวันไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async getBedAssessmentStatus({
  ward = 'MICU3',
  date,
 }: {
  ward?: string
  date?: string
 }) {
  try {
   const targetDate = date || dayjs().format('YYYY-MM-DD')
   const cleanWard = (ward || 'MICU3').trim().toUpperCase()
   const wardQuery: any = { isDeleted: { $ne: true }, status: 'admitted' }
   if (cleanWard === 'MICU3') {
    wardQuery.$or = [
     { ward: 'MICU3' },
     { ward: { $exists: false } },
     { ward: null },
     { ward: '' },
    ]
   } else {
    wardQuery.ward = cleanWard
   }

   const [activePatients, rawAssessments] = await Promise.all([
    Patient.find(wardQuery).lean(),
    DailyAssessment.find({
     ward: cleanWard,
     recordDate: { $regex: `^${targetDate}` },
    })
     .sort({ recordDate: -1 })
     .lean(),
   ])

   const assessments = await resolveStaffNames(rawAssessments)

   const patientMap = new Map()
   for (const p of activePatients) {
    patientMap.set(p.bedNumber, p)
   }

   const assessmentMap = new Map<string, any[]>()
   for (const a of assessments) {
    const list = assessmentMap.get(a.an) || []
    list.push(a)
    assessmentMap.set(a.an, list)
   }

   const wardInfo = await wardService.getWardByCode(cleanWard)
   const totalBedsCount = wardInfo.totalBeds ?? 10

   const beds = []
   let occupiedBedsCount = 0
   let checkedBedsCount = 0

   for (let i = 1; i <= totalBedsCount; i++) {
    const bedName = `เตียงที่ ${i}`
    const patient = patientMap.get(bedName)
    const isOccupied = Boolean(patient)

    if (isOccupied) {
     occupiedBedsCount++
     const patientChecks = assessmentMap.get(patient.an) || []
     const checkCount = patientChecks.length
     const isChecked = checkCount > 0
     if (isChecked) checkedBedsCount++

     beds.push({
      bedIndex: i,
      bedNumber: bedName,
      status: 'Occupied' as const,
      patient: {
       patientId: patient.objectUuId || patient._id?.toString(),
       an: patient.an,
       hn: patient.hn,
       patientName: patient.patientName,
       diagnosis: patient.diagnosis,
       admissionDate: patient.admissionDate,
      },
      isAssessed: isChecked,
      checkCount,
      latestCheck: patientChecks[0] || null,
      checks: patientChecks,
     })
    } else {
     beds.push({
      bedIndex: i,
      bedNumber: bedName,
      status: 'Available' as const,
      patient: null,
      isAssessed: false,
      checkCount: 0,
      latestCheck: null,
      checks: [],
     })
    }
   }

   return {
    data: {
     date: targetDate,
     ward: cleanWard,
     totalBeds: totalBedsCount,
     occupiedBedsCount,
     checkedBedsCount,
     pendingBedsCount: occupiedBedsCount - checkedBedsCount,
     beds,
    },
    message: 'ดึงสถานะการประเมินเตียงสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'ดึงสถานะการประเมินเตียงไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async getPatientAssessmentHistory(patientIdentifier: string) {
  try {
   const assessments = await DailyAssessment.find({
    $or: [{ patientId: patientIdentifier }, { an: patientIdentifier }],
   })
    .sort({ recordDate: -1 })
    .lean()

   return {
    data: assessments,
    message: 'ดึงประวัติการประเมินสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'ดึงประวัติการประเมินไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async deleteAssessment(id: string) {
  try {
   await DailyAssessment.deleteOne({
    $or: [{ objectUuId: id }, { _id: id }],
   })
   return {
    message: 'ลบข้อมูลประเมินสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'ลบข้อมูลประเมินไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }
}
