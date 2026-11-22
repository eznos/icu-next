import { Elysia, t } from 'elysia'
import { ResponseFeedbackSchema } from './model'
import { feedbackService } from './service'

export const feedbackRoutes = new Elysia({ prefix: '/feedback' })
  .post(
    '/',
    async ({ body }) => {
      const response = await feedbackService.createFeedback({ body })
      return response
    },
    {
      body: t.Object({
        overallRating: t.Number({ minimum: 1, maximum: 5 }),
        nurseRating: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
        doctorRating: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
        cleanlinessRating: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
        coordinationRating: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
        relationship: t.Optional(t.String()),
        patientOrBedInfo: t.Optional(t.String()),
        visitorName: t.Optional(t.String()),
        contactPhone: t.Optional(t.String()),
        comment: t.Optional(t.String()),
      }),
      response: {
        201: ResponseFeedbackSchema.detailResponse,
        500: ResponseFeedbackSchema.basicResponse,
      },
    },
  )
  .get(
    '/stats',
    async () => {
      const response = await feedbackService.getFeedbackStats()
      return response
    },
    {
      response: {
        200: ResponseFeedbackSchema.statsResponse,
        500: ResponseFeedbackSchema.basicResponse,
      },
    },
  )
  .get(
    '/',
    async ({ query }) => {
      const response = await feedbackService.getFeedbackList({ query })
      return response
    },
    {
      query: t.Object({
        rating: t.Optional(t.String()),
        status: t.Optional(t.String()),
        search: t.Optional(t.String()),
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
      response: {
        200: ResponseFeedbackSchema.listResponse,
        500: ResponseFeedbackSchema.basicResponse,
      },
    },
  )
  .patch(
    '/:id/status',
    async ({ params, body }) => {
      const response = await feedbackService.updateFeedbackStatus({
        id: params.id,
        status: body.status,
      })
      return response
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        status: t.String(),
      }),
      response: {
        200: ResponseFeedbackSchema.detailResponse,
        404: ResponseFeedbackSchema.basicResponse,
        500: ResponseFeedbackSchema.basicResponse,
      },
    },
  )
  .delete(
    '/:id',
    async ({ params }) => {
      const response = await feedbackService.deleteFeedback({ id: params.id })
      return response
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: ResponseFeedbackSchema.basicResponse,
        404: ResponseFeedbackSchema.basicResponse,
        500: ResponseFeedbackSchema.basicResponse,
      },
    },
  )

export * from './model'
export * from './service'
