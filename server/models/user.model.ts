// models/User.ts
import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
 username: string
 firstName?: string
 lastName?: string
 passwordHash: string
 email: string
 role: 'user' | 'admin'
 ward: string
 status: 'pending' | 'active' | 'rejected'
 createdAt: Date
 updatedAt: Date
}

const UserSchema = new Schema<IUser>(
 {
  username: { type: String, required: true, unique: true },
  firstName: { type: String, default: '', trim: true },
  lastName: { type: String, default: '', trim: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  ward: { type: String, required: true, default: 'MICU3', trim: true },
  status: {
   type: String,
   enum: ['pending', 'active', 'rejected'],
   default: 'pending',
   index: true,
  },
 },
 { timestamps: true },
)

export const User =
 mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
