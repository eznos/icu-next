'use client'

import { useOfficialList } from '@/apis/officials/getOfficial'
import { DeleteOfficialModal, OfficialModal, OfficialTableList } from '@/components/admin/official'
import { TitlePage } from '@/components/utils/titlePage'
import { useDialog } from '@/hooks/useDialog'
import { OfficialType } from '@/types'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Box, Button, CircularProgress, Typography } from '@mui/material'

export default function OfficialPage() {
 const { open, openDialog, closeDialog, data: dialogData } = useDialog<OfficialType | null>()
 const {
  open: isDeleteOpen,
  openDialog: openDeleteDialog,
  closeDialog: closeDeleteDialog,
  data: deleteDialogData,
 } = useDialog<OfficialType | null>()

 const { data, isLoading, error, mutate } = useOfficialList({
  arg: {
   limit: 20,
   page: 1,
   sortBy: 'createdAt',
   order: 'desc',
  },
 })

 const handleRowClick = (row: OfficialType, event: 'edit' | 'delete') => {
  if (event === 'edit') {
   openDialog(row)
  } else if (event === 'delete') {
   openDeleteDialog(row)
  }
 }

 if (error) {
  return <Typography color='error'>เกิดข้อผิดพลาดในการโหลดข้อมูล</Typography>
 }

 if (isLoading) {
  return (
   <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
    <CircularProgress size={24} />
    <Typography>กำลังโหลดข้อมูล...</Typography>
   </Box>
  )
 }

 return (
  <Box>
   <TitlePage
    title='Official'
    actions={
     <Button
      onClick={() => openDialog(null)}
      variant='contained'
      startIcon={<PersonAddIcon />}
     >
      ลงทะเบียนบุคลากร
     </Button>
    }
   />

   <OfficialTableList
    onRowClick={handleRowClick}
    data={(data?.data as OfficialType[]) || []}
    isLoading={isLoading}
   />

   <OfficialModal
    data={dialogData}
    open={open}
    onClose={closeDialog}
    onSuccess={() => mutate()}
   />

   <DeleteOfficialModal
    data={deleteDialogData}
    open={isDeleteOpen}
    onClose={closeDeleteDialog}
    onSuccess={() => mutate()}
   />
  </Box>
 )
}
