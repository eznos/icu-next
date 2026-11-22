'use client'

import { FeedbackStats as FeedbackStatsType } from '@/apis/feedback'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, Card, Grid, Rating, Typography } from '@mui/material'

interface FeedbackStatsProps {
  stats?: FeedbackStatsType
}

export function FeedbackStats({ stats }: FeedbackStatsProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* KPI Overview Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
              คะแนนความพึงพอใจเฉลี่ย (Overall)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant='h4' sx={{ fontWeight: 900, color: '#0D9488' }}>
                {stats?.averageOverall ?? 5.0}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                / 5.0 ดาว
              </Typography>
            </Box>
            <Rating
              value={stats?.averageOverall ?? 5}
              precision={0.1}
              readOnly
              size='small'
              icon={<StarRoundedIcon fontSize='inherit' sx={{ color: '#0D9488' }} />}
              sx={{ mt: 0.5 }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
              อัตราความพึงพอใจระดับสูง (CSAT)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant='h4' sx={{ fontWeight: 900, color: '#10B981' }}>
                {stats?.csatPercentage ?? 100}%
              </Typography>
            </Box>
            <Typography variant='caption' sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              ผู้ประเมินระดับ 4 - 5 ดาว
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
              จำนวนข้อเสนอแนะทั้งหมด
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant='h4' sx={{ fontWeight: 900, color: 'text.primary' }}>
                {stats?.total ?? 0}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                รายการ
              </Typography>
            </Box>
            <Typography variant='caption' sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              จากญาติและผู้มาติดต่อ ICU
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
              รอรับทราบ / ใหม่
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant='h4' sx={{ fontWeight: 900, color: '#F59E0B' }}>
                {stats?.statusCounts?.new ?? 0}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                รายการ
              </Typography>
            </Box>
            <Typography variant='caption' sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              ความคิดเห็นที่ยังไม่ได้เปิดดู
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Category Breakdown Bar */}
      <Card
        sx={{
          p: 2,
          px: 2.5,
          borderRadius: '14px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                ทีมพยาบาล:
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 800, color: '#0D9488' }}>
                ⭐ {stats?.averageNurse ?? 5.0} / 5
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                แพทย์ผู้ดูแล:
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 800, color: '#0D9488' }}>
                ⭐ {stats?.averageDoctor ?? 5.0} / 5
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                ความสะอาด/สิ่งแวดล้อม:
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 800, color: '#0D9488' }}>
                ⭐ {stats?.averageCleanliness ?? 5.0} / 5
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                การประสานงานเข้าเยี่ยม:
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 800, color: '#0D9488' }}>
                ⭐ {stats?.averageCoordination ?? 5.0} / 5
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  )
}
