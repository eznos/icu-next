import { OfficialType } from '@/types'
import { ResponseTypeBasic } from '@server/types'
import useSWRMutation from 'swr/mutation'

export type OfficialUpdateArg = {
 id: string
 data: Partial<OfficialType>
}

async function putOfficialUpdate({
 id,
 data,
}: OfficialUpdateArg): Promise<ResponseTypeBasic<undefined>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''

 const response = await fetch(`${apiBase}/api/official/${id}`, {
  method: 'PUT',
  headers: {
   'Content-Type': 'application/json',
   Accept: 'application/json',
  },
  cache: 'no-store',
  body: JSON.stringify(data),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw {
   message: errorData.message || 'อัปเดตข้อมูลเจ้าหน้าที่ไม่สำเร็จ',
   statusCode: response.status,
  }
 }

 return response.json() as Promise<ResponseTypeBasic<undefined>>
}

async function officialUpdateFetcher(
 _url: string,
 { arg }: { arg: OfficialUpdateArg },
) {
 return putOfficialUpdate(arg)
}

export function useOfficialUpdate() {
 const { trigger, isMutating, data } = useSWRMutation(
  'officials-update',
  officialUpdateFetcher,
 )

 return {
  mutate: trigger,
  isMutating,
  data,
 }
}
