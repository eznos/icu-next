import mongoose, { Document, Schema } from 'mongoose'
import { t } from 'elysia'

export interface IFeedback extends Document {
  objectUuId: string
  overallRating: number
  nurseRating: number
  doctorRating: number
  cleanlinessRating: number
  coordinationRating: number
  relationship: string
  patientOrBedInfo: string
  visitorName: string
  contactPhone: string
  comment: string
  status: 'new' | 'reviewed' | 'resolved'
  isDeleted: boolean
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    objectUuId: { type: String, required: true, unique: true },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    nurseRating: { type: Number, default: 5, min: 1, max: 5 },
    doctorRating: { type: Number, default: 5, min: 1, max: 5 },
    cleanlinessRating: { type: Number, default: 5, min: 1, max: 5 },
    coordinationRating: { type: Number, default: 5, min: 1, max: 5 },
    relationship: { type: String, default: 'relative', trim: true },
    patientOrBedInfo: { type: String, default: '', trim: true },
    visitorName: { type: String, default: '', trim: true },
    contactPhone: { type: String, default: '', trim: true },
    comment: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'resolved'],
      default: 'new',
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
)

export const Feedback =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema)

export const ResponseFeedbackSchema = {
  basicResponse: t.Object({
    message: t.String(),
    statusCode: t.Number(),
    error: t.Optional(t.String()),
  }),
  detailResponse: t.Object({
    data: t.Any(),
    message: t.String(),
    statusCode: t.Number(),
  }),
  listResponse: t.Object({
    data: t.Array(t.Any()),
    message: t.String(),
    statusCode: t.Number(),
    pagination: t.Optional(
      t.Object({
        page: t.Number(),
        limit: t.Number(),
        totalPages: t.Number(),
        totalItems: t.Number(),
      }),
    ),
  }),
  statsResponse: t.Object({
    data: t.Any(),
    message: t.String(),
    statusCode: t.Number(),
  }),
}
