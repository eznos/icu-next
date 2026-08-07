import mongoose, { Document, Schema } from 'mongoose'
import { MoviesType } from '../types'

// 1. สร้าง Interface สำหรับ TypeScript (ถ้าคุณใช้ TypeScript)
export interface IMovie extends Document, MoviesType {}

// 2. สร้าง Mongoose Schema
const MovieSchema = new Schema<IMovie>(
 {
  plot: { type: String },
  genres: [{ type: String }],
  runtime: { type: Number },
  cast: [{ type: String }],
  poster: { type: String },
  title: { type: String, required: true },
  fullplot: { type: String },
  languages: [{ type: String }],
  released: { type: Date }, // แปลงจาก Extended JSON $date ให้เป็น Date ปกติ
  directors: [{ type: String }],
  rated: { type: String },
  awards: {
   wins: { type: Number },
   nominations: { type: Number },
   text: { type: String },
  },
  lastupdated: { type: String },
  year: { type: Number },
  imdb: {
   rating: { type: Number },
   votes: { type: Number },
   id: { type: Number },
  },
  countries: [{ type: String }],
  type: { type: String },
  tomatoes: {
   viewer: {
    rating: { type: Number },
    numReviews: { type: Number },
    meter: { type: Number },
   },
   fresh: { type: Number },
   critic: {
    rating: { type: Number },
    numReviews: { type: Number },
    meter: { type: Number },
   },
   rotten: { type: Number },
   lastUpdated: { type: Date }, // แปลงจาก Extended JSON $date เป็น Date
  },
  num_mflix_comments: { type: Number, default: 0 },
 },
 {
  timestamps: true,
  toJSON: {
   virtuals: true,
   versionKey: false,
   transform: function (doc, ret) {
    ret.objectId = ret._id.toString()
    delete ret._id // ลบ _id ตัวเก่าออก (เพราะระบบจะสร้าง id ให้จาก virtuals แล้ว)
   },
  },
  toObject: {
   virtuals: true,
   versionKey: false,
  },
 },
)

// 3. Export Model
export const Movie =
 (mongoose.models.movies as mongoose.Model<IMovie>) ||
 mongoose.model<IMovie>('movies', MovieSchema)
