import { getAuthHeaders } from '../authHelper'
import { CreatePatientPayload } from '@/types'
import { ResponseTypeBasic } from '@server/types'
import useSWRMutation from 'swr/mutation'

export async function postPatientCreate(
 payload: CreatePatientPayload,
): Promise<ResponseTypeBasic<undefined>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''

 const response = await fetch(`${apiBase}/api/patient`, {
  method: 'POST',
  headers: getAuthHeaders(),
  cache: 'no-store',
  body: JSON.stringify(payload),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw {
   message: errorData.message || 'บันทึกข้อมูลผู้ป่วยไม่สำเร็จ',
   statusCode: response.status,
  }
 }

 return response.json()
}

async function patientCreateFetcher(
 _url: string,
 { arg }: { arg: CreatePatientPayload },
) {
 return postPatientCreate(arg)
}

export function usePatientCreate() {
 const { trigger, isMutating, data } = useSWRMutation(
  'patients-create',
  patientCreateFetcher,
 )

 return {
  mutate: trigger,
  isMutating,
  data,
 }
}
