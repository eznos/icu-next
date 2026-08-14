import mongoose, { Document, Schema } from 'mongoose'
// import { OfficialSchema } from '../schemas'
import { OfficialSchema } from '@server/schemas/official.schema'
import { OfficialType } from '../types/officialType'

export interface IOfficial extends Document, OfficialType {}
const schema: Schema = new Schema(OfficialSchema)
export const Official = mongoose.model<IOfficial>('official', schema)
