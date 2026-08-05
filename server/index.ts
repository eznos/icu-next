import { cors } from '@elysiajs/cors' // 1. Import cors เข้ามา
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
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

export const app = new Elysia({ prefix: '/api' })
 .use(
  swagger({
   documentation: {
    info: {
     title: 'Elysia Documentation',
     version: '1.0.0',
    },
   },
  }),
 )

 .use(
  cors({
   origin: [
    'http://localhost:3000',
    'https://icu-next-git-main-icu-next.vercel.app',
   ],
  }),
 )
 .get('/health', () => ({ status: 'ok' }))
 .get('/dashboard', () => dashboardData)
 .listen(3001)

console.log(`Elysia API running on ${app.server?.url}`)
