import { OfficialType } from '@/types'
import { ResponseTypeBasic } from '@server/types'
import useSWRMutation from 'swr/mutation'

async function postOfficialCreate(
 params: OfficialType,
): Promise<ResponseTypeBasic<undefined>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 console.log(params)

 const response = await fetch(`${apiBase}/api/official`, {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
   Accept: 'application/json',
  },
  cache: 'no-store',
  body: JSON.stringify(params),
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))

  throw {
   message: errorData.message || 'สร้างเจ้าหน้าที่ไม่สำเร็จ',
   statusCode: response.status,
  }
 }

 return response.json() as Promise<ResponseTypeBasic<undefined>>
}

// 🌟 3. แก้ไข Fetcher ให้รับค่าจาก Array ที่มาจาก Key ของ useSWR ตรงๆ
async function officialCreateFetcher(
 url: string,
 { arg }: { arg: OfficialType },
) {
 return postOfficialCreate(arg)
}

// 2. สร้าง Custom Hook (ไม่ต้องเปลี่ยนอะไร ใช้งานได้เลย)
export function useOfficialCreate() {
 const { trigger, isMutating, data } = useSWRMutation(
  'officials-create',
  officialCreateFetcher,
 )

 return {
  mutate: trigger,
  isMutating,
  data,
 }
}
