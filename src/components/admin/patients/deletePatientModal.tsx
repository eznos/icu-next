'use client'

import { usePatientDelete } from '@/apis/patients'
import { useSnackBarNotification } from '@/hooks'
import { PatientType } from '@/types'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material'

type DeletePatientModalProps = {
 open: boolean
 onClose: () => void
 onSuccess?: () => void
 data?: PatientType | null
}

export const DeletePatientModal = ({
 open,
 onClose,
 onSuccess,
 data,
}: DeletePatientModalProps) => {
 const { mutate, isMutating } = usePatientDelete()
 const { showSnackbar } = useSnackBarNotification()

 const targetId = data?.objectUuId || data?._id

 const handleConfirm = async () => {
  if (!targetId) return

  await mutate(targetId, {
   onSuccess: () => {
    showSnackbar('ลบข้อมูลผู้ป่วยสำเร็จ', 'success')
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
      bgcolor: (theme) =>
       theme.palette.mode === 'dark'
        ? 'rgba(245, 158, 11, 0.15)'
        : '#FEF9C3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mx: 'auto',
      mb: 2.5,
     }}
    >
     <WarningRoundedIcon sx={{ fontSize: 36, color: '#F59E0B' }} />
    </Box>

    <Typography variant='h6' sx={{ fontWeight: 700, color: 'text.primary', mb: 1.25 }}>
     ลบประวัติผู้ป่วย {data?.bedNumber || ''}?
    </Typography>

    <Typography
     variant='body2'
     sx={{
      color: 'text.secondary',
      lineHeight: 1.6,
      mb: 3.5,
      px: 1,
     }}
    >
     คุณแน่ใจหรือไม่ที่จะทำการลบข้อมูลผู้ป่วย {data?.patientName || 'ท่านนี้'} (HN: {data?.hn || '-'}) ออกจากระบบประวัติการรักษา?
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
       borderColor: 'divider',
       color: 'text.primary',
       borderRadius: '8px',
       py: 1.25,
       fontWeight: 600,
       textTransform: 'none',
       fontSize: '0.95rem',
       '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
      }}
     >
      ยกเลิก
     </Button>
    </Box>
   </DialogContent>
  </Dialog>
 )
}
