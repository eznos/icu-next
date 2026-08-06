// server/models/patient.model.ts
import mongoose, { Document, Schema } from 'mongoose'

// 1. สร้าง Type สำหรับ TypeScript
export interface IPatient extends Document {
 hn: string
 name: string
 status: 'Available' | 'Occupied'
 bedId?: string
}

// 2. สร้าง Schema สำหรับ MongoDB
const PatientSchema = new Schema(
 {
  hn: { type: String, required: true, unique: true }, // รหัสผู้ป่วย (ห้ามซ้ำ)
  name: { type: String, required: true },
  status: {
   type: String,
   enum: ['Available', 'Occupied'],
   default: 'Occupied',
  },
  bedId: { type: String, required: false },
 },
 { timestamps: true }, // จะสร้าง createdAt และ updatedAt ให้อัตโนมัติ
)

// 3. Export Model ไปใช้งาน
export const Patient = mongoose.model<IPatient>('Patient', PatientSchema)
