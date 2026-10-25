import { ResponseTypeBasic } from '@server/types'
import useSWRMutation from 'swr/mutation'

async function deleteOfficial(id: string): Promise<ResponseTypeBasic<undefined>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''

 const response = await fetch(`${apiBase}/api/official/${id}`, {
  method: 'DELETE',
  headers: {
   'Content-Type': 'application/json',
   Accept: 'application/json',
  },
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw {
   message: errorData.message || 'ลบข้อมูลเจ้าหน้าที่ไม่สำเร็จ',
   statusCode: response.status,
  }
 }

 return response.json() as Promise<ResponseTypeBasic<undefined>>
}

async function officialDeleteFetcher(
 _url: string,
 { arg }: { arg: string },
) {
 return deleteOfficial(arg)
}

export function useOfficialDelete() {
 const { trigger, isMutating, data } = useSWRMutation(
  'officials-delete',
  officialDeleteFetcher,
 )

 return {
  mutate: trigger,
  isMutating,
  data,
 }
}
