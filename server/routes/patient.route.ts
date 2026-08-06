// server/routes/patient.route.ts
import { Elysia } from 'elysia'
import { Patient } from '../models/patient.model'

export const patientRoutes = new Elysia({ prefix: '/patients' })

 // [C] Create - เพิ่มผู้ป่วยใหม่
 .post('/', async ({ body, set }) => {
  try {
   const newPatient = new Patient(body)
   await newPatient.save()
   set.status = 201 // Created
   return newPatient
  } catch (error: any) {
   set.status = 400 // Bad Request
   return { error: error.message }
  }
 })

 // [R] Read - ดึงข้อมูลผู้ป่วยทั้งหมด
 .get('/', async () => {
  const patients = await Patient.find() // สามารถใส่ .limit() หรือ .sort() ต่อได้
  return patients
 })

 // [R] Read - ดึงข้อมูลผู้ป่วย 1 คนตาม ID (MongoDB _id)
 .get('/:id', async ({ params: { id }, set }) => {
  try {
   const patient = await Patient.findById(id)
   if (!patient) {
    set.status = 404
    return { error: 'Patient not found' }
   }
   return patient
  } catch (error) {
   set.status = 400
   return { error: 'Invalid ID format' }
  }
 })

 // [U] Update - แก้ไขข้อมูลผู้ป่วย
 .put('/:id', async ({ params: { id }, body, set }) => {
  try {
   // new: true หมายถึงให้ return ข้อมูลใหม่หลังแก้เสร็จ
   const updatedPatient = await Patient.findByIdAndUpdate(id, body as any, {
    new: true,
   })
   if (!updatedPatient) {
    set.status = 404
    return { error: 'Patient not found' }
   }
   return updatedPatient
  } catch (error: any) {
   set.status = 400
   return { error: error.message }
  }
 })

 // [D] Delete - ลบข้อมูลผู้ป่วย
 .delete('/:id', async ({ params: { id }, set }) => {
  try {
   const deletedPatient = await Patient.findByIdAndDelete(id)
   if (!deletedPatient) {
    set.status = 404
    return { error: 'Patient not found' }
   }
   return { message: 'Patient deleted successfully' }
  } catch (error) {
   set.status = 400
   return { error: 'Invalid ID format' }
  }
 })
