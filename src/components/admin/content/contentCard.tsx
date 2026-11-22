'use client'

import { ContentItem } from '@/apis/content'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'

const CATEGORY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  announcement: { label: 'ประกาศ ICU', color: '#D97706', bg: '#FEF3C7' },
  policy: { label: 'ระเบียบ/นโยบาย', color: '#DC2626', bg: '#FEE2E2' },
  education: { label: 'สุขศึกษา/คำแนะนำ', color: '#0D9488', bg: '#CCFBF1' },
  news: { label: 'ข่าวสารกิจกรรม', color: '#2563EB', bg: '#DBEAFE' },
  guideline: { label: 'แนวทางปฏิบัติ', color: '#7C3AED', bg: '#EDE9FE' },
}

interface ContentCardProps {
  item: ContentItem
  onEdit: (item: ContentItem) => void
  onDelete: (item: ContentItem) => void
  onTogglePublish: (item: ContentItem) => void
}

export function ContentCard({ item, onEdit, onDelete, onTogglePublish }: ContentCardProps) {
  const catConfig = CATEGORY_MAP[item.category] || {
    label: item.category,
    color: '#64748B',
    bg: '#F1F5F9',
  }

  return (
    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 6px 16px rgba(0,0,0,0.4)'
                : '0 6px 16px rgba(0,0,0,0.06)',
          },
        }}
      >
        {item.coverImage && (
          <CardMedia
            component='img'
            height='160'
            image={item.coverImage}
            alt={item.title}
            sx={{ objectFit: 'cover' }}
          />
        )}

        <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Chip
              size='small'
              label={catConfig.label}
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                height: 24,
                bgcolor: catConfig.bg,
                color: catConfig.color,
              }}
            />

            <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
              {item.isPinned && (
                <Tooltip title='ปักหมุดด้านบนสุด'>
                  <Chip
                    size='small'
                    icon={<PushPinRoundedIcon sx={{ fontSize: '13px !important' }} />}
                    label='ปักหมุด'
                    color='warning'
                    sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
                  />
                </Tooltip>
              )}
              <Chip
                size='small'
                label={item.isPublished ? 'เผยแพร่' : 'ฉบับร่าง'}
                color={item.isPublished ? 'success' : 'default'}
                variant={item.isPublished ? 'filled' : 'outlined'}
                sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
              />
            </Stack>
          </Box>

          <Typography
            variant='subtitle1'
            sx={{
              fontWeight: 800,
              lineHeight: 1.35,
              mb: 1,
              color: 'text.primary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.title}
          </Typography>

          <Typography
            variant='body2'
            sx={{
              color: 'text.secondary',
              fontSize: '0.85rem',
              lineHeight: 1.4,
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.summary || item.content}
          </Typography>

          <Box sx={{ mt: 'auto', pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'text.secondary',
                mb: 1.5,
              }}
            >
              <span>{item.author}</span>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VisibilityRoundedIcon sx={{ fontSize: 14 }} />
                <span>{item.viewCount} ครั้ง</span>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                control={
                  <Switch
                    size='small'
                    checked={item.isPublished}
                    onChange={() => onTogglePublish(item)}
                    color='success'
                  />
                }
                label={
                  <Typography variant='caption' sx={{ fontWeight: 600 }}>
                    {item.isPublished ? 'เปิดแสดง' : 'ซ่อน'}
                  </Typography>
                }
                sx={{ m: 0 }}
              />

              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title='แก้ไขเนื้อหา'>
                  <IconButton size='small' onClick={() => onEdit(item)}>
                    <EditRoundedIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='ลบเนื้อหานี้'>
                  <IconButton size='small' color='error' onClick={() => onDelete(item)}>
                    <DeleteOutlineRoundedIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )
}
