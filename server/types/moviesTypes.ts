import { BaseResponseType } from './baseType'

export type MoviesType = {
 objectId: string
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

export type MoviesResponseType = BaseResponseType<MoviesType[]>
