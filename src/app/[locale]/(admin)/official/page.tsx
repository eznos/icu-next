'use client'

import { fetchMovieListList } from '@/apis/movies/api'
import { TableList } from '@/components/utils/tableList'
import { Box, CircularProgress, Typography } from '@mui/material'
import type { MoviesType } from '@server/types'
import useSWR from 'swr'

export default function OfficialPage() {
 // 🌟 ดึง isLoading และ error ออกมาใช้ด้วย
 const { data, isLoading, error } = useSWR('movies', fetchMovieListList)

 // 1. จัดการกรณีดึงข้อมูลล้มเหลว
 if (error) {
  return <Typography color='error'>เกิดข้อผิดพลาดในการโหลดข้อมูล</Typography>
 }

 // 2. จัดการหน้าจอระหว่างรอข้อมูล (แสดง Spinner)
 if (isLoading) {
  return (
   <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
    <CircularProgress size={24} />
    <Typography>กำลังโหลดข้อมูล...</Typography>
   </Box>
  )
 }

 //  Column<MoviesType>

 return (
  <Box sx={{}}>
   <Typography variant='h5' gutterBottom>
    Official
   </Typography>

   <TableList<MoviesType>
    rowKey='objectId'
    columns={[
     { key: 'id', label: 'ID', width: 60, renderCell: (row) => row.objectId },
     { key: 'title', label: 'Title', width: 200 },
     {
      key: 'releaseDate',
      label: 'Release Date',
      width: 150,
      renderCell: (row) => row.awards?.wins,
     },
    ]}
    rows={data?.data || []}
    pageSize={20}
    loading={isLoading}
    tableContainerProps={{
     sx: {
      maxHeight: 'calc(100vh - 300px)',
      overflowY: 'auto',
     },
    }}
    searchPlaceholder='Search users...'
    onRowClick={(row) => console.log('Clicked:', row)}
   />
  </Box>
 )
}
