import { Elysia, t } from 'elysia'
import { authSetup } from '../../auth.setup'
import {
 CreateDailyAssessmentBody,
 CreateDailyAssessmentInput,
} from './model'
import { assessmentService } from './service'

export const assessmentRoutes = new Elysia({ prefix: '/assessment' })
 .use(authSetup)
 .post(
  '/',
  async ({ body, currentUser }) => {
   return assessmentService.saveAssessment(
    body as CreateDailyAssessmentInput,
    currentUser,
   )
  },
  {
   body: CreateDailyAssessmentBody,
  },
 )
 .get(
  '/today',
  async ({ query }) => {
   return assessmentService.getTodayWardAssessments({
    ward: query?.ward,
    date: query?.date,
   })
  },
  {
   query: t.Object({
    ward: t.Optional(t.String()),
    date: t.Optional(t.String()),
   }),
  },
 )
 .get(
  '/bed-status',
  async ({ query }) => {
   return assessmentService.getBedAssessmentStatus({
    ward: query?.ward,
    date: query?.date,
   })
  },
  {
   query: t.Object({
    ward: t.Optional(t.String()),
    date: t.Optional(t.String()),
   }),
  },
 )
 .get(
  '/patient/:id',
  async ({ params }) => {
   return assessmentService.getPatientAssessmentHistory(params.id)
  },
  {
   params: t.Object({
    id: t.String(),
   }),
  },
 )
 .delete(
  '/:id',
  async ({ params }) => {
   return assessmentService.deleteAssessment(params.id)
  },
  {
   params: t.Object({
    id: t.String(),
   }),
  },
 )

export * from './model'
export * from './service'
