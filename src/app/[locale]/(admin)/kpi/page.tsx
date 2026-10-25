'use client'

import { useKpiData } from '@/apis/kpi'
import { KpiCards } from '@/components/admin/kpi'
import { TitlePage } from '@/components/utils/titlePage'
import { Box, CircularProgress, Typography } from '@mui/material'
import { Suspense } from 'react'

function KpiContent() {
 const { data, isLoading, error } = useKpiData('MICU3')
 const kpiRecord = data?.data?.[0] || null

 if (error) {
  return (
   <Box sx={{ p: 3 }}>
    <Typography color='error'>
     เกิดข้อผิดพลาดในการโหลดข้อมูลตัวชี้วัด (KPI)
    </Typography>
   </Box>
  )
 }

 if (isLoading) {
  return (
   <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 3 }}>
    <CircularProgress size={24} sx={{ color: '#0DA176' }} />
    <Typography sx={{ color: '#64748B' }}>
     กำลังคำนวณและประมวลผลตัวชี้วัดคุณภาพ (Quality KPIs)...
    </Typography>
   </Box>
  )
 }

 return (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
   <TitlePage title='ตัวชี้วัดผลการปฏิบัติงาน (KPI)' />
   <KpiCards kpiRecord={kpiRecord} stats={data?.stats} />
  </Box>
 )
}

export default function KpiPage() {
 return (
  <Suspense
   fallback={
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 3 }}>
     <CircularProgress size={24} sx={{ color: '#0DA176' }} />
     <Typography sx={{ color: '#64748B' }}>
      กำลังคำนวณและประมวลผลตัวชี้วัดคุณภาพ...
     </Typography>
    </Box>
   }
  >
   <KpiContent />
  </Suspense>
 )
}
