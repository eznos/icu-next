'use client'

import { useOfficialList } from '@/apis/officials/getOfficial'
import { OfficialModal } from '@/components/admin/official'
import { OfficialTableList } from '@/components/admin/official/officaiaTableList'
import { TitlePage } from '@/components/utils/titlePage'
import { useDialog } from '@/hooks/useDialog'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
export default function OfficialPage() {
 const { open, openDialog, closeDialog, data: dialogData } = useDialog<any>()
 const { data, isLoading, error } = useOfficialList({
  arg: {
   limit: 20,
   page: 1,
   sortBy: 'createdAt',
   order: 'desc',
  },
 })

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
  <Box>
   <TitlePage
    title='Official'
    actions={
     <Button
      onClick={openDialog}
      variant='contained'
      startIcon={<PersonAddIcon />}
     >
      ลงทะเบียนบุคลากร
     </Button>
    }
   />

   <OfficialTableList data={data?.data || []} isLoading={isLoading} />
   <OfficialModal data={dialogData} open={open} onClose={closeDialog} />
  </Box>
 )
}
