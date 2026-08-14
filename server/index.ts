import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { authSetup } from './auth.setup'
import { connectDB } from './db'
import { officialRoutes } from './modules/official'
import { dashboardRoutes } from './routes/dashboard.route'
import { movieRoutes } from './routes/movie.route'
import { patientRoutes } from './routes/patient.route'
import { userRoutes } from './routes/user.route'

if (process.env.MONGODB_URI) {
 connectDB()
}

export const app = new Elysia({ prefix: '/api' })
 .use(
  swagger({
   provider: 'scalar',
   path: '/swagger',
   documentation: {
    info: {
     title: 'Elysia Documentation',
     version: '1.0.0',
    },
   },
  }),
 )
 .use(authSetup)
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
 .use(userRoutes)
 .use(officialRoutes)

if (
 process.env.NODE_ENV !== 'production' &&
 typeof process.versions === 'object' &&
 typeof process.versions.bun !== 'undefined'
) {
 app.listen(3001, () => {
  console.log(`Elysia API running on http://localhost:3001`)
 })
}
