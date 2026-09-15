import { OfficialType } from '@server/modules/official/model'
import { ResponseTypeBasic } from '@server/types'
import useSWR from 'swr'

export type OfficialDetailParams = {
 id?: string
}

export async function getOfficialDetail(
 id: string,
): Promise<ResponseTypeBasic<OfficialType>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''

 const response = await fetch(`${apiBase}/api/official/${id}`, {
  method: 'GET',
  headers: {
   'Content-Type': 'application/json',
   Accept: 'application/json',
  },
  cache: 'no-store',
 })

 const data = await response.json().catch(() => ({}))

 if (!response.ok || (data?.statusCode && data.statusCode >= 400)) {
  throw {
   message: data?.message || 'ดึงข้อมูลเจ้าหน้าที่ไม่สำเร็จ',
   statusCode: !response.ok ? response.status : (data?.statusCode || 400),
  }
 }

 return data as ResponseTypeBasic<OfficialType>
}

async function officialDetailFetcher([, id]: readonly [string, string]) {
 return getOfficialDetail(id)
}

export function useOfficialDetail(params?: string | OfficialDetailParams) {
 const id = typeof params === 'string' ? params : params?.id
 const swrKey = id ? (['official-detail', id] as const) : null

 return useSWR(swrKey, officialDetailFetcher)
}
