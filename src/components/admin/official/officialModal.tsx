'use client'

import { useOfficialDetail } from '@/apis/officials/getOfficialDetail'
import { useOfficialCreate } from '@/apis/officials/postOfficialCreate'
import { useOfficialUpdate } from '@/apis/officials/putOfficialUpdate'
import { useSnackBarNotification } from '@/hooks'
import { OfficialType } from '@/types'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import {
 Box,
 Button,
 CircularProgress,
 Dialog,
 DialogContent,
 DialogTitle,
 Grid,
 Link,
 styled,
 Typography,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { ChangeEvent, useEffect, useState } from 'react'
import {
 FormContainer,
 SelectElement,
 TextFieldElement,
 useForm,
} from 'react-hook-form-mui'
import { DatePickerElement } from 'react-hook-form-mui/date-pickers'

const UploadBox = styled(Box)(({ theme }) => ({
 border: `1px solid ${theme.palette.divider}`,
 borderRadius: '8px',
 padding: '20px 24px',
 backgroundColor: '#fafbfc',
 display: 'flex',
 flexDirection: 'column',
 gap: '14px',
}))

const Label = styled(Typography)(({ theme }) => ({
 fontSize: '0.875rem',
 fontWeight: 600,
 color: theme.palette.text.secondary,
 marginBottom: '6px',
}))

const genderOptions = [
 { id: 'ชาย', label: 'ชาย' },
 { id: 'หญิง', label: 'หญิง' },
 { id: 'อื่นๆ', label: 'อื่นๆ' },
]

const positionOptions = [
 { id: 'พยาบาลวิชาชีพ', label: 'พยาบาลวิชาชีพ' },
 { id: 'แพทย์', label: 'แพทย์' },
 { id: 'เภสัชกร', label: 'เภสัชกร' },
 { id: 'นักเทคนิคการแพทย์', label: 'นักเทคนิคการแพทย์' },
 { id: 'เจ้าหน้าที่เวชกิจฉุกเฉิน', label: 'เจ้าหน้าที่เวชกิจฉุกเฉิน' },
]

const competencyOptions = [
 { id: 'Novice', label: 'Novice' },
 { id: 'Advanced Beginner', label: 'Advanced Beginner' },
 { id: 'Competent', label: 'Competent' },
 { id: 'Proficient', label: 'Proficient' },
 { id: 'Expert', label: 'Expert' },
]

type OfficialModalProps = {
 open: boolean
 onClose: () => void
 onSuccess?: () => void
 data?: { objectUuId?: string; id?: string; _id?: string; [key: string]: any } | null
}

export const OfficialModal = ({
 open,
 onClose,
 onSuccess,
 data,
}: OfficialModalProps) => {
 const targetId = data?.objectUuId || data?._id || data?.id
 const isEdit = Boolean(targetId)

 const { mutate: createMutate, isMutating: isCreating } = useOfficialCreate()
 const { mutate: updateMutate, isMutating: isUpdating } = useOfficialUpdate()
 const { data: detailResponse, isLoading: isLoadingDetail } = useOfficialDetail(targetId)
 const { showSnackbar } = useSnackBarNotification()

 const form = useForm<any>({
  defaultValues: {
   fullName: '',
   age: '',
   gender: 'ชาย',
   position: 'พยาบาลวิชาชีพ',
   competencyLevel: 'Competent',
   licenseNumber: '',
   licenseExpiryDate: null,
   phoneNumber: '',
   licenseDocumentUrl: '',
  },
 })

 const [fileName, setFileName] = useState<string>('No file chosen')
 const [documentUrl, setDocumentUrl] = useState<string>('')

 useEffect(() => {
  if (open && isEdit && detailResponse?.data) {
   const detail = detailResponse.data
   form.reset({
    fullName: detail.fullName || '',
    age: detail.age ?? '',
    gender: detail.gender || 'ชาย',
    position: detail.position || 'พยาบาลวิชาชีพ',
    competencyLevel: detail.competencyLevel || 'Competent',
    licenseNumber: detail.licenseNumber || '',
    licenseExpiryDate: detail.licenseExpiryDate ? dayjs(detail.licenseExpiryDate) : null,
    phoneNumber: detail.phoneNumber || '',
    licenseDocumentUrl: detail.licenseDocumentUrl || '',
   })

   if (detail.licenseDocumentUrl) {
    setDocumentUrl(detail.licenseDocumentUrl)
    const urlParts = detail.licenseDocumentUrl.split('/')
    setFileName(decodeURIComponent(urlParts[urlParts.length - 1] || 'license_document.pdf'))
   }
  } else if (open && !isEdit) {
   form.reset({
    fullName: '',
    age: '',
    gender: 'ชาย',
    position: 'พยาบาลวิชาชีพ',
    competencyLevel: 'Competent',
    licenseNumber: '',
    licenseExpiryDate: null,
    phoneNumber: '',
    licenseDocumentUrl: 'https://example.com/docs/license_123.pdf',
   })
   setFileName('No file chosen')
   setDocumentUrl('')
  }
 }, [open, isEdit, detailResponse, form])

 const handleClose = () => {
  form.reset()
  setFileName('No file chosen')
  setDocumentUrl('')
  onClose()
 }

 const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file) {
   setFileName(file.name)
   // ponytail: mock storage URL to fulfill URI requirement for single-file operation mode
   const simulatedUrl = `https://example.com/docs/${encodeURIComponent(file.name)}`
   setDocumentUrl(simulatedUrl)
   form.setValue('licenseDocumentUrl', simulatedUrl)
  }
 }

 const handleSubmit = async (formData: any) => {
  const formattedExpiry = formData.licenseExpiryDate
   ? dayjs(formData.licenseExpiryDate).toISOString()
   : new Date().toISOString()

  const payload: OfficialType = {
   ...formData,
   age: Number(formData.age),
   licenseExpiryDate: formattedExpiry,
   licenseDocumentUrl: formData.licenseDocumentUrl || documentUrl || 'https://example.com/docs/license_123.pdf',
  }

  if (isEdit && targetId) {
   await updateMutate(
    { id: targetId, data: payload },
    {
     onSuccess: () => {
      showSnackbar('อัปเดตข้อมูลบุคลากรสำเร็จ', 'success')
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
     showSnackbar('ลงทะเบียนบุคลากรสำเร็จ', 'success')
     onSuccess?.()
     handleClose()
    },
    onError: (error: any) => {
     showSnackbar(error.message || 'เกิดข้อผิดพลาดในการลงทะเบียนบุคลากร', 'error')
    },
   })
  }
 }

 const isSubmitting = isCreating || isUpdating

 return (
  <Dialog
   open={open}
   onClose={handleClose}
   maxWidth='md'
   fullWidth
   sx={{
    '& .MuiDialog-paper': {
     borderRadius: '12px',
     p: 1,
    },
   }}
  >
   <LocalizationProvider dateAdapter={AdapterDayjs}>
    <FormContainer formContext={form} onSuccess={handleSubmit}>
     <DialogTitle sx={{ pb: 1 }}>
      <Typography variant='h6' sx={{ fontWeight: 700, color: 'text.primary' }}>
       {isEdit ? 'แก้ไขข้อมูลบุคลากร' : 'ลงทะเบียนบุคลากร'}
      </Typography>
     </DialogTitle>

     <DialogContent sx={{ pt: '8px !important' }}>
      {isEdit && isLoadingDetail ? (
       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress size={32} sx={{ color: '#0da176' }} />
       </Box>
      ) : (
       <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
         <Label>ชื่อจริง - นามสกุล *</Label>
         <TextFieldElement
          name='fullName'
          placeholder='พว. ...'
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
         <Label>อายุ (ปี) *</Label>
         <TextFieldElement
          name='age'
          type='number'
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
         <Label>เพศ *</Label>
         <SelectElement
          name='gender'
          options={genderOptions}
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
         <Label>ตำแหน่งทางการศึกษา/วิชาชีพ *</Label>
         <SelectElement
          name='position'
          options={positionOptions}
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
         <Label>ระดับสมรรถนะ (COMPETENCY LEVEL) *</Label>
         <SelectElement
          name='competencyLevel'
          options={competencyOptions}
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
         <Label>เลขที่ใบอนุญาตประกอบโรคศิลป์ *</Label>
         <TextFieldElement
          name='licenseNumber'
          placeholder='ว.XXXXXX'
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
         <Label>วันหมดอายุใบอนุญาตประกอบโรคฯ *</Label>
         <DatePickerElement
          name='licenseExpiryDate'
          format='DD/MM/YYYY'
          sx={{ width: '100%' }}
          required
         />
        </Grid>

        <Grid size={{ xs: 12 }}>
         <Label>เบอร์โทรศัพท์เจ้าหน้าที่ *</Label>
         <TextFieldElement
          name='phoneNumber'
          placeholder='0XX-XXXXXXX'
          fullWidth
          required
          size='small'
         />
        </Grid>

        <Grid size={{ xs: 12 }}>
         <UploadBox>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           <PictureAsPdfIcon sx={{ color: '#e53935', fontSize: '1.25rem' }} />
           <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
            อัปโหลดแนบไฟล์ PDF หลักฐานใบประกอบวิชาชีพ *
           </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
           <Button
            variant='contained'
            component='label'
            sx={{
             bgcolor: '#eafaf1',
             color: '#0d896b',
             boxShadow: 'none',
             textTransform: 'none',
             fontWeight: 600,
             borderRadius: '6px',
             px: 2,
             py: 0.75,
             '&:hover': { bgcolor: '#d4f5e3', boxShadow: 'none' },
            }}
           >
            Choose File
            <input
             type='file'
             hidden
             accept='application/pdf'
             onChange={handleFileUpload}
            />
           </Button>

           <Typography variant='body2' color='text.secondary'>
            {fileName}
           </Typography>

           {documentUrl && (
            <Link
             href={documentUrl}
             target='_blank'
             rel='noopener noreferrer'
             sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.85rem',
              color: '#0d896b',
              fontWeight: 500,
             }}
            >
             เปิดดูเอกสาร <OpenInNewIcon sx={{ fontSize: '1rem' }} />
            </Link>
           )}
          </Box>

          <Typography variant='caption' color='text.disabled'>
           * เพื่อรองรับการทำงานแบบ Single-File แฟ้มเอกสารจะถูกบันทึกเชิงจำลองภายในแอปพลิเคชันโดยอัตโนมัติ
          </Typography>
         </UploadBox>
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ mt: 1.5 }}>
         <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
           type='submit'
           variant='contained'
           fullWidth
           disabled={isSubmitting}
           sx={{
            bgcolor: '#0da176',
            borderRadius: '8px',
            py: 1.25,
            fontSize: '0.95rem',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: '#0b8a64' },
           }}
          >
           {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลบุคลากร'}
          </Button>

          <Button
           variant='outlined'
           fullWidth
           disabled={isSubmitting}
           onClick={handleClose}
           sx={{
            borderRadius: '8px',
            py: 1.25,
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#374151',
            borderColor: '#e2e8f0',
            textTransform: 'none',
            '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
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
