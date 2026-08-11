'use client'

import { useTranslations } from 'next-intl'
import en from '../messages/en.json'

type Messages = typeof en
type Namespace = keyof Messages

// 🌟 1. สร้าง Utility Type สำหรับเจาะลึก Key ที่ซ้อนกัน (Dot Notation)
type NestedKeyOf<ObjectType extends object> = {
 [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
  ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
  : `${Key}`
}[keyof ObjectType & (string | number)]

export const useTranslationsNext = <
 N extends Namespace | undefined = undefined,
>(
 namespace?: N,
) => {
 const originalT = useTranslations(namespace as string | undefined)

 // 🌟 2. นำ NestedKeyOf มาใช้แทน keyof ธรรมดา
 type KeyType = N extends keyof Messages
  ? NestedKeyOf<Messages[N]>
  : NestedKeyOf<Messages>

 // หมายเหตุ: เอาเครื่องหมาย ? ออกจาก key เพื่อบังคับให้ผู้ใช้ต้องใส่ key เสมอ (ป้องกัน error)
 const t = (key: KeyType) => {
  return originalT(key as string)
 }

 t.raw = (key: KeyType) => {
  return originalT.raw(key as string)
 }

 return t
}
