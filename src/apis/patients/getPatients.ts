import { getAuthHeaders } from '../authHelper'
import { PatientQueryParams, PatientType } from '@/types'
import { ResponseTypeBasic } from '@server/types'
import useSWR from 'swr'

export type PatientListResponse = ResponseTypeBasic<PatientType[]> & {
 pagination?: {
  page: number
  limit: number
  totalPages: number
  totalItems: number
 }
}

export async function getPatientList(
 params?: PatientQueryParams,
): Promise<PatientListResponse> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''

 const searchParams = new URLSearchParams()
 if (params) {
  Object.entries(params).forEach(([key, value]) => {
   if (value !== undefined && value !== '') {
    searchParams.append(key, String(value))
   }
  })
 }

 const queryString = searchParams.toString()
 const url = `${apiBase}/api/patient${queryString ? `?${queryString}` : ''}`

 const response = await fetch(url, {
  method: 'GET',
  headers: getAuthHeaders(),
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw {
   message: errorData.message || 'ดึงรายชื่อผู้ป่วยไม่สำเร็จ',
   statusCode: response.status,
  }
 }

 return response.json()
}

async function patientListFetcher([, params]: [string, PatientQueryParams | undefined]) {
 return getPatientList(params)
}

export function usePatientList(params?: PatientQueryParams) {
 return useSWR(['patients', params], patientListFetcher)
}
