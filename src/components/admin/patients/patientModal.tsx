'use client'

import { usePatientCreate, usePatientDetail, usePatientUpdate } from '@/apis/patients'
import { useSnackBarNotification } from '@/hooks'
import { AdmissionType, PatientStatus, PatientType } from '@/types'
import {
 Box,
 Button,
 CircularProgress,
 Dialog,
 DialogContent,
 DialogTitle,
 Grid,
 Typography,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import {
 FormContainer,
 SelectElement,
 TextFieldElement,
 useForm,
} from 'react-hook-form-mui'
import { DatePickerElement } from 'react-hook-form-mui/date-pickers'

const ALL_BEDS = Array.from({ length: 10 }, (_, i) => ({
 id: `เตียงที่ ${i + 1}`,
 label: `เตียงที่ ${i + 1}`,
}))

const admissionTypeOptions = [
 { id: 'admit', label: 'รับใหม่ (Admit)' },
 { id: 'transfer', label: 'รับย้าย (Transfer)' },
 { id: 'refer', label: 'Fastack (Refer)' },
]

const statusOptions = [
 { id: 'admitted', label: 'กำลังรักษา (Admitted)' },
 { id: 'discharged', label: 'จำหน่ายออก (Discharged)' },
]

type PatientModalProps = {
 open: boolean
 onClose: () => void
 onSuccess?: () => void
 data?: PatientType | null
 activePatients?: PatientType[]
}

type PatientFormFields = {
 bedNumber: string
 hn: string
 an: string
 admissionType: AdmissionType
 patientName: string
 diagnosis: string
 attendingDoctor: string
 hometown: string
 admissionDate: any
 status: PatientStatus
}

export const PatientModal = ({
 open,
 onClose,
 onSuccess,
 data,
 activePatients = [],
}: PatientModalProps) => {
 const targetId = data?.objectUuId || data?._id
 const isEdit = Boolean(targetId)

 const { mutate: createMutate, isMutating: isCreating } = usePatientCreate()
 const { mutate: updateMutate, isMutating: isUpdating } = usePatientUpdate()
 const { data: detailResponse, isLoading: isLoadingDetail } = usePatientDetail(targetId)
 const { showSnackbar } = useSnackBarNotification()

 const form = useForm<PatientFormFields>({
  defaultValues: {
   bedNumber: '',
   hn: '',
   an: '',
   admissionType: 'admit',
   patientName: '',
   diagnosis: '',
   attendingDoctor: '',
   hometown: '',
   admissionDate: null,
   status: 'admitted',
  },
 })

 const availableBedOptions = useMemo(() => {
  const occupiedBedSet = new Set(
   activePatients
    .filter(
     (p) =>
      p.status === 'admitted' &&
      p.objectUuId !== targetId &&
      p._id !== targetId,
    )
    .map((p) => p.bedNumber),
  )

  return ALL_BEDS.filter(
   (bed) => !occupiedBedSet.has(bed.id) || (isEdit && bed.id === data?.bedNumber),
  )
 }, [activePatients, targetId, isEdit, data?.bedNumber])

 useEffect(() => {
  if (open && isEdit && detailResponse?.data) {
   const detail = detailResponse.data
   form.reset({
    bedNumber: detail.bedNumber || '',
    hn: detail.hn || '',
    an: detail.an || '',
    admissionType: detail.admissionType || 'admit',
    patientName: detail.patientName || '',
    diagnosis: detail.diagnosis || '',
    attendingDoctor: detail.attendingDoctor || '',
    hometown: detail.hometown || '',
    admissionDate: detail.admissionDate ? dayjs(detail.admissionDate) : null,
    status: detail.status || 'admitted',
   })
  } else if (open && !isEdit) {
   form.reset({
    bedNumber: availableBedOptions[0]?.id || '',
    hn: '',
    an: '',
    admissionType: 'admit',
    patientName: '',
    diagnosis: '',
    attendingDoctor: '',
    hometown: '',
    admissionDate: dayjs(),
    status: 'admitted',
   })
  }
 }, [open, isEdit, detailResponse, form, availableBedOptions])

 const handleClose = () => {
  form.reset()
  onClose()
 }

 const handleSubmit = async (formData: PatientFormFields) => {
  const formattedDate = formData.admissionDate
   ? dayjs(formData.admissionDate).toISOString()
   : new Date().toISOString()

  const payload = {
   bedNumber: formData.bedNumber,
   hn: formData.hn.trim(),
   an: formData.an.trim(),
   admissionType: formData.admissionType,
   patientName: formData.patientName.trim(),
   diagnosis: formData.diagnosis.trim(),
   attendingDoctor: formData.attendingDoctor.trim(),
   hometown: formData.hometown.trim(),
   admissionDate: formattedDate,
   status: formData.status,
  }

  if (isEdit && targetId) {
   await updateMutate(
    { id: targetId, data: payload },
    {
     onSuccess: () => {
      showSnackbar('อัปเดตข้อมูลผู้ป่วยสำเร็จ', 'success')
      onSuccess?.()
      handleClose()
     },
     onError: (error: any) => {
      showSnackbar(error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', 'error')
     },
    },
   )
  } else {
   await createMutate(payload, {
    onSuccess: () => {
     showSnackbar('ลงทะเบียนผู้ป่วยสำเร็จ', 'success')
     onSuccess?.()
     handleClose()
    },
    onError: (error: any) => {
     showSnackbar(error.message || 'เกิดข้อผิดพลาดในการลงทะเบียนผู้ป่วย', 'error')
    },
   })
  }
 }

 const isSubmitting = isCreating || isUpdating

 const dialogTitle = isEdit
  ? `แบบฟอร์มปรับปรุงประวัติการรักษาผู้ป่วย ${data?.bedNumber || ''}`
  : 'แบบฟอร์มลงทะเบียนรับรักษาผู้ป่วยวิกฤต'

 return (
  <Dialog
   open={open}
   onClose={handleClose}
   maxWidth='lg'
   fullWidth
   sx={{
    '& .MuiDialog-paper': {
     borderRadius: '16px',
     p: 1.5,
    },
   }}
  >
   <LocalizationProvider dateAdapter={AdapterDayjs}>
    <FormContainer formContext={form} onSuccess={handleSubmit}>
     <DialogTitle sx={{ pb: 1 }}>
      <Typography variant='h6' sx={{ fontWeight: 700, color: '#1E293B' }}>
       {dialogTitle}
      </Typography>
     </DialogTitle>

     <DialogContent sx={{ pt: '12px !important' }}>
      {isEdit && isLoadingDetail ? (
       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={32} sx={{ color: '#0da176' }} />
       </Box>
      ) : (
       <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
         <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
          ระบุหมายเลขเตียง *
         </Typography>
         <SelectElement
          name='bedNumber'
          options={availableBedOptions}
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
         <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
          หมายเลข HN *
         </Typography>
         <TextFieldElement
          name='hn'
          placeholder='HN-XXXXX'
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
         <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
          หมายเลข AN *
         </Typography>
         <TextFieldElement
          name='an'
          placeholder='AN-XXXXX'
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
         <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
          ประเภทการรับเข้า *
         </Typography>
         <SelectElement
          name='admissionType'
          options={admissionTypeOptions}
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
         <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
          ชื่อจริง - นามสกุลผู้ป่วย *
         </Typography>
         <TextFieldElement
          name='patientName'
          placeholder='นาย/นาง/นางสาว...'
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
         <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
          การวินิจฉัยโรคเบื้องต้น (DX.) *
         </Typography>
         <TextFieldElement
          name='diagnosis'
          placeholder='เช่น Septic Shock, Pneumonia'
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
         <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
          แพทย์เจ้าของไข้ *
         </Typography>
         <TextFieldElement
          name='attendingDoctor'
          placeholder='เช่น นพ.สมชาย เกียรติแพทย์'
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
         <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
          ภูมิลำเนา (จังหวัด/อำเภอ) *
         </Typography>
         <TextFieldElement
          name='hometown'
          placeholder='ระบุจังหวัด/อำเภอ'
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
         <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
          วันที่เข้ารับการรักษา MICU3 *
         </Typography>
         <DatePickerElement
          name='admissionDate'
          format='DD/MM/YYYY'
          sx={{ width: '100%' }}
          required
         />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
         <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
          สถานะการรักษา *
         </Typography>
         <SelectElement
          name='status'
          options={statusOptions}
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
         <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
           type='submit'
           variant='contained'
           disabled={isSubmitting}
           sx={{
            bgcolor: '#0da176',
            borderRadius: '8px',
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: '#0b8a64' },
           }}
          >
           {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลผู้ป่วย'}
          </Button>

          <Button
           variant='outlined'
           disabled={isSubmitting}
           onClick={handleClose}
           sx={{
            borderColor: '#E2E8F0',
            color: '#1E293B',
            borderRadius: '8px',
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
           }}
          >
           ยกเลิก
          </Button>
         </Box>
        </Grid>
       </Grid>
      )}
     </DialogContent>
    </FormContainer>
   </LocalizationProvider>
  </Dialog>
 )
}
