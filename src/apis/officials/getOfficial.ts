import { OfficialType } from '@server/modules/official/model'
import { ResponseTypeBasic } from '@server/types'
import useSWR from 'swr'

export type RegisterPayload = {
 limit?: number
 page?: number
 search?: string
 sortBy?: string
 order?: 'asc' | 'desc'
}

async function getOfficialList(
 params: RegisterPayload,
): Promise<ResponseTypeBasic<OfficialType[]>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''

 // 🌟 1. แปลง params เป็น Query String ป้องกันการต่อ URL พังกรณีค่าเป็น undefined
 const searchParams = new URLSearchParams()
 Object.entries(params).forEach(([key, value]) => {
  if (value !== undefined && value !== '') {
   searchParams.append(key, String(value))
  }
 })

 // 🌟 2. นำ Query String ไปต่อท้าย URL (เช่น ?limit=20&page=1)
 const response = await fetch(
  `${apiBase}/api/official?${searchParams.toString()}`,
  {
   method: 'GET',
   headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
   },
   cache: 'no-store',
  },
 )

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))

  throw {
   message: errorData.message || 'ดึงรายชื่อเจ้าหน้าที่ไม่สำเร็จ',
   statusCode: response.status,
  }
 }

 return response.json() as Promise<ResponseTypeBasic<OfficialType[]>>
}

// 🌟 3. แก้ไข Fetcher ให้รับค่าจาก Array ที่มาจาก Key ของ useSWR ตรงๆ
async function officialListFetcher([url, arg]: [string, RegisterPayload]) {
 return getOfficialList(arg)
}

// 2. สร้าง Custom Hook (ไม่ต้องเปลี่ยนอะไร ใช้งานได้เลย)
export function useOfficialList({ arg }: { arg?: RegisterPayload } = {}) {
 const data = useSWR(['officials', arg], officialListFetcher)

 return {
  ...data,
 }
}
