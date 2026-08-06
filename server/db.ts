// server/db.ts
import mongoose from 'mongoose'

// export const connectDB = async () => {
//  try {
//   // เปลี่ยน URL ให้เป็นของ MongoDB ของคุณ (เช่น MongoDB Atlas หรือ Local)
//   const MONGODB_URI =
//    'mongodb+srv://baigho123_db_user:kDX4fAhDeyMBGyLX@icu-next-db.rfevjo6.mongodb.net/sample_mflix?retryWrites=true&w=majority'

//   await mongoose.connect(MONGODB_URI)
//   console.log('✅ MongoDB Connected Successfully')
//  } catch (error) {
//   console.error('❌ MongoDB Connection Error:', error)
//   process.exit(1) // ปิดแอปถ้าต่อ DB ไม่สำเร็จ
//  }

// }
let isConnected = false
export const connectDB = async () => {
 if (isConnected) {
  return // ถ้าต่อแล้ว ไม่ต้องต่อซ้ำ
 }

 try {
  const MONGODB_URI = process.env.MONGODB_URI
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined')

  const db = await mongoose.connect(MONGODB_URI)
  isConnected = db.connections[0].readyState === 1
  console.log('✅ MongoDB Connected Successfully')
 } catch (error) {
  console.error('❌ MongoDB Connection Error:', error)
 }
}
