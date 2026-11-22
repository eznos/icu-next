import { ResponseTypeBasic } from '@server/types'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { getAuthHeaders, getAuthToken } from '../authHelper'

export type CurrentUserInfo = {
 id?: string
 username: string
 firstName?: string
 lastName?: string
 role: 'user' | 'admin'
 ward: string
}

async function fetchCurrentUser(): Promise<ResponseTypeBasic<CurrentUserInfo>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const token = getAuthToken()
 if (!token) {
  throw new Error('No token found')
 }

 const response = await fetch(`${apiBase}/api/user/me`, {
  method: 'GET',
  headers: getAuthHeaders(),
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ดึงข้อมูลผู้ใช้งานไม่สำเร็จ')
 }

 return response.json()
}

export function useCurrentUser() {
 const [cachedUser, setCachedUser] = useState<CurrentUserInfo | null>(null)

 useEffect(() => {
  if (typeof window !== 'undefined') {
   try {
    const raw = localStorage.getItem('user')
    if (raw) {
     setCachedUser(JSON.parse(raw))
    }
   } catch {
    // ignore json parse error
   }
  }
 }, [])

 const { data, error, isLoading, mutate } = useSWR(
  '/api/user/me',
  fetchCurrentUser,
  {
   revalidateOnFocus: false,
   shouldRetryOnError: false,
   onSuccess: (res) => {
    if (res?.data && typeof window !== 'undefined') {
     localStorage.setItem('user', JSON.stringify(res.data))
    }
   },
  },
 )

 const user: CurrentUserInfo | null = data?.data || cachedUser

 return {
  user,
  isLoading: isLoading && !cachedUser,
  error,
  mutate,
 }
}
