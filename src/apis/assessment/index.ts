import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { getAuthHeaders } from '../authHelper'

export type DailyAssessmentData = {
 _id?: string
 objectUuId?: string
 patientId: string
 an: string
 hn: string
 patientName: string
 bedNumber: string
 ward?: string
 recordDate: string
 hasVentilator: boolean
 hasCentralLine: boolean
 hasFoleyCatheter: boolean
 hasVap?: boolean
 hasClabsi?: boolean
 hasCauti?: boolean
 unplannedExtubation?: number
 pressureInjuryStage?: 'none' | 'stage2' | 'stage3' | 'stage4' | 'unstageable'
 medicationErrorGradeEUp?: number
 note?: string
 recordedBy?: string
 recordedByName?: string
 createdAt?: string
 updatedAt?: string
}

export type SaveAssessmentPayload = {
 objectUuId?: string
 patientId: string
 an: string
 hn: string
 patientName: string
 bedNumber: string
 ward?: string
 recordDate: string
 hasVentilator: boolean
 hasCentralLine: boolean
 hasFoleyCatheter: boolean
 hasVap?: boolean
 hasClabsi?: boolean
 hasCauti?: boolean
 unplannedExtubation?: number
 pressureInjuryStage?: 'none' | 'stage2' | 'stage3' | 'stage4' | 'unstageable'
 medicationErrorGradeEUp?: number
 note?: string
}

export type BedAssessmentStatusItem = {
 bedIndex: number
 bedNumber: string
 status: 'Available' | 'Occupied'
 patient: {
  patientId: string
  an: string
  hn: string
  patientName: string
  diagnosis: string
  admissionDate: string
 } | null
 isAssessed: boolean
 checkCount: number
 latestCheck: DailyAssessmentData | null
 checks: DailyAssessmentData[]
}

export type BedAssessmentSummaryData = {
 date: string
 ward: string
 totalBeds: number
 occupiedBedsCount: number
 checkedBedsCount: number
 pendingBedsCount: number
 beds: BedAssessmentStatusItem[]
}

export async function fetchTodayAssessments(
 ward: string = 'MICU3',
 date?: string,
): Promise<{ data: DailyAssessmentData[]; message: string; statusCode: number }> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const queryParams = new URLSearchParams()
 if (ward) queryParams.set('ward', ward)
 if (date) queryParams.set('date', date)

 const response = await fetch(`${apiBase}/api/assessment/today?${queryParams.toString()}`, {
  headers: getAuthHeaders(),
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ดึงข้อมูลประเมินไม่สำเร็จ')
 }

 return response.json()
}

export function useTodayAssessments(ward: string = 'MICU3', date?: string) {
 return useSWR(
  ['assessments-today', ward, date],
  () => fetchTodayAssessments(ward, date),
  {
   revalidateOnFocus: true,
   revalidateOnReconnect: true,
  },
 )
}

export async function fetchBedAssessmentStatus(
 ward: string = 'MICU3',
 date?: string,
): Promise<{ data: BedAssessmentSummaryData; message: string; statusCode: number }> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const queryParams = new URLSearchParams()
 if (ward) queryParams.set('ward', ward)
 if (date) queryParams.set('date', date)

 const response = await fetch(`${apiBase}/api/assessment/bed-status?${queryParams.toString()}`, {
  headers: getAuthHeaders(),
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ดึงสถานะการประเมินเตียงไม่สำเร็จ')
 }

 return response.json()
}

export function useBedAssessmentStatus(ward: string = 'MICU3', date?: string) {
 return useSWR(
  ['assessment-bed-status', ward, date],
  () => fetchBedAssessmentStatus(ward, date),
  {
   revalidateOnFocus: true,
   revalidateOnReconnect: true,
  },
 )
}

export async function postSaveAssessment(payload: SaveAssessmentPayload) {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/assessment`, {
  method: 'POST',
  headers: getAuthHeaders(),
  cache: 'no-store',
  body: JSON.stringify(payload),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'บันทึกข้อมูลประเมินไม่สำเร็จ')
 }

 return response.json()
}

export function useSaveAssessment() {
 const { trigger, isMutating, data } = useSWRMutation(
  'assessment-save',
  (_url, { arg }: { arg: SaveAssessmentPayload }) => postSaveAssessment(arg),
 )

 return {
  saveAssessment: trigger,
  isSubmitting: isMutating,
  data,
 }
}

export async function deleteAssessment(id: string) {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/assessment/${encodeURIComponent(id)}`, {
  method: 'DELETE',
  headers: getAuthHeaders(),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.message || 'ลบข้อมูลประเมินไม่สำเร็จ')
 }

 return response.json()
}
