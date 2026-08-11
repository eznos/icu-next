import { ResponseTypeBasic } from '@server/types'
import useSWRMutation from 'swr/mutation'

export type LoginPayload = {
 username: string
 password: string
}

async function LoginPost(
 payload: LoginPayload,
): Promise<ResponseTypeBasic<unknown>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/user/login`, {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
   Accept: 'application/json',
  },
  body: JSON.stringify(payload),
  cache: 'no-store',
 })

 if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))

  throw {
   message: errorData.message || 'เข้าสู่ระบบไม่สำเร็จ', // แก้คำให้ตรงกับ login
   statusCode: response.status,
  }
 }

 // 🌟 1. อ่าน .json() แค่ครั้งเดียว แล้วเก็บใส่ตัวแปร
 const responseData = await response.json()

 // 🌟 2. ดึง token ออกมาจากตัวแปร (เช็คพาทให้ดีว่า token อยู่ชั้นไหน)
 // อิงจากโค้ด Elysia ก่อนหน้านี้ token จะอยู่ชั้นนอกสุด (responseData.token)
 // แต่ถ้า API คุณส่งมาในก้อน data ก็ใช้ responseData.data?.token ครับ
 const token = responseData.token || responseData.data?.token

 if (token) {
  document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=strict`
 }

 // 🌟 3. Return ตัวแปรออกไปเลย ไม่ต้องสั่ง .json() ซ้ำแล้ว
 return responseData as ResponseTypeBasic<unknown>
}

async function loginFetcher(url: string, { arg }: { arg: LoginPayload }) {
 return LoginPost(arg)
}

// 2. สร้าง Custom Hook
export function useLoginPost() {
 const { trigger, isMutating, data } = useSWRMutation('login', loginFetcher)

 return {
  mutate: trigger,
  isLoading: isMutating,
  data,
 }
}
