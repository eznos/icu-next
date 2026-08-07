import mongoose, { Document } from 'mongoose'
import { OfficialSchema } from '../schemas'
import { OfficialType } from '../types/officialType'

export interface IOfficial extends Document, OfficialType {}

export const Official =
 mongoose.models.Official ||
 mongoose.model<IOfficial>('official', OfficialSchema)
