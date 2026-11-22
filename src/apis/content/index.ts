import useSWR from 'swr'
import { getAuthHeaders } from '../authHelper'

export type ContentCategory = 'announcement' | 'news' | 'policy' | 'education' | 'guideline'

export type ContentItem = {
 _id: string
 objectUuId: string
 title: string
 slug: string
 category: ContentCategory
 summary: string
 content: string
 coverImage?: string
 author: string
 ward: string
 isPublished: boolean
 isPinned: boolean
 viewCount: number
 tags: string[]
 createdAt: string
 updatedAt: string
}

export type ContentListResponse = {
 data: ContentItem[]
 message: string
 statusCode: number
 pagination?: {
  page: number
  limit: number
  totalPages: number
  totalItems: number
 }
}

export type ContentQueryParams = {
 category?: string
 search?: string
 ward?: string
 isPublished?: boolean | string
 publicOnly?: boolean | string
 page?: number | string
 limit?: number | string
}

export async function fetchContentList(
 params?: ContentQueryParams,
): Promise<ContentListResponse> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const searchParams = new URLSearchParams()

 if (params?.category && params.category !== 'all') {
  searchParams.set('category', params.category)
 }
 if (params?.search) {
  searchParams.set('search', params.search)
 }
 if (params?.ward && params.ward !== 'ALL') {
  searchParams.set('ward', params.ward)
 }
 if (params?.isPublished !== undefined && params?.isPublished !== '') {
  searchParams.set('isPublished', String(params.isPublished))
 }
 if (params?.publicOnly !== undefined) {
  searchParams.set('publicOnly', String(params.publicOnly))
 }
 if (params?.page) {
  searchParams.set('page', String(params.page))
 }
 if (params?.limit) {
  searchParams.set('limit', String(params.limit))
 }

 const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : ''
 const headers: Record<string, string> = {
  'Content-Type': 'application/json',
 }

 // ส่ง auth headers ถ้ามี token
 try {
  const authHeaders = getAuthHeaders()
  Object.assign(headers, authHeaders)
 } catch {
  // ignore in public mode
 }

 const response = await fetch(`${apiBase}/api/content${queryStr}`, {
  headers,
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ดึงรายการเนื้อหาไม่สำเร็จ')
 }

 return response.json()
}

export function useContentList(params?: ContentQueryParams) {
 return useSWR<ContentListResponse>(
  ['content-list', JSON.stringify(params || {})],
  () => fetchContentList(params),
  {
   revalidateOnFocus: true,
   revalidateOnReconnect: true,
  },
 )
}

export async function fetchContentDetail(
 id: string,
): Promise<{ data: ContentItem; message: string }> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const headers: Record<string, string> = {
  'Content-Type': 'application/json',
 }
 try {
  const authHeaders = getAuthHeaders()
  Object.assign(headers, authHeaders)
 } catch {
  // ignore
 }

 const response = await fetch(`${apiBase}/api/content/${encodeURIComponent(id)}`, {
  headers,
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ดึงรายละเอียดเนื้อหาไม่สำเร็จ')
 }

 return response.json()
}

export async function createContent(
 payload: Partial<ContentItem>,
): Promise<{ data: ContentItem; message: string }> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/content`, {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify(payload),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'สร้างเนื้อหาไม่สำเร็จ')
 }

 return response.json()
}

export async function updateContent(
 id: string,
 payload: Partial<ContentItem>,
): Promise<{ data: ContentItem; message: string }> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/content/${encodeURIComponent(id)}`, {
  method: 'PUT',
  headers: getAuthHeaders(),
  body: JSON.stringify(payload),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'อัปเดตเนื้อหาไม่สำเร็จ')
 }

 return response.json()
}

export async function deleteContent(
 id: string,
): Promise<{ message: string }> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/content/${encodeURIComponent(id)}`, {
  method: 'DELETE',
  headers: getAuthHeaders(),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ลบเนื้อหาไม่สำเร็จ')
 }

 return response.json()
}

export type PortalHeaderConfig = {
 badgeText: string
 title: string
 description: string
 visitingHoursLabel: string
 visitingHours: string
 safetyMeasuresLabel: string
 safetyMeasures: string
 guidelinesTitle: string
 guidelines: string[]
 emergencyPhone: string
}

export async function fetchPortalHeader(): Promise<{ data: PortalHeaderConfig; message: string }> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/content/portal-header`, {
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ดึงข้อมูลส่วนหัว Portal ไม่สำเร็จ')
 }

 return response.json()
}

export function usePortalHeader() {
 return useSWR<{ data: PortalHeaderConfig; message: string }>(
  'portal-header-config',
  fetchPortalHeader,
  {
   revalidateOnFocus: true,
   revalidateOnReconnect: true,
  },
 )
}

export async function updatePortalHeader(
 payload: Partial<PortalHeaderConfig>,
): Promise<{ data: PortalHeaderConfig; message: string }> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/content/portal-header`, {
  method: 'PUT',
  headers: getAuthHeaders(),
  body: JSON.stringify(payload),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'อัปเดตข้อมูลส่วนหัว Portal ไม่สำเร็จ')
 }

 return response.json()
}

