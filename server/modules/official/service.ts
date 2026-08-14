import { Official } from '@server/models/official.model'
import { status } from 'elysia'
import { OfficialModel } from './model'
// import { Official } from './model'

// If a class doesn't need to store a property,
// you can use an `abstract class` to avoid class allocation

export abstract class officialService {
 static async createOfficial(body: OfficialModel) {
  try {
   const checkExistingOfficial = await Official.findOne({
    fullName: body.fullName,
   })
   if (checkExistingOfficial) {
    status(409) // Created

    throw status(400, {
     error: 'Official with this name already exists',
     message: 'Official with this name already exists',
     statusCode: 409,
    })
   }
   const { id, ...dataToSave } = body
   const newOfficial = new Official(dataToSave)
   await newOfficial.save()
   status(200) // Created
   return {
    message: 'Official created successfully',
    statusCode: 200,
   }
  } catch (error: any) {
   console.log('error', error)
   if (error.statusCode) {
    throw error
   }
   throw status(400, {
    error: error.message || 'Unknown Error',
    message: 'Failed to create official',
    statusCode: 400,
   })
  }
 }
 static async getDetailOfficial({ id }: { id: string }) {
  try {
   const checkExistingOfficial = await Official.findOne({
    id: id,
   })
   if (!checkExistingOfficial) {
    throw status(404, {
     error: 'Official not found',
     message: 'ไม่พบข้อมูลผู้ปฏิบัติการ',
     statusCode: 404,
    })
   }
   status(200) // OK
   return {
    data: checkExistingOfficial,
    message: 'ดึงข้อมูลผู้ปฏิบัติการสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   status(400) // Bad Request
   return {
    error: error.message,
    message: 'ดึงข้อมูลผู้ปฏิบัติการไม่สำเร็จ',
    statusCode: 400,
   }
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

   // 🌟 1. แปลง _id จาก ObjectId ให้เป็น String ล้วนๆ เพื่อให้ตรงกับ TypeBox
   const formattedOfficials = officials.map((doc: any) => ({
    ...doc,
    _id: doc._id.toString(),
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
   // 🌟 3. ลบ status() ออกเช่นกัน ส่งแค่ Response กลับไปให้ Route จัดการต่อ
   return {
    error: error.message,
    message: 'ดึงข้อมูลผู้ปฏิบัติการไม่สำเร็จ',
    statusCode: 400,
   }
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
   const checkExistingOfficial = await Official.findOne({
    _id: id,
   })
   if (!checkExistingOfficial) {
    throw status(404, {
     error: 'Official not found',
     message: 'ไม่พบข้อมูลผู้ปฏิบัติการ',
     statusCode: 404,
    })
   }
   await Official.updateOne({ _id: id }, body)
   status(200) // OK
   return {
    message: 'อัปเดตข้อมูลผู้ปฏิบัติการสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   status(400) // Bad Request
   return {
    error: error.message,
    message: 'อัปเดตข้อมูลผู้ปฏิบัติการไม่สำเร็จ',
    statusCode: 400,
   }
  }
 }
 static async deleteOfficial({ id }: { id: string }) {
  try {
   const checkExistingOfficial = await Official.findOne({
    _id: id,
   })
   if (!checkExistingOfficial) {
    throw status(404, {
     error: 'Official not found',
     message: 'ไม่พบข้อมูลผู้ปฏิบัติการ',
     statusCode: 404,
    })
   }
   await Official.deleteOne({ _id: id })
   status(200) // OK
   return {
    message: 'ลบข้อมูลผู้ปฏิบัติการสำเร็จ',
    statusCode: 200,
   }
  } catch (error: any) {
   status(400) // Bad Request
   return {
    error: error.message,
    message: 'ลบข้อมูลผู้ปฏิบัติการไม่สำเร็จ',
    statusCode: 400,
   }
  }
 }
}
