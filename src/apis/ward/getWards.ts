import { ResponseTypeBasic } from '@server/types'
import useSWR from 'swr'
import { getAuthHeaders } from '../authHelper'

export type WardType = {
 _id?: string
 code: string
 name: string
 description?: string
 totalBeds?: number
 targetMonthlyAdmissions?: number
 isActive: boolean
}

export type CreateWardPayload = {
 code: string
 name: string
 description?: string
 totalBeds?: number
 targetMonthlyAdmissions?: number
}

export type UpdateWardPayload = {
 name?: string
 description?: string
 totalBeds?: number
 targetMonthlyAdmissions?: number
 isActive?: boolean
}

export async function getWardList(
 includeInactive = false,
): Promise<ResponseTypeBasic<WardType[]>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const query = includeInactive ? '?includeInactive=true' : ''
 const response = await fetch(`${apiBase}/api/ward${query}`, {
  method: 'GET',
  headers: getAuthHeaders(),
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

export function useWardList(includeInactive = false) {
 return useSWR(['wards-list', includeInactive], () => getWardList(includeInactive))
}

export async function createWard(
 payload: CreateWardPayload,
): Promise<ResponseTypeBasic<WardType>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/ward`, {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify(payload),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'สร้าง Ward ไม่สำเร็จ')
 }

 return response.json()
}

export async function updateWard(
 id: string,
 payload: UpdateWardPayload,
): Promise<ResponseTypeBasic<WardType>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/ward/${id}`, {
  method: 'PATCH',
  headers: getAuthHeaders(),
  body: JSON.stringify(payload),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'อัปเดตข้อมูล Ward ไม่สำเร็จ')
 }

 return response.json()
}

export async function deleteWard(id: string): Promise<ResponseTypeBasic<undefined>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/ward/${id}`, {
  method: 'DELETE',
  headers: getAuthHeaders(),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ลบ Ward ไม่สำเร็จ')
 }

 return response.json()
}
