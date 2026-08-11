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

export type ResponseTypeBasic<T> = {
 error?: string
 message: string
 statusCode: number
 data?: T
}
