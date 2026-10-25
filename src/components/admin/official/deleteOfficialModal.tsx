'use client'

import { useOfficialDelete } from '@/apis/officials/deleteOfficial'
import { useSnackBarNotification } from '@/hooks'
import { OfficialType } from '@/types'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material'

type DeleteOfficialModalProps = {
 open: boolean
 onClose: () => void
 onSuccess?: () => void
 data?: OfficialType | null
}

export const DeleteOfficialModal = ({
 open,
 onClose,
 onSuccess,
 data,
}: DeleteOfficialModalProps) => {
 const { mutate, isMutating } = useOfficialDelete()
 const { showSnackbar } = useSnackBarNotification()

 const targetId = data?.objectUuId || (data as any)?._id || (data as any)?.id

 const handleConfirm = async () => {
  if (!targetId) return

  await mutate(targetId, {
   onSuccess: () => {
    showSnackbar('ลบข้อมูลบุคลากรสำเร็จ', 'success')
    onSuccess?.()
    onClose()
   },
   onError: (error: any) => {
    showSnackbar(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', 'error')
   },
  })
 }

 return (
  <Dialog
   open={open}
   onClose={isMutating ? undefined : onClose}
   maxWidth='xs'
   fullWidth
   sx={{
    '& .MuiDialog-paper': {
     borderRadius: '16px',
     p: 2.5,
     textAlign: 'center',
    },
   }}
  >
   <DialogContent sx={{ p: 1 }}>
    <Box
     sx={{
      width: 64,
      height: 64,
      borderRadius: '50%',
      bgcolor: '#FEF9C3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mx: 'auto',
      mb: 2.5,
     }}
    >
     <WarningRoundedIcon sx={{ fontSize: 36, color: '#F59E0B' }} />
    </Box>

    <Typography variant='h6' sx={{ fontWeight: 700, color: '#0F172A', mb: 1.25 }}>
     ลบข้อมูล{data?.position || 'บุคลากร'}?
    </Typography>

    <Typography
     variant='body2'
     sx={{
      color: '#475569',
      lineHeight: 1.6,
      mb: 3.5,
      px: 1,
     }}
    >
     คุณแน่ใจหรือไม่ที่จะทำการลบ {data?.fullName || 'บุคลากรท่านนี้'} ออกจากระบบประวัติการทำงานถาวร?
    </Typography>

    <Box sx={{ display: 'flex', gap: 2 }}>
     <Button
      fullWidth
      variant='contained'
      disabled={isMutating}
      onClick={handleConfirm}
      sx={{
       bgcolor: '#DC2626',
       borderRadius: '8px',
       py: 1.25,
       fontWeight: 600,
       textTransform: 'none',
       fontSize: '0.95rem',
       '&:hover': { bgcolor: '#B91C1C' },
      }}
     >
      {isMutating ? 'กำลังลบ...' : 'ยืนยันการลบ'}
     </Button>

     <Button
      fullWidth
      variant='outlined'
      disabled={isMutating}
      onClick={onClose}
      sx={{
       borderColor: '#E2E8F0',
       color: '#1E293B',
       borderRadius: '8px',
       py: 1.25,
       fontWeight: 600,
       textTransform: 'none',
       fontSize: '0.95rem',
       '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
      }}
     >
      ยกเลิก
     </Button>
    </Box>
   </DialogContent>
  </Dialog>
 )
}
