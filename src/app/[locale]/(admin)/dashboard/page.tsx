'use client'

import { BedMapping } from '@/components/admin/dashboard'
import { useDashboardData } from '@/apis/api'
import { useTranslationsNext } from '@/i18n/use-translate-next'
// import { fetchDashboardData } from '@/lib/api'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import {
 Box,
 Button,
 Card,
 CardContent,
 Chip,
 Divider,
 Grid,
 Stack,
 Typography,
} from '@mui/material'

const summaryKeys = [
 'totalPersonnel',
 'activePatients',
 'availableBeds',
 'pendingAdmissions',
] as const

export default function DashboardPage() {
 const t = useTranslationsNext('dashboard')
 const { data } = useDashboardData()

 return (
  <Stack spacing={3}>
   <Typography variant='h5' sx={{ fontWeight: 700 }}>
    {t('title')}
   </Typography>

   <Card sx={{ border: '1px solid #EF4444' }}>
    <CardContent>
     <Stack direction='row' spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
      <WarningAmberRoundedIcon sx={{ color: '#EF4444' }} />
      <Typography variant='h6' color='#B91C1C' sx={{ fontWeight: 700 }}>
       {t('warningTitle')}
      </Typography>
     </Stack>
     <Stack component='ul' sx={{ m: 0, pl: 3 }} spacing={0.5}>
      {t.raw('warningItems').map((item: string) => (
       <Typography key={item} component='li' variant='body2'>
        {item}
       </Typography>
      ))}
     </Stack>
    </CardContent>
   </Card>

   <Grid container spacing={2}>
    {summaryKeys.map((key) => (
     <Grid
      key={key}
      size={{
       xs: 12,
       md: 6,
       lg: 3,
      }}
      sx={{
       width: '100%',
      }}
     >
      <Card variant='outlined'>
       <CardContent>
        <Typography variant='body2' color='text.secondary'>
         {t(key)}
        </Typography>
        <Typography variant='h4' sx={{ fontWeight: 700 }}>
         {data?.summary[key] ?? '-'}
        </Typography>
       </CardContent>
      </Card>
     </Grid>
    ))}
   </Grid>

   <BedMapping
    wardName={data?.ward?.code || 'MICU3'}
    beds={data?.bedMapping || []}
   />

   <Card>
    <CardContent>
     <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
      {t('chartTitle')}
     </Typography>
     <Box
      sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 180 }}
     >
      {data?.monthlyAdmissions?.data?.map((item) => (
       <Box key={item.month} sx={{ flex: 1 }}>
        <Box
         sx={{
          height: `${Math.max(16, item.count * 12)}px`,
          backgroundColor: '#14B8A6',
          borderRadius: 1,
          minHeight: 16,
         }}
        />
        <Typography
         align='center'
         variant='caption'
         sx={{ mt: 0.5, display: 'block' }}
        >
         {item.label}
        </Typography>
       </Box>
      ))}
     </Box>
     <Divider sx={{ my: 1.5 }} />
     <Typography variant='caption' color='text.secondary'>
      Monthly admissions trend visualization.
     </Typography>
    </CardContent>
   </Card>
  </Stack>
 )
}
