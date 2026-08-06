// src/app/api/[[...slug]]/route.ts
// import { app } from '../../../../../server/index'

import { app } from '@/../server'

export const dynamic = 'force-dynamic'

export const GET = app.handle
export const POST = app.handle
export const PUT = app.handle
export const DELETE = app.handle
export const PATCH = app.handle
