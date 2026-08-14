'use client'
import { useOfficialCreate } from '@/apis/officials/postOfficialCreate'
import { useSnackBarNotification } from '@/hooks'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import {
 Box,
 Button,
 Dialog,
 DialogContent,
 DialogTitle,
 Grid,
 Stack,
 styled,
 Typography,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useState } from 'react'
import {
 FormContainer,
 SelectElement,
 TextFieldElement,
 useForm,
 //  DatePickerElement,
} from 'react-hook-form-mui'
import { DatePickerElement } from 'react-hook-form-mui/date-pickers'

const UploadBox = styled(Box)(({ theme }) => ({
 border: `1px dashed ${theme.palette.divider}`,
 borderRadius: '8px',
 padding: '24px',
 backgroundColor: '#fbfbfb',
 display: 'flex',
 flexDirection: 'column',
 gap: '16px',
}))

const Label = styled(Typography)(({ theme }) => ({
 fontSize: '0.875rem',
 fontWeight: 600,
 color: theme.palette.text.secondary,
 marginBottom: '8px',
}))

const genderOptions = [
 { id: 'ชาย', label: 'ชาย' },
 { id: 'หญิง', label: 'หญิง' },
]

const positionOptions = [
 { id: 'พยาบาลวิชาชีพ', label: 'พยาบาลวิชาชีพ' },
 { id: 'แพทย์', label: 'แพทย์' },
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
 data?: any // คุณสามารถปรับประเภทของ data ตามความต้องการของคุณ
}

export const OfficialModal = ({ open, onClose, data }: OfficialModalProps) => {
 const { mutate, isMutating } = useOfficialCreate()
 const { showSnackbar } = useSnackBarNotification()
 const form = useForm<any>()
 const [fileName, setFileName] = useState<string>('No file chosen')

 const handleSubmit = (formData: any) => {
  mutate(formData, {
   onSuccess: (response) => {
    showSnackbar('ลงทะเบียนบุคลากรสำเร็จ', 'success')
    console.log('Response from API:', response)

    handleClose()
   },
   onError: (error) => {
    showSnackbar('เกิดข้อผิดพลาดในการลงทะเบียนบุคลากร', 'error')
    console.error('Error from API:', error)
   },
  })
 }
 const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files && event.target.files.length > 0) {
   setFileName(event.target.files[0].name)
  }
 }

 const handleClose = () => {
  form.reset({})
  setFileName('No file chosen')
  onClose()
 }

 return (
  <>
   <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
     <FormContainer formContext={form} onSuccess={handleSubmit}>
      <DialogTitle>
       <Typography variant='h6' sx={{ fontWeight: 600 }}>
        ลงทะเบียนบุคลากร
       </Typography>
      </DialogTitle>
      <DialogContent>
       <Grid container spacing={3}>
        {/* --- แถวที่ 1 --- */}
        <Grid
         size={{
          xs: 12,
          md: 6,
         }}
        >
         <Label>ชื่อจริง - นามสกุล *</Label>
         <TextFieldElement
          name='fullName'
          placeholder='พว. ...'
          fullWidth
          required
          size='small'
         />
        </Grid>
        <Grid
         size={{
          xs: 12,
          md: 3,
         }}
        >
         <Label>อายุ (ปี) *</Label>
         <TextFieldElement
          name='age'
          type='number'
          fullWidth
          required
          size='small'
         />
        </Grid>
        <Grid
         size={{
          xs: 12,
          md: 3,
         }}
        >
         <Label>เพศ *</Label>
         <SelectElement
          name='gender'
          options={genderOptions}
          fullWidth
          required
          size='small'
         />
        </Grid>

        {/* --- แถวที่ 2 --- */}
        <Grid
         size={{
          xs: 12,
          md: 6,
         }}
        >
         <Label>ตำแหน่งทางการศึกษา/วิชาชีพ *</Label>
         <SelectElement
          name='position'
          options={positionOptions}
          fullWidth
          required
          size='small'
         />
        </Grid>
        <Grid
         size={{
          xs: 12,
          md: 6,
         }}
        >
         <Label>ระดับสมรรถนะ (COMPETENCY LEVEL) *</Label>
         <SelectElement
          name='competencyLevel'
          options={competencyOptions}
          fullWidth
          required
          size='small'
         />
        </Grid>

        {/* --- แถวที่ 3 --- */}
        <Grid
         size={{
          xs: 12,
          md: 6,
         }}
        >
         <Label>เลขที่ใบอนุญาตประกอบโรคศิลป์ *</Label>
         <TextFieldElement
          name='licenseNumber'
          placeholder='ว.XXXXXX'
          fullWidth
          required
          size='small'
         />
        </Grid>
        <Grid
         size={{
          xs: 12,
          md: 6,
         }}
        >
         <Label>วันหมดอายุใบอนุญาตประกอบโรคฯ *</Label>
         <DatePickerElement
          name='licenseExpiry'
          format='DD/MM/YYYY'
          sx={{
           '& .MuiInputBase-root': {
            size: 'small',
           },
          }}
          required
         />
        </Grid>

        {/* --- แถวที่ 4 --- */}
        <Grid
         size={{
          xs: 12,
         }}
        >
         <Label>เบอร์โทรศัพท์เจ้าหน้าที่ *</Label>
         <TextFieldElement
          name='phone'
          placeholder='0XX-XXXXXXX'
          fullWidth
          required
          size='small'
         />
        </Grid>

        {/* --- แถวที่ 5: อัปโหลดไฟล์ --- */}
        <Grid
         size={{
          xs: 12,
         }}
        >
         <UploadBox>
          <Stack
           direction='row'
           sx={{
            alignItems: 'center',
           }}
           spacing={1}
          >
           <PictureAsPdfIcon color='error' />
           <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
            อัปโหลดแนบไฟล์ PDF หลักฐานใบประกอบวิชาชีพ *
           </Typography>
          </Stack>

          <Stack
           direction='row'
           sx={{
            alignItems: 'center',
           }}
           spacing={2}
          >
           <Button
            variant='contained'
            component='label'
            sx={{
             bgcolor: '#eafaf1',
             color: '#0d896b',
             boxShadow: 'none',
             textTransform: 'none',
             fontWeight: 600,
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
          </Stack>

          <Typography variant='caption' color='text.disabled'>
           * เพื่อรองรับการทำงานแบบ Single-File
           แฟ้มเอกสารจะถูกบันทึกเชิงจำลองภายในแอปพลิเคชันโดยอัตโนมัติ
          </Typography>
         </UploadBox>
        </Grid>

        {/* --- ปุ่ม Action --- */}
        <Grid
         size={{
          xs: 12,
         }}
         sx={{ mt: 2 }}
        >
         <Stack direction='row' spacing={2}>
          <Button
           type='submit'
           variant='contained'
           fullWidth
           sx={{
            bgcolor: '#139e82',
            borderRadius: '8px',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': { bgcolor: '#0f826a' },
           }}
          >
           บันทึกข้อมูลบุคลากร
          </Button>
          <Button
           variant='outlined'
           fullWidth
           sx={{
            borderRadius: '8px',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            color: '#333',
            borderColor: '#ddd',
           }}
           onClick={handleClose}
          >
           ยกเลิก
          </Button>
         </Stack>
        </Grid>
       </Grid>
      </DialogContent>
     </FormContainer>
    </LocalizationProvider>
   </Dialog>
  </>
 )
}
