import { getAuthHeaders } from './authHelper'
import { DashboardDataType } from '@server/modules/dashboard/model'

import useSWR from 'swr'

export type DashboardApiResponse = DashboardDataType & {
 beds: Array<{
  id: string
  status: 'Available' | 'Occupied'
  patientName: string
  hn: string
 }>
}

export async function fetchDashboardData(ward?: string): Promise<DashboardApiResponse> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const validWard = ward && ward !== 'dashboard' ? ward : undefined
 const url = validWard
  ? `${apiBase}/api/dashboard?ward=${encodeURIComponent(validWard)}`
  : `${apiBase}/api/dashboard`

 const response = await fetch(url, {
  headers: getAuthHeaders(),
  cache: 'no-store',
 })

 if (!response.ok) {
  throw new Error('Unable to fetch dashboard data')
 }

 const json = await response.json()
 const d: DashboardDataType = json.data

 return {
  ...d,
  beds: d.bedMapping.map((b) => ({
   id: b.bedNumber,
   status: b.status,
   patientName: b.patient?.patientName || '-',
   hn: b.patient?.hn || '-',
  })),
 }
}

export function useDashboardData(ward?: string) {
 return useSWR(['dashboard', ward], ([, targetWard]) => fetchDashboardData(targetWard))
}
