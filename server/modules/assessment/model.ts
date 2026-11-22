import { Static, t } from 'elysia'
import mongoose, { Document, Schema } from 'mongoose'

export const PressureInjuryStageSchema = t.Union([
 t.Literal('none'),
 t.Literal('stage2'),
 t.Literal('stage3'),
 t.Literal('stage4'),
 t.Literal('unstageable'),
])

export const DailyAssessmentSchema = t.Object({
 _id: t.Optional(t.String()),
 objectUuId: t.Optional(t.String({ format: 'uuid' })),
 patientId: t.String(),
 an: t.String(),
 hn: t.String(),
 patientName: t.String(),
 bedNumber: t.String(),
 ward: t.String({ default: 'MICU3' }),
 recordDate: t.String({ description: 'วันที่บันทึก รูปแบบ YYYY-MM-DD' }),
 hasVentilator: t.Boolean({ default: false }),
 hasCentralLine: t.Boolean({ default: false }),
 hasFoleyCatheter: t.Boolean({ default: false }),
 hasVap: t.Boolean({ default: false }),
 hasClabsi: t.Boolean({ default: false }),
 hasCauti: t.Boolean({ default: false }),
 unplannedExtubation: t.Number({ default: 0 }),
 pressureInjuryStage: PressureInjuryStageSchema,
 medicationErrorGradeEUp: t.Number({ default: 0 }),
 note: t.Optional(t.String()),
 recordedBy: t.Optional(t.String()),
 recordedByName: t.Optional(t.String()),
 createdAt: t.Optional(t.String({ format: 'date-time' })),
 updatedAt: t.Optional(t.String({ format: 'date-time' })),
})

export const CreateDailyAssessmentBody = t.Object({
 objectUuId: t.Optional(t.String()),
 patientId: t.String(),
 an: t.String(),
 hn: t.String(),
 patientName: t.String(),
 bedNumber: t.String(),
 ward: t.Optional(t.String({ default: 'MICU3' })),
 recordDate: t.String(),
 hasVentilator: t.Boolean({ default: false }),
 hasCentralLine: t.Boolean({ default: false }),
 hasFoleyCatheter: t.Boolean({ default: false }),
 hasVap: t.Optional(t.Boolean({ default: false })),
 hasClabsi: t.Optional(t.Boolean({ default: false })),
 hasCauti: t.Optional(t.Boolean({ default: false })),
 unplannedExtubation: t.Optional(t.Number({ default: 0 })),
 pressureInjuryStage: t.Optional(PressureInjuryStageSchema),
 medicationErrorGradeEUp: t.Optional(t.Number({ default: 0 })),
 note: t.Optional(t.String()),
})

export type DailyAssessmentType = Static<typeof DailyAssessmentSchema>
export type CreateDailyAssessmentInput = Static<typeof CreateDailyAssessmentBody>

export interface IDailyAssessmentDocument extends Document {
 objectUuId: string
 patientId: string
 an: string
 hn: string
 patientName: string
 bedNumber: string
 ward: string
 recordDate: string
 hasVentilator: boolean
 hasCentralLine: boolean
 hasFoleyCatheter: boolean
 hasVap: boolean
 hasClabsi: boolean
 hasCauti: boolean
 unplannedExtubation: number
 pressureInjuryStage: 'none' | 'stage2' | 'stage3' | 'stage4' | 'unstageable'
 medicationErrorGradeEUp: number
 note?: string
 recordedBy?: string
 recordedByName?: string
 createdAt: Date
 updatedAt: Date
}

export const DailyAssessmentMongooseSchema = new Schema<IDailyAssessmentDocument>(
 {
  objectUuId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true, index: true },
  an: { type: String, required: true, index: true },
  hn: { type: String, required: true },
  patientName: { type: String, required: true },
  bedNumber: { type: String, required: true },
  ward: { type: String, required: true, default: 'MICU3', index: true },
  recordDate: { type: String, required: true, index: true },
  hasVentilator: { type: Boolean, default: false },
  hasCentralLine: { type: Boolean, default: false },
  hasFoleyCatheter: { type: Boolean, default: false },
  hasVap: { type: Boolean, default: false },
  hasClabsi: { type: Boolean, default: false },
  hasCauti: { type: Boolean, default: false },
  unplannedExtubation: { type: Number, default: 0 },
  pressureInjuryStage: {
   type: String,
   enum: ['none', 'stage2', 'stage3', 'stage4', 'unstageable'],
   default: 'none',
  },
  medicationErrorGradeEUp: { type: Number, default: 0 },
  note: { type: String, default: '' },
  recordedBy: { type: String, default: '' },
  recordedByName: { type: String, default: '' },
 },
 { timestamps: true },
)

DailyAssessmentMongooseSchema.index({ an: 1, recordDate: -1 })
DailyAssessmentMongooseSchema.index({ ward: 1, recordDate: -1 })

export const DailyAssessment =
 (mongoose.models.DailyAssessment as mongoose.Model<IDailyAssessmentDocument>) ||
 mongoose.model<IDailyAssessmentDocument>('DailyAssessment', DailyAssessmentMongooseSchema)
