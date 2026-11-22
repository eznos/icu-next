'use client'

import {
  Box,
  Card,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from '@mui/material'

interface FeedbackPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  limit: number
  onPageChange: (newPage: number) => void
  onLimitChange: (newLimit: number) => void
}

export function FeedbackPagination({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
}: FeedbackPaginationProps) {
  if (totalItems <= 0) return null

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, totalItems)

  return (
    <Card
      sx={{
        p: 1.5,
        px: 2.5,
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          แสดงรายการที่ <b>{startItem}</b> - <b>{endItem}</b> จากทั้งหมด <b>{totalItems}</b> รายการ
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            แถวต่อหน้า:
          </Typography>
          <FormControl size='small'>
            <Select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              sx={{
                height: 32,
                fontSize: '0.82rem',
                borderRadius: '8px',
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, val) => onPageChange(val)}
        color='primary'
        shape='rounded'
        size='medium'
        showFirstButton
        showLastButton
        sx={{
          '& .Mui-selected': {
            bgcolor: '#0D9488 !important',
            color: '#fff !important',
          },
        }}
      />
    </Card>
  )
}
