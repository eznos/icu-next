import { getAuthHeaders } from '../authHelper'
import { PatientType } from '@/types'
import { ResponseTypeBasic } from '@server/types'
import useSWR from 'swr'

export async function getPatientDetail(
 id: string,
): Promise<ResponseTypeBasic<PatientType>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''

 const response = await fetch(`${apiBase}/api/patient/${id}`, {
  method: 'GET',
  headers: getAuthHeaders(),
  cache: 'no-store',
 })

 const data = await response.json().catch(() => ({}))

 if (!response.ok || (data?.statusCode && data.statusCode >= 400)) {
  throw {
   message: data?.message || 'ดึงข้อมูลผู้ป่วยไม่สำเร็จ',
   statusCode: !response.ok ? response.status : (data?.statusCode || 400),
  }
 }

 return data as ResponseTypeBasic<PatientType>
}

async function patientDetailFetcher([, id]: readonly [string, string]) {
 return getPatientDetail(id)
}

export function usePatientDetail(id?: string) {
 const swrKey = id ? (['patient-detail', id] as const) : null
 return useSWR(swrKey, patientDetailFetcher)
}
