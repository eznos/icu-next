import { ResponseTypeBasic } from '@server/types'
import useSWRMutation from 'swr/mutation'

export type RegisterPayload = {
 username: string
 email: string
 password: string
 role?: 'user' | 'admin'
}

async function RegisterPost(
 payload: RegisterPayload,
): Promise<ResponseTypeBasic<undefined>> {
 const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
 const response = await fetch(`${apiBase}/api/user/register`, {
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
   message: errorData.message || 'สมัครสมาชิกไม่สำเร็จ',
   statusCode: response.status,
  }
 }

 return response.json() as Promise<ResponseTypeBasic<undefined>>
}

async function registerFetcher(url: string, { arg }: { arg: RegisterPayload }) {
 return RegisterPost(arg)
}

// 2. สร้าง Custom Hook
export function useRegisterPost() {
 const { trigger, isMutating, data } = useSWRMutation(
  'register',
  registerFetcher,
 )

 return {
  mutate: trigger,
  isLoading: isMutating,
  data,
 }
}
