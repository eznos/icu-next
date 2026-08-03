# icu-next

A modern ICU admin web app starter using **Next.js App Router + TypeScript + MUI v5 + next-intl + ElysiaJS**.

## 1) Step-by-step setup commands

```bash
# 1) Scaffold Next.js with TypeScript + App Router
npx create-next-app@latest icu-next \
  --typescript \
  --app \
  --eslint \
  --src-dir \
  --import-alias "@/*"

cd icu-next

# 2) Install UI + i18n + data fetching + API dependencies
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled @mui/material-nextjs
npm install next-intl swr
npm install elysia

# 3) (Optional) Bun runtime for Elysia local API server
curl -fsSL https://bun.sh/install | bash

# 4) Install app dependencies
npm install

# 5) Run the frontend (terminal A)
npm run dev

# 6) Run Elysia API (terminal B)
npm run api
```

## 2) Folder structure

```text
.
├── messages/
│   ├── en.json
│   └── th.json
├── middleware.ts
├── server/
│   └── index.ts
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (admin)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── personnel/page.tsx
│   │   │   │   ├── reports/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (auth)/login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   ├── providers/app-providers.tsx
│   │   └── theme/
│   │       ├── app-theme-provider.tsx
│   │       └── theme-mode-switch.tsx
│   ├── i18n/
│   │   ├── request.ts
│   │   └── routing.ts
│   └── lib/api.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 3) MUI + Next.js App Router integration (AppRegistry)

Implemented in `/src/components/providers/app-providers.tsx` using:
- `AppRouterCacheProvider` from `@mui/material-nextjs/v15-appRouter`
- global MUI ThemeProvider and CssBaseline

## 4) ThemeProvider (Dark/Light mode)

Implemented in `/src/components/theme/app-theme-provider.tsx` with:
- localStorage persistence (`theme-mode`)
- `toggleMode()` context API
- `ThemeModeSwitch` component in header

## 5) i18n (English/Thai) with next-intl

Implemented via:
- `/middleware.ts`
- `/src/i18n/routing.ts`
- `/src/i18n/request.ts`
- `/messages/en.json`, `/messages/th.json`

Routes are locale-aware (`/en/*` and `/th/*`).

## 6) Admin layout (Sidebar + Header)

Implemented in `/src/app/[locale]/(admin)/layout.tsx` and related components:
- Sidebar background: `#1E2235`
- Active menu style: `#14B8A6`, white text, rounded corners
- Header: white, online indicator, live date-time
- Main content: light gray background (`#F3F4F6`)

## 7) Dashboard page (MUI grid/cards)

Implemented in `/src/app/[locale]/(admin)/dashboard/page.tsx`:
- red outlined warning card with urgent list
- summary statistic cards
- bed mapping card grid with statuses + register button
- bottom monthly chart section

## 8) ElysiaJS API sample

Implemented in `/server/index.ts`:
- `GET /api/health`
- `GET /api/dashboard`

Next.js dashboard calls Elysia via `/src/lib/api.ts` using:
- `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3001`)
