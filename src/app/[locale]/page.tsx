import { redirect } from 'next/navigation'

export default async function LocaleRootPage({
 params,
}: {
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params

 // 🌟 สั่งให้ Redirect ไปที่ /th/dashboard (หรือภาษาอื่นๆ ตามที่ผู้ใช้เลือก)
 redirect(`/${locale}/dashboard`)
}
