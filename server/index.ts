import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { connectDB } from './db'
import { dashboardRoutes } from './routes/dashboard.route'
import { movieRoutes } from './routes/movie.route'
import { patientRoutes } from './routes/patient.route'

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

// 🌟 1. ให้ต่อ DB เฉพาะเมื่อไม่ใช่ช่วง Phase การ Build ของ Vercel
if (process.env.MONGODB_URI) {
 connectDB()
}

// 🌟 2. ประกาศและ Export app โดยไม่มี .listen() ต่อท้ายใน Chain
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
 .use(dashboardRoutes)
 .use(patientRoutes)
 .use(movieRoutes)

// 🌟 3. สั่ง .listen() เฉพาะตอนรัน Local ด้วย Bun เท่านั้น (ลบ .listen(3001) และ console.log ตัวเดิมออก)
if (
 process.env.NODE_ENV !== 'production' &&
 typeof process.versions === 'object' &&
 typeof process.versions.bun !== 'undefined'
) {
 app.listen(3001, () => {
  console.log(`Elysia API running on http://localhost:3001`)
 })
}
