// models/User.ts
import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
 username: string
 passwordHash: string
 email: string
 role: 'user' | 'admin'
}

const UserSchema = new Schema<IUser>(
 {
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
 },
 { timestamps: true },
)

export const User =
 mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
