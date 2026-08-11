// server/db.ts
import mongoose from 'mongoose'

let isConnected = false
export const connectDB = async () => {
 if (isConnected) {
  return
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
