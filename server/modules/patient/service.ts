import crypto from 'crypto'
import { status } from 'elysia'
import mongoose from 'mongoose'
import { CurrentUser } from '../../auth.setup'
import {
 CreatePatientInput,
 Patient,
 UpdatePatientInput,
} from './model'

export abstract class patientService {
 static async createPatient(body: CreatePatientInput, currentUser?: CurrentUser | null) {
  try {
   const existingPatient = await Patient.findOne({
    an: body.an.trim(),
    isDeleted: { $ne: true },
   })

   if (existingPatient) {
    return status(409, {
     error: 'Patient with this AN already exists',
     message: `มีหมายเลข AN ${body.an} ในระบบแล้ว`,
     statusCode: 409,
    })
   }

   const ward = body.ward || currentUser?.ward || 'MICU3'
   const objectUuId = crypto.randomUUID()
   const newPatient = new Patient({
    ...body,
    ward,
    an: body.an.trim(),
    hn: body.hn.trim(),
    objectUuId,
    admissionDate: new Date(body.admissionDate),
   })

   await newPatient.save()

   return {
    message: 'บันทึกข้อมูลผู้ป่วยสำเร็จ',
    statusCode: 200,
    referenceId: objectUuId,
   }
  } catch (error: any) {
   if (error?.code === 11000) {
    return status(409, {
     error: 'Duplicate Key',
     message: `มีหมายเลข AN ${body.an} ในระบบแล้ว`,
     statusCode: 409,
    })
   }

   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ป่วย',
    statusCode: 500,
   })
  }
 }

 static async getDetailPatient({
  id,
  currentUser,
 }: {
  id: string
  currentUser?: CurrentUser | null
 }) {
  try {
   const isObjectId = mongoose.Types.ObjectId.isValid(id)
   const idQuery = isObjectId
    ? { $or: [{ objectUuId: id }, { _id: id }] }
    : { objectUuId: id }
   const query = { ...idQuery, isDeleted: { $ne: true } }

   const patient: any = await Patient.findOne(query).lean()
   if (!patient) {
    return status(404, {
     error: 'Patient not found',
     message: 'ไม่พบข้อมูลผู้ป่วย',
     statusCode: 404,
    })
   }

   const patientWard = patient.ward || 'MICU3'
   if (
    currentUser &&
    currentUser.role !== 'admin' &&
    currentUser.ward &&
    currentUser.ward !== patientWard
   ) {
    return status(403, {
     error: 'Forbidden',
     message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ป่วยของ Ward อื่น',
     statusCode: 403,
    })
   }

   const formattedPatient = {
    ...patient,
    _id: patient._id?.toString(),
    ward: patientWard,
    admissionDate: patient.admissionDate
     ? new Date(patient.admissionDate).toISOString()
     : '',
    createdAt: patient.createdAt
     ? new Date(patient.createdAt).toISOString()
     : undefined,
    updatedAt: patient.updatedAt
     ? new Date(patient.updatedAt).toISOString()
     : undefined,
    deletedAt: patient.deletedAt
     ? new Date(patient.deletedAt).toISOString()
     : null,
   }

   return {
    data: formattedPatient,
    message: 'ดึงข้อมูลผู้ป่วยสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'ดึงข้อมูลผู้ป่วยไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async getPatientList({
  query,
  currentUser,
 }: {
  query?: {
   limit?: string
   page?: string
   searchQuery?: string
   statusFilter?: string
   ward?: string
   sortBy?: string
   order?: 'asc' | 'desc'
  }
  currentUser?: CurrentUser | null
 }) {
  const limit = Math.max(1, Number(query?.limit) || 20)
  const page = Math.max(1, Number(query?.page) || 1)
  const skip = (page - 1) * limit
  const search = query?.searchQuery?.trim() || ''
  const statusFilter = query?.statusFilter?.trim()
  const sortBy = query?.sortBy || 'admissionDate'
  const sortOrder = query?.order === 'asc' ? 1 : -1

  try {
   const andConditions: any[] = [{ isDeleted: { $ne: true } }]

   if (currentUser && currentUser.role !== 'admin') {
    const targetWard = currentUser.ward || 'MICU3'
    if (targetWard === 'MICU3') {
     andConditions.push({
      $or: [
       { ward: 'MICU3' },
       { ward: { $exists: false } },
       { ward: null },
       { ward: '' },
      ],
     })
    } else {
     andConditions.push({ ward: targetWard })
    }
   } else if (query?.ward) {
    andConditions.push({ ward: query.ward })
   }

   if (search) {
    andConditions.push({
     $or: [
      { hn: { $regex: search, $options: 'i' } },
      { an: { $regex: search, $options: 'i' } },
      { patientName: { $regex: search, $options: 'i' } },
      { diagnosis: { $regex: search, $options: 'i' } },
      { attendingDoctor: { $regex: search, $options: 'i' } },
      { hometown: { $regex: search, $options: 'i' } },
      { bedNumber: { $regex: search, $options: 'i' } },
     ],
    })
   }

   if (statusFilter && statusFilter !== 'ทุกสถานะ' && statusFilter !== 'all') {
    andConditions.push({ status: statusFilter })
   }

   const filterQuery =
    andConditions.length > 1 ? { $and: andConditions } : andConditions[0]

   const [patients, totalItems] = await Promise.all([
    Patient.find(filterQuery)
     .sort({ [sortBy]: sortOrder })
     .skip(skip)
     .limit(limit)
     .lean(),
    Patient.countDocuments(filterQuery),
   ])

   const formattedPatients = patients.map((doc: any) => ({
    ...doc,
    _id: doc._id?.toString(),
    objectUuId: doc.objectUuId || doc._id?.toString(),
    ward: doc.ward || 'MICU3',
    admissionDate: doc.admissionDate
     ? new Date(doc.admissionDate).toISOString()
     : '',
    createdAt: doc.createdAt
     ? new Date(doc.createdAt).toISOString()
     : undefined,
    updatedAt: doc.updatedAt
     ? new Date(doc.updatedAt).toISOString()
     : undefined,
    deletedAt: doc.deletedAt
     ? new Date(doc.deletedAt).toISOString()
     : null,
   }))

   return {
    data: formattedPatients,
    pagination: {
     page,
     limit,
     totalPages: Math.ceil(totalItems / limit) || 1,
     totalItems,
    },
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'ดึงรายชื่อผู้ป่วยไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async updatePatient({
  id,
  body,
  currentUser,
 }: {
  id: string
  body: UpdatePatientInput
  currentUser?: CurrentUser | null
 }) {
  try {
   const isObjectId = mongoose.Types.ObjectId.isValid(id)
   const idQuery = isObjectId
    ? { $or: [{ objectUuId: id }, { _id: id }] }
    : { objectUuId: id }
   const query = { ...idQuery, isDeleted: { $ne: true } }

   const checkExistingPatient = await Patient.findOne(query)
   if (!checkExistingPatient) {
    return status(404, {
     error: 'Patient not found',
     message: 'ไม่พบข้อมูลผู้ป่วย',
     statusCode: 404,
    })
   }

   const patientWard = checkExistingPatient.ward || 'MICU3'
   if (
    currentUser &&
    currentUser.role !== 'admin' &&
    currentUser.ward &&
    currentUser.ward !== patientWard
   ) {
    return status(403, {
     error: 'Forbidden',
     message: 'ไม่มีสิทธิ์แก้ไขข้อมูลผู้ป่วยของ Ward อื่น',
     statusCode: 403,
    })
   }

   if (body.an && body.an.trim() !== checkExistingPatient.an) {
    const duplicateAn = await Patient.findOne({
     an: body.an.trim(),
     _id: { $ne: checkExistingPatient._id },
     isDeleted: { $ne: true },
    })

    if (duplicateAn) {
     return status(409, {
      error: 'Patient with this AN already exists',
      message: `มีหมายเลข AN ${body.an} ในระบบแล้ว`,
      statusCode: 409,
     })
    }
   }

   const updatePayload: any = { ...body }
   if (body.an) updatePayload.an = body.an.trim()
   if (body.hn) updatePayload.hn = body.hn.trim()
   if (body.admissionDate) {
    updatePayload.admissionDate = new Date(body.admissionDate)
   }

   await Patient.updateOne(query, { $set: updatePayload })

   return {
    message: 'อัปเดตข้อมูลผู้ป่วยสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message || 'Bad Request',
    message: 'อัปเดตข้อมูลผู้ป่วยไม่สำเร็จ',
    statusCode: 400,
   })
  }
 }

 static async deletePatient({
  id,
  currentUser,
 }: {
  id: string
  currentUser?: CurrentUser | null
 }) {
  try {
   const isObjectId = mongoose.Types.ObjectId.isValid(id)
   const idQuery = isObjectId
    ? { $or: [{ objectUuId: id }, { _id: id }] }
    : { objectUuId: id }
   const query = { ...idQuery, isDeleted: { $ne: true } }

   const checkExistingPatient = await Patient.findOne(query)
   if (!checkExistingPatient) {
    return status(404, {
     error: 'Patient not found',
     message: 'ไม่พบข้อมูลผู้ป่วย',
     statusCode: 404,
    })
   }

   const patientWard = checkExistingPatient.ward || 'MICU3'
   if (
    currentUser &&
    currentUser.role !== 'admin' &&
    currentUser.ward &&
    currentUser.ward !== patientWard
   ) {
    return status(403, {
     error: 'Forbidden',
     message: 'ไม่มีสิทธิ์ลบข้อมูลผู้ป่วยของ Ward อื่น',
     statusCode: 403,
    })
   }

   await Patient.updateOne(query, {
    $set: {
     isDeleted: true,
     deletedAt: new Date(),
    },
   })

   return {
    message: 'ลบข้อมูลผู้ป่วยสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message,
    message: 'ลบข้อมูลผู้ป่วยไม่สำเร็จ',
    statusCode: 400,
   })
  }
 }
}
