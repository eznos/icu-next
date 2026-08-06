'use client'

import { useTranslations } from 'next-intl'
import en from '../messages/en.json'

type Messages = typeof en
type Namespace = keyof Messages

// กำหนดให้ namespace เป็น optional (ใส่หรือไม่ใส่ก็ได้)
export const useTranslationsNext = <
 N extends Namespace | undefined = undefined,
>(
 namespace?: N,
) => {
 // ถ้ามี namespace ก็ส่งไป ถ้าไม่มีก็ปล่อยว่างไว้
 const originalT = useTranslations(namespace as string | undefined)

 // ปรับ Type อัตโนมัติ: ถ้าไม่มี namespace ให้ลิสต์ Key ชั้นนอกสุด, ถ้ามีให้ลิสต์ Key ชั้นใน
 type KeyType = N extends keyof Messages ? keyof Messages[N] : keyof Messages

 const t = (key?: KeyType) => {
  return originalT(key as string)
 }

 t.raw = (key: KeyType) => {
  return originalT.raw(key as string)
 }

 return t
}
