import createNextIntlPlugin from 'next-intl/plugin'

// ชี้ไปที่ไฟล์ request.ts ของคุณ
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
 // ตั้งค่า config อื่นๆ ของคุณตรงนี้ (ถ้ามี)
}

export default withNextIntl(nextConfig)
