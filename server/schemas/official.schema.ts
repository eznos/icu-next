import { Schema } from 'mongoose'

export const OfficialSchema: Schema = new Schema(
 {
  fullName: {
   type: String,
   required: [true, 'กรุณาระบุชื่อจริง-นามสกุล'],
   trim: true,
  },
  age: {
   type: Number,
   required: [true, 'กรุณาระบุอายุ'],
   min: [18, 'อายุต้องไม่ต่ำกว่า 18 ปี'],
  },
  gender: {
   type: String,
   required: [true, 'กรุณาระบุเพศ'],
   enum: ['ชาย', 'หญิง', 'อื่นๆ'], // ปรับตาม Dropdown ที่มีในระบบ
  },
  position: {
   type: String,
   required: [true, 'กรุณาระบุตำแหน่ง'],
  },
  competencyLevel: {
   type: String,
   required: [true, 'กรุณาระบุระดับสมรรถนะ'],
   enum: ['Novice', 'Advanced Beginner', 'Competent', 'Proficient', 'Expert'],
  },
  licenseNumber: {
   type: String,
   required: [true, 'กรุณาระบุเลขที่ใบอนุญาต'],
   trim: true,
  },
  licenseExpiryDate: {
   type: Date,
   required: [true, 'กรุณาระบุวันหมดอายุใบอนุญาต'],
  },
  phoneNumber: {
   type: String,
   required: [true, 'กรุณาระบุเบอร์โทรศัพท์'],
   trim: true,
  },
  licenseDocumentUrl: {
   type: String,
   required: [true, 'กรุณาอัปโหลดไฟล์ PDF หลักฐาน'],
  },
 },
 {
  timestamps: true,
 },
)
