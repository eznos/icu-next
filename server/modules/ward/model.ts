import mongoose, { Document, Schema } from 'mongoose'
import { t } from 'elysia'

export interface IWard extends Document {
 code: string
 name: string
 description?: string
 totalBeds: number
 targetMonthlyAdmissions: number
 isActive: boolean
 createdAt: Date
 updatedAt: Date
}

export const WardSchema = new Schema<IWard>(
 {
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  totalBeds: { type: Number, default: 10 },
  targetMonthlyAdmissions: { type: Number, default: 18 },
  isActive: { type: Boolean, default: true },
 },
 { timestamps: true },
)

export const Ward = mongoose.models.Ward || mongoose.model<IWard>('Ward', WardSchema)

export const WardItemSchema = t.Object({
 _id: t.Optional(t.String()),
 code: t.String(),
 name: t.String(),
 description: t.Optional(t.String()),
 totalBeds: t.Optional(t.Number()),
 targetMonthlyAdmissions: t.Optional(t.Number()),
 isActive: t.Boolean(),
})
