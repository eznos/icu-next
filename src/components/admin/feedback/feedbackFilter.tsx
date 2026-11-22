'use client'

import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Card, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material'

interface FeedbackFilterProps {
  search: string
  onSearchChange: (value: string) => void
  rating: string
  onRatingChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
}

export function FeedbackFilter({
  search,
  onSearchChange,
  rating,
  onRatingChange,
  status,
  onStatusChange,
}: FeedbackFilterProps) {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size='small'
            placeholder='ค้นหาความคิดเห็น, ชื่อผู้ประเมิน, หมายเลขเตียง...'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>ระดับคะแนน</InputLabel>
            <Select
              value={rating}
              label='ระดับคะแนน'
              onChange={(e) => onRatingChange(e.target.value)}
            >
              <MenuItem value='all'>ทั้งหมด (ทุกระดับคะแนน)</MenuItem>
              <MenuItem value='5'>5 ดาว (ดีเยี่ยม)</MenuItem>
              <MenuItem value='4'>4 ดาว (ดี)</MenuItem>
              <MenuItem value='3'>3 ดาว (ปานกลาง)</MenuItem>
              <MenuItem value='low'>1 - 2 ดาว (ต้องปรับปรุง)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>สถานะการตรวจสอบ</InputLabel>
            <Select
              value={status}
              label='สถานะการตรวจสอบ'
              onChange={(e) => onStatusChange(e.target.value)}
            >
              <MenuItem value='all'>ทั้งหมด</MenuItem>
              <MenuItem value='new'>ใหม่ (ยังไม่ตรวจ)</MenuItem>
              <MenuItem value='reviewed'>รับทราบแล้ว</MenuItem>
              <MenuItem value='resolved'>ดำเนินการแล้ว</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Card>
  )
}
