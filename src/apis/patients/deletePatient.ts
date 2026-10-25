import { getAuthHeaders } from '../authHelper'
import { ResponseTypeBasic } from '@server/types'
import useSWRMutation from 'swr/mutation'

export async function deletePatient(id: string): Promise<ResponseTypeBasic<undefined>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''

 const response = await fetch(`${apiBase}/api/patient/${id}`, {
  method: 'DELETE',
  headers: getAuthHeaders(),
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw {
   message: errorData.message || 'ลบข้อมูลผู้ป่วยไม่สำเร็จ',
   statusCode: response.status,
  }
 }

 return response.json()
}

async function patientDeleteFetcher(
 _url: string,
 { arg }: { arg: string },
) {
 return deletePatient(arg)
}

export function usePatientDelete() {
 const { trigger, isMutating, data } = useSWRMutation(
  'patients-delete',
  patientDeleteFetcher,
 )

 return {
  mutate: trigger,
  isMutating,
  data,
 }
}
