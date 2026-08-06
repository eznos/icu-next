import mongoose, { Document, Schema } from 'mongoose'

// 1. สร้าง Interface สำหรับ TypeScript (ถ้าคุณใช้ TypeScript)
export interface IMovie extends Document {
 plot?: string
 genres?: string[]
 runtime?: number
 cast?: string[]
 poster?: string
 title: string
 fullplot?: string
 languages?: string[]
 released?: Date
 directors?: string[]
 rated?: string
 awards?: {
  wins?: number
  nominations?: number
  text?: string
 }
 lastupdated?: string // หรือจะใช้ Date ก็ได้ขึ้นอยู่กับการจัดการในระบบคุณ
 year?: number
 imdb?: {
  rating?: number
  votes?: number
  id?: number
 }
 countries?: string[]
 type?: string
 tomatoes?: {
  viewer?: {
   rating?: number
   numReviews?: number
   meter?: number
  }
  fresh?: number
  critic?: {
   rating?: number
   numReviews?: number
   meter?: number
  }
  rotten?: number
  lastUpdated?: Date
 }
 num_mflix_comments?: number
}

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
  timestamps: true, // เพิ่ม createdAt และ updatedAt ให้อัตโนมัติ (ถ้าต้องการ)
 },
)

// 3. Export Model
export const Movie =
 (mongoose.models.movies as mongoose.Model<IMovie>) ||
 mongoose.model<IMovie>('movies', MovieSchema)
