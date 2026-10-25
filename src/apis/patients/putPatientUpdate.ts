import { getAuthHeaders } from '../authHelper'
import { UpdatePatientPayload } from '@/types'
import { ResponseTypeBasic } from '@server/types'
import useSWRMutation from 'swr/mutation'

export type PatientUpdateArg = {
 id: string
 data: UpdatePatientPayload
}

export async function putPatientUpdate({
 id,
 data,
}: PatientUpdateArg): Promise<ResponseTypeBasic<undefined>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''

 const response = await fetch(`${apiBase}/api/patient/${id}`, {
  method: 'PUT',
  headers: getAuthHeaders(),
  cache: 'no-store',
  body: JSON.stringify(data),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw {
   message: errorData.message || 'อัปเดตข้อมูลผู้ป่วยไม่สำเร็จ',
   statusCode: response.status,
  }
 }

 return response.json()
}

async function patientUpdateFetcher(
 _url: string,
 { arg }: { arg: PatientUpdateArg },
) {
 return putPatientUpdate(arg)
}

export function usePatientUpdate() {
 const { trigger, isMutating, data } = useSWRMutation(
  'patients-update',
  patientUpdateFetcher,
 )

 return {
  mutate: trigger,
  isMutating,
  data,
 }
}
