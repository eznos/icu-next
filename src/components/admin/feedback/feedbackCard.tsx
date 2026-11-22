'use client'

import { FeedbackItem } from '@/apis/feedback'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Rating,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'

const RELATIONSHIP_MAP: Record<string, string> = {
  child: 'บุตร / หลาน',
  spouse: 'คู่สมรส',
  parent: 'บิดา / มารดา',
  relative: 'ญาติผู้ป่วย',
  other: 'ผู้มาติดต่อทั่วไป',
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: 'info' | 'warning' | 'success' | 'default'; bg: string }
> = {
  new: { label: 'ใหม่ (New)', color: 'warning', bg: '#FEF3C7' },
  reviewed: { label: 'รับทราบแล้ว', color: 'info', bg: '#DBEAFE' },
  resolved: { label: 'ดำเนินการแล้ว', color: 'success', bg: '#D1FAE5' },
}

interface FeedbackCardProps {
  item: FeedbackItem
  onUpdateStatus: (item: FeedbackItem, status: 'new' | 'reviewed' | 'resolved') => void
  onDelete: (item: FeedbackItem) => void
}

export function FeedbackCard({ item, onUpdateStatus, onDelete }: FeedbackCardProps) {
  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.new
  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '-'

  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 2.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 16px rgba(0,0,0,0.3)'
              : '0 4px 16px rgba(0,0,0,0.05)',
        },
      }}
    >
      {/* Header Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
          <Rating
            value={item.overallRating}
            readOnly
            size='small'
            icon={<StarRoundedIcon fontSize='inherit' sx={{ color: '#0D9488' }} />}
          />
          <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
            {item.overallRating} / 5
          </Typography>

          <Chip
            size='small'
            label={RELATIONSHIP_MAP[item.relationship] || item.relationship}
            sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
          />

          {item.patientOrBedInfo && (
            <Chip
              size='small'
              label={item.patientOrBedInfo}
              variant='outlined'
              color='primary'
              sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
            />
          )}
        </Stack>

        <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {formattedDate}
          </Typography>
          <Chip
            size='small'
            label={statusConfig.label}
            color={statusConfig.color}
            sx={{ height: 24, fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Stack>
      </Box>

      {/* Sub-aspect ratings */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1.75,
          py: 1,
          px: 1.5,
          borderRadius: '10px',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
          fontSize: '0.8rem',
        }}
      >
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          พยาบาล: <b>{item.nurseRating}⭐</b>
        </Typography>
        <Typography variant='caption' sx={{ color: 'divider' }}>
          •
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          แพทย์: <b>{item.doctorRating}⭐</b>
        </Typography>
        <Typography variant='caption' sx={{ color: 'divider' }}>
          •
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          ความสะอาด: <b>{item.cleanlinessRating}⭐</b>
        </Typography>
        <Typography variant='caption' sx={{ color: 'divider' }}>
          •
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          การประสานงาน: <b>{item.coordinationRating}⭐</b>
        </Typography>
      </Box>

      {/* Comment Text */}
      {item.comment ? (
        <Typography
          variant='body1'
          sx={{
            fontWeight: 500,
            color: 'text.primary',
            mb: 2,
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}
        >
          &ldquo;{item.comment}&rdquo;
        </Typography>
      ) : (
        <Typography
          variant='body2'
          sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 2 }}
        >
          (ไม่มีข้อความแสดงความคิดเห็นเพิ่มเติม)
        </Typography>
      )}

      {/* Bottom Row: Visitor Info & Actions */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          <span>ผู้ประเมิน: </span>
          <b>{item.visitorName || 'ไม่ประสงค์ระบุชื่อ (Anonymous)'}</b>
          {item.contactPhone && (
            <span style={{ marginLeft: 8 }}>| โทร: {item.contactPhone}</span>
          )}
        </Box>

        <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
          {item.status !== 'reviewed' && (
            <Button
              size='small'
              variant='outlined'
              startIcon={<MarkEmailReadRoundedIcon />}
              onClick={() => onUpdateStatus(item, 'reviewed')}
              sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              รับทราบ
            </Button>
          )}

          {item.status !== 'resolved' && (
            <Button
              size='small'
              variant='outlined'
              color='success'
              startIcon={<DoneAllRoundedIcon />}
              onClick={() => onUpdateStatus(item, 'resolved')}
              sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              ดำเนินการแล้ว
            </Button>
          )}

          <Tooltip title='ลบรายการนี้'>
            <IconButton
              size='small'
              color='error'
              onClick={() => onDelete(item)}
            >
              <DeleteOutlineRoundedIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Card>
  )
}
