export type BaseResponseType<T> = {
 data: T
 pagination?: {
  page: number
  limit: number
  totalPages: number
  totalItems: number
 }
 statusCode: number
}
