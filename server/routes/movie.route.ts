// server/routes/patient.route.ts
import { Elysia } from 'elysia'
import { Movie } from '../models'

export const movieRoutes = new Elysia({ prefix: '/movies' })

 // [R] Read - ดึงข้อมูลหนัง (แบบปรับปรุงเพื่อประสิทธิภาพ)
 .get('/', async ({ query, set }) => {
  try {
   // 1. รับค่าและแปลงเป็นตัวเลข (ดักกรณีถ้ามีคนส่งตัวอักษรมั่วๆ มา ให้เป็น 20)
   const limit = Number(query.limit) || 20
   const page = Number(query.page) || 1 // เพิ่มรับค่า page เผื่อไว้ทำ Pagination จริงๆ
   const skip = (page - 1) * limit

   // 2. ดึงข้อมูลจาก Database
   const movies = await Movie.find().sort({ year: -1 }).skip(skip).limit(limit)

   const totalItems = await Movie.countDocuments()

   // 3. ส่งข้อมูลกลับเมื่อสำเร็จ (กรณีสำเร็จ Elysia จะให้ Status 200 อัตโนมัติ)
   return {
    data: movies,
    pagination: {
     page: page,
     limit: limit,
     totalPages: Math.ceil(totalItems / limit), // คำนวณจำนวนหน้าจริงๆ
     totalItems: totalItems,
    },
    statusCode: 200,
   }
  } catch (error: any) {
   // 🚨 4. จัดการ Error ตรงนี้
   console.error('Error fetching movies:', error)

   // ตั้งค่า HTTP Status ให้เป็น 500 (Server Error)
   set.status = 500

   // คืนค่ารูปแบบ Error ที่หน้าตาเหมือนกัน เพื่อให้ Frontend เอาไปจัดการต่อง่ายๆ
   return {
    error: 'เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล',
    message: error.message,
    statusCode: 500,
   }
  }
 })
 // [R] Read - ดึงข้อมูลหนัง 1 เรื่องตาม ID (โค้ดเดิมของคุณดีอยู่แล้วครับ)
 .get('/:id', async ({ params: { id }, set }) => {
  try {
   const movie = await Movie.findById(id)
   if (!movie) {
    set.status = 404
    return { error: 'Movie not found' }
   }
   return movie
  } catch (error) {
   set.status = 400
   return { error: 'Invalid ID format' }
  }
 })
//  // [U] Update - แก้ไขข้อมูลผู้ป่วย
//  .put('/:id', async ({ params: { id }, body, set }) => {
//   try {
//    // new: true หมายถึงให้ return ข้อมูลใหม่หลังแก้เสร็จ
//    const updatedPatient = await Patient.findByIdAndUpdate(id, body as any, {
//     new: true,
//    })
//    if (!updatedPatient) {
//     set.status = 404
//     return { error: 'Patient not found' }
//    }
//    return updatedPatient
//   } catch (error: any) {
//    set.status = 400
//    return { error: error.message }
//   }
//  })

//  // [D] Delete - ลบข้อมูลผู้ป่วย
//  .delete('/:id', async ({ params: { id }, set }) => {
//   try {
//    const deletedPatient = await Patient.findByIdAndDelete(id)
//    if (!deletedPatient) {
//     set.status = 404
//     return { error: 'Patient not found' }
//    }
//    return { message: 'Patient deleted successfully' }
//   } catch (error) {
//    set.status = 400
//    return { error: 'Invalid ID format' }
//   }
//  })
