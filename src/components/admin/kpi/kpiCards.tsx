'use client'

import { KpiItem, KpiRecord, KpiStats } from '@/apis/kpi'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DataThresholdingRoundedIcon from '@mui/icons-material/DataThresholdingRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import HotelRoundedIcon from '@mui/icons-material/HotelRounded'
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import TimerRoundedIcon from '@mui/icons-material/TimerRounded'
import {
 Box,
 Card,
 CardContent,
 Grid,
 LinearProgress,
 Typography,
} from '@mui/material'

type KpiCardsProps = {
 kpiRecord?: KpiRecord | null
 stats?: KpiStats | null
}

const colorConfig = [
 {
  badgeBg: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(244, 63, 94, 0.15)' : '#FFF1F2',
  badgeColor: (theme: any) =>
   theme.palette.mode === 'dark' ? '#FB7185' : '#BE123C',
  badgeBorder: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(244, 63, 94, 0.3)' : '#FECDD3',
  barColor: '#0DA176',
 },
 {
  badgeBg: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
  badgeColor: (theme: any) =>
   theme.palette.mode === 'dark' ? '#FBBF24' : '#B45309',
  badgeBorder: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
  barColor: '#10B981',
 },
 {
  badgeBg: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
  badgeColor: (theme: any) =>
   theme.palette.mode === 'dark' ? '#60A5FA' : '#1D4ED8',
  badgeBorder: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE',
  barColor: '#2563EB',
 },
]

