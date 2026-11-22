import useSWR from 'swr'
import { getAuthHeaders } from '../authHelper'

export interface FeedbackItem {
  _id: string
  objectUuId: string
  overallRating: number
  nurseRating: number
  doctorRating: number
  cleanlinessRating: number
  coordinationRating: number
  relationship: string
  patientOrBedInfo?: string
  visitorName?: string
  contactPhone?: string
  comment?: string
  status: 'new' | 'reviewed' | 'resolved'
  createdAt: string
  updatedAt: string
}

export interface FeedbackStats {
  total: number
  averageOverall: number
  averageNurse: number
  averageDoctor: number
  averageCleanliness: number
  averageCoordination: number
  csatPercentage: number
  ratingDistribution: Record<number, number>
  statusCounts: {
    new: number
    reviewed: number
    resolved: number
  }
}

export interface FeedbackQueryParams {
  rating?: string
  status?: string
  search?: string
  page?: number | string
  limit?: number | string
}

export interface CreateFeedbackPayload {
  overallRating: number
  nurseRating?: number
  doctorRating?: number
  cleanlinessRating?: number
  coordinationRating?: number
  relationship?: string
  patientOrBedInfo?: string
  visitorName?: string
  contactPhone?: string
  comment?: string
}

export interface FeedbackListResponse {
  data: FeedbackItem[]
  message: string
  statusCode: number
  pagination?: {
    page: number
    limit: number
    totalPages: number
    totalItems: number
  }
}

export interface FeedbackStatsResponse {
  data: FeedbackStats
  message: string
  statusCode: number
}

export async function fetchFeedbackList(
  params?: FeedbackQueryParams,
): Promise<FeedbackListResponse> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const searchParams = new URLSearchParams()

  if (params?.rating && params.rating !== 'all') {
    searchParams.set('rating', params.rating)
  }
  if (params?.status && params.status !== 'all') {
    searchParams.set('status', params.status)
  }
  if (params?.search) {
    searchParams.set('search', params.search)
  }
  if (params?.page) {
    searchParams.set('page', String(params.page))
  }
  if (params?.limit) {
    searchParams.set('limit', String(params.limit))
  }

  const queryString = searchParams.toString()
  const url = `${apiBase}/api/feedback${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'ไม่สามารถดึงข้อมูลรายการความคิดเห็นได้')
  }

  return response.json()
}

export function useFeedbackList(params?: FeedbackQueryParams) {
  return useSWR<FeedbackListResponse>(
    ['feedback-list', JSON.stringify(params || {})],
    () => fetchFeedbackList(params),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  )
}

export async function fetchFeedbackStats(): Promise<FeedbackStatsResponse> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const response = await fetch(`${apiBase}/api/feedback/stats`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'ไม่สามารถดึงสถิติความคิดเห็นได้')
  }

  return response.json()
}

export function useFeedbackStats() {
  return useSWR<FeedbackStatsResponse>(
    'feedback-stats',
    fetchFeedbackStats,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  )
}

export async function submitFeedback(
  payload: CreateFeedbackPayload,
): Promise<{ data: FeedbackItem; message: string }> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const response = await fetch(`${apiBase}/api/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'ส่งความคิดเห็นไม่สำเร็จ')
  }

  return response.json()
}

export async function updateFeedbackStatus(
  id: string,
  status: 'new' | 'reviewed' | 'resolved',
): Promise<{ data: FeedbackItem; message: string }> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const response = await fetch(`${apiBase}/api/feedback/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'อัปเดตสถานะไม่สำเร็จ')
  }

  return response.json()
}

export async function deleteFeedback(
  id: string,
): Promise<{ message: string }> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const response = await fetch(`${apiBase}/api/feedback/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'ลบความคิดเห็นไม่สำเร็จ')
  }

  return response.json()
}
