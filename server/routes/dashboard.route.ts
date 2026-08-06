// server/routes/dashboard.route.ts
import { Elysia } from 'elysia'

// 1. ย้าย Type มาไว้ที่นี่
export type DashboardResponse = {
 summary: {
  totalPersonnel: number
  activePatients: number
  availableBeds: number
  pendingAdmissions: number
 }
 beds: Array<{
  id: string
  status: 'Available' | 'Occupied'
  patientName: string
  hn: string
 }>
 monthlyAdmissions: number[]
}

// 2. ย้าย Mock Data มาไว้ที่นี่ (ในอนาคตถ้าต่อ Database ก็ลบก้อนนี้ทิ้งได้เลย)
const dashboardData: DashboardResponse = {
 summary: {
  totalPersonnel: 3,
  activePatients: 7,
  availableBeds: 5,
  pendingAdmissions: 2,
 },
 beds: [
  {
   id: 'ICU-01323',
   status: 'Occupied',
   patientName: 'Somchai Jaidee',
   hn: 'HN-000123',
  },
  { id: 'ICU-02', status: 'Available', patientName: '-', hn: '-' },
  { id: 'ICU-03', status: 'Available', patientName: '-', hn: '-' },
  {
   id: 'ICU-04',
   status: 'Occupied',
   patientName: 'Narin K.',
   hn: 'HN-000456',
  },
 ],
 monthlyAdmissions: [24, 31, 27, 36, 29, 35],
}

// 3. สร้าง Route สำหรับ Dashboard (ตั้ง prefix เป็น /dashboard)
export const dashboardRoutes = new Elysia({ prefix: '/dashboard' }).get(
 '/',
 () => dashboardData,
)