export const KpiCards = ({ kpiRecord, stats }: KpiCardsProps) => {
 const items: KpiItem[] = kpiRecord?.items || []
 const kpiStats = stats || kpiRecord?.stats
 const evaluationYear = kpiStats?.evaluationYearBe || kpiRecord?.year || 2569

 return (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
   {/* Main Header Card */}
   <Card
    sx={{
     borderRadius: '16px',
     border: '1px solid',
     borderColor: 'divider',
     boxShadow: (theme) =>
      theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
     bgcolor: 'background.paper',
    }}
   >
    <CardContent sx={{ p: 3 }}>
     <Typography
      variant='h6'
      sx={{
       fontWeight: 800,
       color: 'text.primary',
       fontSize: { xs: '1.1rem', sm: '1.25rem' },
       lineHeight: 1.3,
      }}
     >
      {kpiRecord?.title ||
       'ตัวชี้วัดประสิทธิภาพงานบริการวิกฤต (MICU3 Quality KPIs)'}
     </Typography>
     <Typography
      variant='body2'
      sx={{
       color: 'text.secondary',
       mt: 0.5,
       fontSize: '0.85rem',
      }}
     >
      {kpiRecord?.subtitle ||
       'เปรียบเทียบสถิติและดัชนีชี้วัดคุณภาพงานวิกฤตพยาบาล ตามเป้าหมายมาตรฐานความปลอดภัยผู้ป่วย (IPSG)'}
     </Typography>
    </CardContent>
   </Card>

   {/* 3 KPI Cards Grid */}
   <Grid container spacing={2.5}>
    {items.map((item, index) => {
     const cfg = colorConfig[index % colorConfig.length]
     const isPassed = item.isPassed !== false

     return (
      <Grid key={item.code || index} size={{ xs: 12, md: 4 }}>
       <Card
        sx={{
         height: '100%',
         borderRadius: '16px',
         border: '1px solid',
         borderColor: 'divider',
         bgcolor: 'background.paper',
         boxShadow: (theme) =>
          theme.palette.mode === 'dark'
           ? 'none'
           : '0 1px 4px rgba(0,0,0,0.04)',
         display: 'flex',
         flexDirection: 'column',
         justifyContent: 'space-between',
         transition: 'all 0.2s ease',
         '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: (theme) =>
           theme.palette.mode === 'dark'
            ? '0 8px 20px rgba(0,0,0,0.45)'
            : '0 8px 16px rgba(0,0,0,0.06)',
         },
        }}
       >
        <CardContent
         sx={{
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
         }}
        >
         {/* Tag badge */}
         <Box sx={{ mb: 1.5 }}>
          <Box
           component='span'
           sx={{
            display: 'inline-block',
            px: 1.25,
            py: 0.25,
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            bgcolor: cfg.badgeBg,
            color: cfg.badgeColor,
            border: '1px solid',
            borderColor: cfg.badgeBorder,
           }}
          >
           {item.tag || 'มาตรฐานสำคัญ'}
          </Box>
         </Box>

         {/* Title */}
         <Typography
          variant='subtitle2'
          sx={{
           fontWeight: 700,
           color: 'text.primary',
           minHeight: '2.8em',
           lineHeight: 1.4,
           mb: 1,
          }}
         >
          {item.title}
         </Typography>

         {/* Target description */}
         <Typography
          variant='caption'
          sx={{
           color: 'text.secondary',
           display: 'block',
           minHeight: '2.4em',
           mb: 2.5,
           lineHeight: 1.3,
          }}
         >
          {item.targetDescription}
         </Typography>

         {/* Actual vs Year Label */}
         <Box
          sx={{
           display: 'flex',
           justifyContent: 'space-between',
           alignItems: 'baseline',
           mb: 1,
          }}
         >
          <Typography
           variant='body2'
           sx={{
            fontWeight: 600,
            color: 'text.secondary',
            fontSize: '0.82rem',
           }}
          >
           สถานการณ์จริงปี {evaluationYear}
          </Typography>
          <Typography
           variant='body2'
           sx={{
            fontWeight: 800,
            color: 'text.primary',
            fontSize: '0.95rem',
           }}
          >
           {item.unit || item.actualValue}
          </Typography>
         </Box>

         {/* Progress Bar */}
         <Box sx={{ mb: 2 }}>
          <LinearProgress
           variant='determinate'
           value={item.progressPercent ?? 0}
           sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: (theme) =>
             theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : '#F1F5F9',
            '& .MuiLinearProgress-bar': {
             bgcolor: cfg.barColor,
             borderRadius: 4,
            },
           }}
          />
         </Box>

         {/* Status Evaluation Footer */}
         <Box
          sx={{
           display: 'flex',
           alignItems: 'center',
           gap: 0.75,
           mt: 'auto',
          }}
         >
          {isPassed ? (
           <CheckCircleRoundedIcon
            sx={{
             fontSize: 16,
             color: (theme) =>
              theme.palette.mode === 'dark' ? '#34D399' : '#059669',
             flexShrink: 0,
            }}
           />
          ) : (
           <ErrorOutlineRoundedIcon
            sx={{
             fontSize: 16,
             color: (theme) =>
              theme.palette.mode === 'dark' ? '#F87171' : '#DC2626',
             flexShrink: 0,
            }}
           />
          )}
          <Typography
           variant='caption'
           sx={{
            fontWeight: 700,
            fontSize: '0.78rem',
            color: (theme) =>
             isPassed
              ? theme.palette.mode === 'dark'
                ? '#34D399'
                : '#059669'
              : theme.palette.mode === 'dark'
                ? '#F87171'
                : '#DC2626',
            lineHeight: 1.3,
           }}
          >
           {item.statusText || 'ปลอดภัยและผ่านเกณฑ์การประเมิน'}
          </Typography>
         </Box>
        </CardContent>
       </Card>
      </Grid>
     )
    })}
   </Grid>

   {/* Baseline Data Reference Card */}
   {kpiStats && (
    <Card
     sx={{
      borderRadius: '16px',
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: (theme) =>
       theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.03)',
      bgcolor: (theme) =>
       theme.palette.mode === 'dark' ? 'background.paper' : '#F8FAFC',
     }}
    >
     <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
       <DataThresholdingRoundedIcon sx={{ color: '#0DA176', fontSize: 20 }} />
       <Typography
        variant='subtitle2'
        sx={{ fontWeight: 700, color: 'text.primary' }}
       >
        สถิติและตัวแปรอ้างอิงการประเมินผลอัตโนมัติ (Evaluation Baseline Data)
       </Typography>
      </Box>

      <Grid container spacing={2}>
       <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
        <Box
         sx={{
          p: 1.5,
          borderRadius: '12px',
          bgcolor: (theme) =>
           theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.04)'
            : '#FFFFFF',
          border: '1px solid',
          borderColor: 'divider',
         }}
        >
         <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}
         >
          <PeopleAltRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography
           variant='caption'
           sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
           ผู้ป่วยทั้งหมด
          </Typography>
         </Box>
         <Typography variant='h6' sx={{ fontWeight: 800, color: 'text.primary' }}>
          {kpiStats.totalPatients}{' '}
          <Typography
           component='span'
           variant='caption'
           sx={{ color: 'text.secondary' }}
          >
           ราย
          </Typography>
         </Typography>
        </Box>
       </Grid>

       <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
        <Box
         sx={{
          p: 1.5,
          borderRadius: '12px',
          bgcolor: (theme) =>
           theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.04)'
            : '#FFFFFF',
          border: '1px solid',
          borderColor: 'divider',
         }}
        >
         <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}
         >
          <HotelRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography
           variant='caption'
           sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
           ผู้ป่วยกำลังรักษา
          </Typography>
         </Box>
         <Typography
          variant='h6'
          sx={{
           fontWeight: 800,
           color: (theme) =>
            theme.palette.mode === 'dark' ? '#34D399' : '#0DA176',
          }}
         >
          {kpiStats.activePatients}{' '}
          <Typography
           component='span'
           variant='caption'
           sx={{ color: 'text.secondary' }}
          >
           ราย
          </Typography>
         </Typography>
        </Box>
       </Grid>

       <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
        <Box
         sx={{
          p: 1.5,
          borderRadius: '12px',
          bgcolor: (theme) =>
           theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.04)'
            : '#FFFFFF',
          border: '1px solid',
          borderColor: 'divider',
         }}
        >
         <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}
         >
          <TimerRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography
           variant='caption'
           sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
           วันนอนสะสมรวม
          </Typography>
         </Box>
         <Typography variant='h6' sx={{ fontWeight: 800, color: 'text.primary' }}>
          {kpiStats.totalPatientDays}{' '}
          <Typography
           component='span'
           variant='caption'
           sx={{ color: 'text.secondary' }}
          >
           วัน
          </Typography>
         </Typography>
        </Box>
       </Grid>

       <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
        <Box
         sx={{
          p: 1.5,
          borderRadius: '12px',
          bgcolor: (theme) =>
           theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.04)'
            : '#FFFFFF',
          border: '1px solid',
          borderColor: 'divider',
         }}
        >
         <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}
         >
          <MedicalServicesRoundedIcon
           sx={{ fontSize: 16, color: 'text.secondary' }}
          />
          <Typography
           variant='caption'
           sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
           วันใส่ท่อช่วยหายใจ
          </Typography>
         </Box>
         <Typography variant='h6' sx={{ fontWeight: 800, color: 'text.primary' }}>
          {kpiStats.estimatedVentilatorDays}{' '}
          <Typography
           component='span'
           variant='caption'
           sx={{ color: 'text.secondary' }}
          >
           วัน
          </Typography>
         </Typography>
        </Box>
       </Grid>

       <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
        <Box
         sx={{
          p: 1.5,
          borderRadius: '12px',
          bgcolor: (theme) =>
           theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.04)'
            : '#FFFFFF',
          border: '1px solid',
          borderColor: 'divider',
         }}
        >
         <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}
         >
          <DataThresholdingRoundedIcon
           sx={{ fontSize: 16, color: 'text.secondary' }}
          />
          <Typography
           variant='caption'
           sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
           อัตราการครองเตียง
          </Typography>
         </Box>
         <Typography
          variant='h6'
          sx={{
           fontWeight: 800,
           color: (theme) =>
            theme.palette.mode === 'dark' ? '#60A5FA' : '#2563EB',
          }}
         >
          {kpiStats.bedOccupancyPercent}%
         </Typography>
        </Box>
       </Grid>
      </Grid>
     </CardContent>
    </Card>
   )}
  </Box>
 )
}
