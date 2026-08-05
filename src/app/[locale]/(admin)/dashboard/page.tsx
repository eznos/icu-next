'use client'

import { fetchDashboardData } from '@/lib/api'
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
import { useTranslations } from 'next-intl'
import useSWR from 'swr'

const summaryKeys = [
 'totalPersonnel',
 'activePatients',
 'availableBeds',
 'pendingAdmissions',
] as const

export default function DashboardPage() {
 const t = useTranslations('dashboard')
 const { data } = useSWR('dashboard', fetchDashboardData, {})

 return (
  <Stack spacing={3}>
   <Typography variant='h5' fontWeight={700}>
    {t('title')}
   </Typography>

   <Card sx={{ border: '1px solid #EF4444' }}>
    <CardContent>
     <Stack direction='row' spacing={1} alignItems='center' mb={1}>
      <WarningAmberRoundedIcon sx={{ color: '#EF4444' }} />
      <Typography variant='h6' color='#B91C1C' fontWeight={700}>
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
     <Grid key={key} item xs={12} sm={6} lg={3}>
      <Card>
       <CardContent>
        <Typography variant='body2' color='text.secondary' gutterBottom>
         {t(key)}
        </Typography>
        <Typography variant='h4' fontWeight={700}>
         {data?.summary[key] ?? '-'}
        </Typography>
       </CardContent>
      </Card>
     </Grid>
    ))}
   </Grid>

   <Card>
    <CardContent>
     <Typography variant='h6' fontWeight={700} mb={2}>
      {t('bedMapping')}
     </Typography>
     <Grid container spacing={2}>
      {data?.beds.map((bed) => (
       <Grid key={bed.id} item xs={12} md={6} lg={4}>
        <Card variant='outlined'>
         <CardContent>
          <Stack
           direction='row'
           justifyContent='space-between'
           alignItems='center'
           mb={1}
          >
           <Typography variant='subtitle1' fontWeight={700}>
            {bed.id}
           </Typography>
           <Chip
            label={bed.status}
            size='small'
            color={bed.status === 'Available' ? 'success' : 'warning'}
           />
          </Stack>
          <Typography variant='body2'>Patient: {bed.patientName}</Typography>
          <Typography variant='body2' mb={2}>
           HN: {bed.hn}
          </Typography>
          <Button
           variant='contained'
           fullWidth
           disabled={bed.status === 'Occupied'}
          >
           {t('register')}
          </Button>
         </CardContent>
        </Card>
       </Grid>
      ))}
     </Grid>
    </CardContent>
   </Card>

   <Card>
    <CardContent>
     <Typography variant='h6' fontWeight={700} mb={2}>
      {t('chartTitle')}
     </Typography>
     <Box
      sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 180 }}
     >
      {data?.monthlyAdmissions.map((value, index) => (
       <Box key={`${value}-${index}`} sx={{ flex: 1 }}>
        <Box
         sx={{
          height: `${value * 3}px`,
          backgroundColor: '#14B8A6',
          borderRadius: 1,
          minHeight: 16,
         }}
        />
        <Typography align='center' variant='caption' mt={0.5} display='block'>
         M{index + 1}
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
