'use client'

import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Card, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material'

interface ContentFilterProps {
  search: string
  onSearchChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  status: 'all' | 'published' | 'draft'
  onStatusChange: (value: 'all' | 'published' | 'draft') => void
}

export function ContentFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
}: ContentFilterProps) {
  return (
    <Card
      sx={{
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        p: 2,
      }}
    >
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            fullWidth
            size='small'
            placeholder='ค้นหาหัวข้อ, สรุปย่อ, ป้ายกำกับ...'
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

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>หมวดหมู่เนื้อหา</InputLabel>
            <Select
              value={category}
              label='หมวดหมู่เนื้อหา'
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <MenuItem value='all'>ทั้งหมด (ทุกหมวดหมู่)</MenuItem>
              <MenuItem value='announcement'>ประกาศ ICU</MenuItem>
              <MenuItem value='policy'>ระเบียบและนโยบายการเยี่ยม</MenuItem>
              <MenuItem value='education'>สุขศึกษาและคำแนะนำ</MenuItem>
              <MenuItem value='news'>ข่าวสารกิจกรรม</MenuItem>
              <MenuItem value='guideline'>แนวทางปฏิบัติ</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>สถานะการเผยแพร่</InputLabel>
            <Select
              value={status}
              label='สถานะการเผยแพร่'
              onChange={(e) => onStatusChange(e.target.value as 'all' | 'published' | 'draft')}
            >
              <MenuItem value='all'>ทั้งหมด</MenuItem>
              <MenuItem value='published'>เผยแพร่แล้ว (Published)</MenuItem>
              <MenuItem value='draft'>ฉบับร่าง (Draft)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Card>
  )
}
