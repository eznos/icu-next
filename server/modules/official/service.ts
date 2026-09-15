// import { OfficialModel } from './model'
import crypto from 'crypto'
import { status } from 'elysia'
import mongoose, { Document, Schema } from 'mongoose'
import { OfficialModel } from './model'

import { OfficialSchemaX } from './model'

type xx = {
 objectUuId: string
 fullName: string
 age: number
 gender: 'ชาย' | 'หญิง' | 'อื่นๆ'
 position: string
 competencyLevel:
  | 'Novice'
  | 'Advanced Beginner'
  | 'Competent'
  | 'Proficient'
  | 'Expert'
 licenseNumber: string
 licenseExpiryDate: Date
 phoneNumber: string
 licenseDocumentUrl: string // เก็บ URL ของไฟล์ PDF
 createdAt: Date
 updatedAt: Date
}

export interface IOfficial extends Document, xx {}
const schema: Schema = OfficialSchemaX
export const Official = mongoose.model<IOfficial>('official', schema)

export abstract class officialService {
 static async createOfficial(body: OfficialModel) {
  try {
   const checkExistingOfficial = await Official.findOne({
    fullName: body.fullName,
   })
   console.log('body', body)
   // 1. Error ที่เราตั้งใจดัก (Business Logic)
   if (checkExistingOfficial) {
    throw status(409, {
     error: 'Official with this name already exists',
     message: 'มีชื่อเจ้าหน้าที่นี้ในระบบแล้ว',
     statusCode: 409,
    })
   }

   if (!body.fullName || !body.position) {
    throw status(400, {
     error: 'Missing required fields',
     message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
     statusCode: 400,
    })
   }

   const objectUuId = crypto.randomUUID()
   const { objectUuId: _clientObjectUuId, ...dataToSave } = body

   // 2. บันทึกข้อมูล โดยปล่อยให้ MongoDB สร้าง _id (ObjectId) เอง
   const newOfficial = new Official({
    objectUuId,
    ...dataToSave,
   })
   await newOfficial.save()

   return {
    message: 'Official created successfully',
    statusCode: 200,
    referenceId: objectUuId,
   }
  } catch (error: any) {
   // 🌟 3. เช็คว่าถ้าเป็น Error ที่เราจงใจโยนเอง (มี statusCode) ให้โยนผ่านไปเลย
   if (error.code === 409) {
    throw status(409, {
     error: 'Official with this name already exists',
     message: 'มีชื่อเจ้าหน้าที่นี้ในระบบแล้ว',
     statusCode: 409,
    })
   }

   console.log('error', error)
   throw status(500, {
    error: error.message || 'Internal Server Error',
    message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล',
    statusCode: 500,
   })
  }
 }

 static async getDetailOfficial({ id }: { id: string }) {
  try {
   const isObjectId = mongoose.Types.ObjectId.isValid(id)
   const query = isObjectId
    ? { $or: [{ objectUuId: id }, { _id: id }] }
    : { objectUuId: id }

   const checkExistingOfficial = await Official.findOne(query).lean()
   if (!checkExistingOfficial) {
    return status(404, {
     error: 'Official not found',
     message: 'ไม่พบข้อมูลผู้ปฏิบัติการ',
     statusCode: 404,
    })
   }

   const formattedOfficial = {
    ...checkExistingOfficial,
    _id: checkExistingOfficial._id?.toString(),
    licenseExpiryDate: checkExistingOfficial.licenseExpiryDate
     ? new Date(checkExistingOfficial.licenseExpiryDate).toISOString()
     : undefined,
    createdAt: checkExistingOfficial.createdAt
     ? new Date(checkExistingOfficial.createdAt).toISOString()
     : undefined,
    updatedAt: checkExistingOfficial.updatedAt
     ? new Date(checkExistingOfficial.updatedAt).toISOString()
     : undefined,
   }

   return {
    data: formattedOfficial,
    message: 'ดึงข้อมูลผู้ปฏิบัติการสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(500, {
    error: error.message || 'Internal Server Error',
    message: 'ดึงข้อมูลผู้ปฏิบัติการไม่สำเร็จ',
    statusCode: 500,
   })
  }
 }

 static async getOfficialList({
  query,
 }: {
  query?: {
   limit?: string
   page?: string
   search?: string
   order?: 'asc' | 'desc'
  }
 }) {
  const limit = Number(query?.limit) || 20
  const page = Number(query?.page) || 1
  const search = query?.search || ''
  const skip = (page - 1) * limit
  const order = query?.order === 'asc' ? 1 : -1

  try {
   const filterQuery = search
    ? {
       $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
       ],
      }
    : {}

   const officials = await Official.find(filterQuery)
    .sort({ fullName: order })
    .skip(skip)
    .limit(limit)
    .lean()

   const totalItems = await Official.countDocuments(filterQuery)

   // 🌟 1. แปลง _id และ Date ให้เป็น String เพื่อให้ผ่าน TypeBox Response Validation
   const formattedOfficials = officials.map((doc: any) => ({
    ...doc,
    _id: doc._id?.toString(),
    licenseExpiryDate: doc.licenseExpiryDate
     ? new Date(doc.licenseExpiryDate).toISOString()
     : undefined,
    createdAt: doc.createdAt
     ? new Date(doc.createdAt).toISOString()
     : undefined,
    updatedAt: doc.updatedAt
     ? new Date(doc.updatedAt).toISOString()
     : undefined,
   }))

   // 🌟 2. ลบ status() ออก แล้ว return ค่ากลับไปตรงๆ
   return {
    data: formattedOfficials,
    pagination: {
     page: page,
     limit: limit,
     totalPages: Math.ceil(totalItems / limit),
     totalItems: totalItems,
    },
    statusCode: 200,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message,
    message: 'ดึงข้อมูลผู้ปฏิบัติการไม่สำเร็จ',
    statusCode: 400,
   })
  }
 }

 static async updateOfficial({
  id,
  body,
 }: {
  id: string
  body: OfficialModel
 }) {
  try {
   const isObjectId = mongoose.Types.ObjectId.isValid(id)
   const query = isObjectId
    ? { $or: [{ objectUuId: id }, { _id: id }] }
    : { objectUuId: id }

   const checkExistingOfficial = await Official.findOne(query)
   if (!checkExistingOfficial) {
    return status(404, {
     error: 'Official not found',
     message: 'ไม่พบข้อมูลผู้ปฏิบัติการ',
     statusCode: 404,
    })
   }
   await Official.updateOne(query, body)
   return {
    message: 'อัปเดตข้อมูลผู้ปฏิบัติการสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message,
    message: 'อัปเดตข้อมูลผู้ปฏิบัติการไม่สำเร็จ',
    statusCode: 400,
   })
  }
 }

 static async deleteOfficial({ id }: { id: string }) {
  try {
   const isObjectId = mongoose.Types.ObjectId.isValid(id)
   const query = isObjectId
    ? { $or: [{ objectUuId: id }, { _id: id }] }
    : { objectUuId: id }

   const checkExistingOfficial = await Official.findOne(query)
   if (!checkExistingOfficial) {
    return status(404, {
     error: 'Official not found',
     message: 'ไม่พบข้อมูลผู้ปฏิบัติการ',
     statusCode: 404,
    })
   }
   await Official.deleteOne(query)
   return {
    message: 'ลบข้อมูลผู้ปฏิบัติการสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   return status(400, {
    error: error.message,
    message: 'ลบข้อมูลผู้ปฏิบัติการไม่สำเร็จ',
    statusCode: 400,
   })
  }
 }
}
