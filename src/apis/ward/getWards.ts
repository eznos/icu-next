import { ResponseTypeBasic } from '@server/types'
import useSWR from 'swr'

export type WardType = {
 _id?: string
 code: string
 name: string
 description?: string
 isActive: boolean
}

export async function getWardList(): Promise<ResponseTypeBasic<WardType[]>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/ward`, {
  method: 'GET',
  headers: {
   'Content-Type': 'application/json',
   Accept: 'application/json',
  },
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw {
   message: errorData.message || 'ดึงรายชื่อ Ward ไม่สำเร็จ',
   statusCode: response.status,
  }
 }

 return response.json()
}

export function useWardList() {
 return useSWR('wards-list', getWardList)
}
