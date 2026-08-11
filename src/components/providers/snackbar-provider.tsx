'use client'

import { SnackbarProvider as NotistackProvider } from 'notistack'
import type { ReactNode } from 'react'

export function SnackbarProvider({ children }: { children: ReactNode }) {
 return <NotistackProvider maxSnack={3}>{children}</NotistackProvider>
}
