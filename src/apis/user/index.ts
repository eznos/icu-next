import { ResponseTypeBasic } from '@server/types'
import useSWR from 'swr'
import { getAuthHeaders } from '../authHelper'

export type ManagedUser = {
 _id: string
 username: string
 firstName: string
 lastName: string
 email: string
 role: 'user' | 'admin'
 ward: string
 status: 'pending' | 'active' | 'rejected'
 createdAt: string
 updatedAt: string
}

async function fetchUserList(): Promise<ResponseTypeBasic<ManagedUser[]>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/user/list`, {
  method: 'GET',
  headers: getAuthHeaders(),
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ดึงรายชื่อผู้ใช้งานไม่สำเร็จ')
 }

 return response.json()
}

export function useUserList() {
 const { data, error, isLoading, mutate } = useSWR(
  '/api/user/list',
  fetchUserList,
  {
   revalidateOnFocus: false,
  },
 )

 return {
  users: data?.data || [],
  isLoading,
  error,
  mutate,
 }
}

export async function updateUserStatus(
 id: string,
 status: 'pending' | 'active' | 'rejected',
): Promise<ResponseTypeBasic<{ id: string; status: string }>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/user/${id}/status`, {
  method: 'PATCH',
  headers: getAuthHeaders(),
  body: JSON.stringify({ status }),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'อัปเดตสถานะผู้ใช้งานไม่สำเร็จ')
 }

 return response.json()
}

export async function updateUserRole(
 id: string,
 role: 'user' | 'admin',
): Promise<ResponseTypeBasic<{ id: string; role: string }>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/user/${id}/role`, {
  method: 'PATCH',
  headers: getAuthHeaders(),
  body: JSON.stringify({ role }),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'อัปเดตบทบาทผู้ใช้งานไม่สำเร็จ')
 }

 return response.json()
}

export async function deleteUser(
 id: string,
): Promise<ResponseTypeBasic<undefined>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/user/${id}`, {
  method: 'DELETE',
  headers: getAuthHeaders(),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ลบผู้ใช้งานไม่สำเร็จ')
 }

 return response.json()
}
