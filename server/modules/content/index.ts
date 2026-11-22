import { Elysia, t } from 'elysia'
import { ResponseContentSchema } from './model'
import { contentService } from './service'

export const contentRoutes = new Elysia({ prefix: '/content' })
 .get(
  '/portal-header',
  async () => {
   const response = await contentService.getPortalHeader()
   return response
  },
  {
   response: {
    200: ResponseContentSchema.detailResponse,
    500: ResponseContentSchema.basicResponse,
   },
  },
 )
 .put(
  '/portal-header',
  async ({ body }) => {
   const response = await contentService.updatePortalHeader({ body })
   return response
  },
  {
   body: t.Object({
    badgeText: t.Optional(t.String()),
    title: t.Optional(t.String()),
    description: t.Optional(t.String()),
    visitingHoursLabel: t.Optional(t.String()),
    visitingHours: t.Optional(t.String()),
    safetyMeasuresLabel: t.Optional(t.String()),
    safetyMeasures: t.Optional(t.String()),
    guidelinesTitle: t.Optional(t.String()),
    guidelines: t.Optional(t.Array(t.String())),
    emergencyPhone: t.Optional(t.String()),
   }),
   response: {
    200: ResponseContentSchema.detailResponse,
    400: ResponseContentSchema.basicResponse,
   },
  },
 )
 .get(
  '/',
  async ({ query }) => {
   const response = await contentService.getContentList({ query })
   return response
  },
  {
   query: t.Object({
    category: t.Optional(t.String()),
    search: t.Optional(t.String()),
    ward: t.Optional(t.String()),
    isPublished: t.Optional(t.String()),
    publicOnly: t.Optional(t.String()),
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
   }),
   response: {
    200: ResponseContentSchema.listResponse,
    500: ResponseContentSchema.basicResponse,
   },
  },
 )
 .get(
  '/:id',
  async ({ params }) => {
   const response = await contentService.getContentById({ id: params.id })
   return response
  },
  {
   params: t.Object({
    id: t.String({ description: 'ID หรือ slug ของเนื้อหา' }),
   }),
   response: {
    200: ResponseContentSchema.detailResponse,
    404: ResponseContentSchema.basicResponse,
    500: ResponseContentSchema.basicResponse,
   },
  },
 )
 .post(
  '/',
  async ({ body }) => {
   const response = await contentService.createContent({ body })
   return response
  },
  {
   body: t.Object({
    title: t.String(),
    category: t.Optional(t.String()),
    summary: t.Optional(t.String()),
    content: t.String(),
    coverImage: t.Optional(t.String()),
    author: t.Optional(t.String()),
    ward: t.Optional(t.String()),
    isPublished: t.Optional(t.Boolean()),
    isPinned: t.Optional(t.Boolean()),
    tags: t.Optional(t.Array(t.String())),
   }),
   response: {
    201: ResponseContentSchema.detailResponse,
    400: ResponseContentSchema.basicResponse,
   },
  },
 )
 .put(
  '/:id',
  async ({ params, body }) => {
   const response = await contentService.updateContent({
    id: params.id,
    body,
   })
   return response
  },
  {
   params: t.Object({
    id: t.String(),
   }),
   body: t.Object({
    title: t.Optional(t.String()),
    category: t.Optional(t.String()),
    summary: t.Optional(t.String()),
    content: t.Optional(t.String()),
    coverImage: t.Optional(t.String()),
    author: t.Optional(t.String()),
    ward: t.Optional(t.String()),
    isPublished: t.Optional(t.Boolean()),
    isPinned: t.Optional(t.Boolean()),
    tags: t.Optional(t.Array(t.String())),
   }),
   response: {
    200: ResponseContentSchema.detailResponse,
    400: ResponseContentSchema.basicResponse,
    404: ResponseContentSchema.basicResponse,
   },
  },
 )
 .delete(
  '/:id',
  async ({ params }) => {
   const response = await contentService.deleteContent({ id: params.id })
   return response
  },
  {
   params: t.Object({
    id: t.String(),
   }),
   response: {
    200: ResponseContentSchema.basicResponse,
    404: ResponseContentSchema.basicResponse,
    500: ResponseContentSchema.basicResponse,
   },
  },
 )

export * from './model'
export * from './service'
