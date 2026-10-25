import useSWR from 'swr'
import { getAuthHeaders } from '../authHelper'

export type KpiItem = {
 code: string
 tag?: string
 title: string
 targetDescription?: string
 targetValue: number
 actualValue: number
 unit: string
 progressPercent: number
 isPassed: boolean
 statusText: string
 statusColor: string
}

export type KpiStats = {
 totalPatients: number
 activePatients: number
 totalPatientDays: number
 estimatedVentilatorDays: number
 bedOccupancyPercent: number
 evaluationYearBe: number
}

export type KpiRecord = {
 _id: string
 objectUuId: string
 ward: string
 periodType: 'yearly' | 'monthly'
 year: number
 month?: number | null
 title: string
 subtitle?: string
 items: KpiItem[]
 stats?: KpiStats
 createdAt?: string
 updatedAt?: string
}

export type KpiListResponse = {
 data: KpiRecord[]
 stats?: KpiStats
 message: string
 statusCode: number
 pagination?: {
  page: number
  limit: number
  totalPages: number
  totalItems: number
 }
}

export async function fetchKpiData(ward?: string): Promise<KpiListResponse> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const query =
  ward && ward.toUpperCase() !== 'DASHBOARD'
   ? `?ward=${encodeURIComponent(ward)}`
   : ''

 const response = await fetch(`${apiBase}/api/kpi${query}`, {
  headers: getAuthHeaders(),
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ดึงข้อมูล KPI ไม่สำเร็จ')
 }

 return response.json()
}

export function useKpiData(ward: string = 'MICU3') {
 const cleanWard = ward && ward.toUpperCase() !== 'DASHBOARD' ? ward : 'MICU3'
 return useSWR<KpiListResponse>(
  ['kpi-data', cleanWard],
  () => fetchKpiData(cleanWard),
  {
   revalidateOnFocus: true,
   revalidateOnReconnect: true,
  },
 )
}
