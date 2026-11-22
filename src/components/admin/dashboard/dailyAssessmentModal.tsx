'use client'

import {
 DailyAssessmentData,
 useSaveAssessment,
} from '@/apis/assessment'
import { useSnackBarNotification } from '@/hooks'
import {
 Box,
 Button,
 Dialog,
 DialogContent,
 DialogTitle,
 Divider,
 FormControl,
 FormControlLabel,
 FormLabel,
 Grid,
 MenuItem,
 Select,
 Switch,
 TextField,
 Typography,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export type BedPatientTarget = {
 patientId: string
 an: string
 hn: string
 patientName: string
 bedNumber: string
 ward?: string
}

type DailyAssessmentModalProps = {
 open: boolean
 onClose: () => void
 onSuccess?: () => void
 patient: BedPatientTarget | null
 initialData?: DailyAssessmentData | null
}

export const DailyAssessmentModal = ({
 open,
 onClose,
 onSuccess,
 patient,
 initialData,
}: DailyAssessmentModalProps) => {
 const { showSnackbar } = useSnackBarNotification()
 const { saveAssessment, isSubmitting } = useSaveAssessment()

 const [recordDate, setRecordDate] = useState(dayjs().format('YYYY-MM-DDTHH:mm'))
 const [hasVentilator, setHasVentilator] = useState(false)
 const [hasCentralLine, setHasCentralLine] = useState(false)
 const [hasFoleyCatheter, setHasFoleyCatheter] = useState(false)
 const [hasVap, setHasVap] = useState(false)
 const [hasClabsi, setHasClabsi] = useState(false)
 const [hasCauti, setHasCauti] = useState(false)
 const [unplannedExtubation, setUnplannedExtubation] = useState(0)
 const [pressureInjuryStage, setPressureInjuryStage] = useState<'none' | 'stage2' | 'stage3' | 'stage4' | 'unstageable'>('none')
 const [medicationErrorGradeEUp, setMedicationErrorGradeEUp] = useState(0)
 const [note, setNote] = useState('')

 const [isNewRound, setIsNewRound] = useState(false)

 useEffect(() => {
  if (open) {
   setIsNewRound(!initialData)
   if (initialData) {
    setRecordDate(
     initialData.recordDate
      ? dayjs(initialData.recordDate).format('YYYY-MM-DDTHH:mm')
      : dayjs().format('YYYY-MM-DDTHH:mm'),
    )
    setHasVentilator(Boolean(initialData.hasVentilator))
    setHasCentralLine(Boolean(initialData.hasCentralLine))
    setHasFoleyCatheter(Boolean(initialData.hasFoleyCatheter))
    setHasVap(Boolean(initialData.hasVap))
    setHasClabsi(Boolean(initialData.hasClabsi))
    setHasCauti(Boolean(initialData.hasCauti))
    setUnplannedExtubation(Number(initialData.unplannedExtubation) || 0)
    setPressureInjuryStage(initialData.pressureInjuryStage || 'none')
    setMedicationErrorGradeEUp(Number(initialData.medicationErrorGradeEUp) || 0)
    setNote(initialData.note || '')
   } else {
    setRecordDate(dayjs().format('YYYY-MM-DDTHH:mm'))
    setHasVentilator(false)
    setHasCentralLine(false)
    setHasFoleyCatheter(false)
    setHasVap(false)
    setHasClabsi(false)
    setHasCauti(false)
    setUnplannedExtubation(0)
    setPressureInjuryStage('none')
    setMedicationErrorGradeEUp(0)
    setNote('')
   }
  }
 }, [open, initialData])

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!patient) return

  try {
   await saveAssessment({
    objectUuId: isNewRound ? undefined : initialData?.objectUuId,
    patientId: patient.patientId,
    an: patient.an,
    hn: patient.hn,
    patientName: patient.patientName,
    bedNumber: patient.bedNumber,
    ward: patient.ward || 'MICU3',
    recordDate,
    hasVentilator,
    hasCentralLine,
    hasFoleyCatheter,
    hasVap,
    hasClabsi,
    hasCauti,
    unplannedExtubation,
    pressureInjuryStage,
    medicationErrorGradeEUp,
    note,
   })

   showSnackbar('บันทึกการประเมินเตียงรายวันสำเร็จ', 'success')
   onSuccess?.()
   onClose()
  } catch (error: any) {
   showSnackbar(error.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error')
  }
 }

 if (!patient) return null

 return (
  <Dialog
   open={open}
   onClose={onClose}
   maxWidth='md'
   fullWidth
   sx={{ '& .MuiDialog-paper': { borderRadius: '16px', p: 1 } }}
  >
   <DialogTitle sx={{ pb: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
     <Typography variant='h6' sx={{ fontWeight: 700, color: '#1E293B' }}>
      แบบบันทึกประเมินเตียงประจำวัน ({patient.bedNumber})
     </Typography>
     <Typography variant='caption' sx={{ bgcolor: '#ECFDF5', color: '#047857', px: 1.5, py: 0.5, borderRadius: '6px', fontWeight: 600 }}>
      {patient.ward || 'MICU3'}
     </Typography>
    </Box>
    <Typography variant='body2' sx={{ color: '#64748B', mt: 0.5 }}>
     ผู้ป่วย: {patient.patientName} | HN: {patient.hn} | AN: {patient.an}
    </Typography>
   </DialogTitle>

   <DialogContent sx={{ pt: 1 }}>
    <form onSubmit={handleSubmit}>
     <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
       <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
        วันและเวลาที่ตัดยอดข้อมูล (Record Date & Time)
       </Typography>
       <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
         value={dayjs(recordDate)}
         onChange={(val) => {
          if (val && val.isValid()) {
           setRecordDate(val.format('YYYY-MM-DDTHH:mm'))
          }
         }}
         format='DD/MM/YYYY HH:mm'
         ampm={false}
         slotProps={{
          textField: {
           size: 'small',
           fullWidth: true,
           required: true,
          },
         }}
        />
       </LocalizationProvider>
      </Grid>

      {initialData && (
       <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center', pt: { sm: 3 } }}>
        <FormControlLabel
         control={
          <Switch
           checked={isNewRound}
           onChange={(e) => setIsNewRound(e.target.checked)}
           color='primary'
          />
         }
         label={
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: isNewRound ? '#2563EB' : 'text.secondary' }}>
           {isNewRound ? 'บันทึกเป็นรอบตรวจใหม่ (New Round)' : 'อัปเดตทับรอบเวลาเดิม'}
          </Typography>
         }
        />
       </Grid>
      )}

      <Grid size={{ xs: 12 }}>
       <Divider sx={{ my: 0.5 }}>
        <Typography variant='caption' sx={{ color: '#0da176', fontWeight: 700 }}>
         อุปกรณ์ทางการแพทย์ (คำนวณ Device-Days ตามเกณฑ์ CDC / HA)
        </Typography>
       </Divider>
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
       <FormControlLabel
        control={
         <Switch
          checked={hasVentilator}
          onChange={(e) => setHasVentilator(e.target.checked)}
          color='success'
         />
        }
        label={<Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>เครื่องช่วยหายใจ (Ventilator)</Typography>}
       />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
       <FormControlLabel
        control={
         <Switch
          checked={hasCentralLine}
          onChange={(e) => setHasCentralLine(e.target.checked)}
          color='success'
         />
        }
        label={<Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>สาย Central Line</Typography>}
       />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
       <FormControlLabel
        control={
         <Switch
          checked={hasFoleyCatheter}
          onChange={(e) => setHasFoleyCatheter(e.target.checked)}
          color='success'
         />
        }
        label={<Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>สายสวนปัสสาวะ (Foley)</Typography>}
       />
      </Grid>

      <Grid size={{ xs: 12 }}>
       <Divider sx={{ my: 0.5 }}>
        <Typography variant='caption' sx={{ color: '#b91c1c', fontWeight: 700 }}>
         การติดเชื้อและเหตุการณ์ไม่พึงประสงค์ (Infection & Safety Events)
        </Typography>
       </Divider>
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
       <FormControlLabel
        control={
         <Switch
          checked={hasVap}
          onChange={(e) => setHasVap(e.target.checked)}
          color='error'
         />
        }
        label={<Typography sx={{ fontSize: '0.9rem', color: hasVap ? '#b91c1c' : 'inherit' }}>พบปอดอักเสบ VAP</Typography>}
       />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
       <FormControlLabel
        control={
         <Switch
          checked={hasClabsi}
          onChange={(e) => setHasClabsi(e.target.checked)}
          color='error'
         />
        }
        label={<Typography sx={{ fontSize: '0.9rem', color: hasClabsi ? '#b91c1c' : 'inherit' }}>พบติดเชื้อกระแสเลือด CLABSI</Typography>}
       />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
       <FormControlLabel
        control={
         <Switch
          checked={hasCauti}
          onChange={(e) => setHasCauti(e.target.checked)}
          color='error'
         />
        }
        label={<Typography sx={{ fontSize: '0.9rem', color: hasCauti ? '#b91c1c' : 'inherit' }}>พบติดเชื้อทางเดินปัสสาวะ CAUTI</Typography>}
       />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
       <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
        ท่อช่วยหายใจเลื่อนหลุด (ครั้ง)
       </Typography>
       <TextField
        type='number'
        value={unplannedExtubation}
        onChange={(e) => setUnplannedExtubation(Math.max(0, Number(e.target.value)))}
        fullWidth
        size='small'
        slotProps={{ htmlInput: { min: 0 } }}
       />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
       <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
        แผลกดทับเกิดใหม่ใน ICU
       </Typography>
       <FormControl fullWidth size='small'>
        <Select
         value={pressureInjuryStage}
         onChange={(e) => setPressureInjuryStage(e.target.value as any)}
        >
         <MenuItem value='none'>ไม่มีแผลกดทับเกิดใหม่</MenuItem>
         <MenuItem value='stage2'>ระดับที่ 2 (Stage 2)</MenuItem>
         <MenuItem value='stage3'>ระดับที่ 3 (Stage 3)</MenuItem>
         <MenuItem value='stage4'>ระดับที่ 4 (Stage 4)</MenuItem>
         <MenuItem value='unstageable'>ไม่สามารถระบุระดับได้ (Unstageable)</MenuItem>
        </Select>
       </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
       <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
        ความคลาดเคลื่อนทางยา &gt;= ระดับ E (ครั้ง)
       </Typography>
       <TextField
        type='number'
        value={medicationErrorGradeEUp}
        onChange={(e) => setMedicationErrorGradeEUp(Math.max(0, Number(e.target.value)))}
        fullWidth
        size='small'
        slotProps={{ htmlInput: { min: 0 } }}
       />
      </Grid>

      <Grid size={{ xs: 12 }}>
       <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
        บันทึกเพิ่มเติมทางการพยาบาล
       </Typography>
       <TextField
        multiline
        rows={2}
        placeholder='ระบุข้อสังเกต หรือรายละเอียดอาการ...'
        value={note}
        onChange={(e) => setNote(e.target.value)}
        fullWidth
        size='small'
       />
      </Grid>

      <Grid size={{ xs: 12 }}>
       <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
        <Button
         type='submit'
         variant='contained'
         disabled={isSubmitting}
         sx={{
          bgcolor: '#0da176',
          borderRadius: '8px',
          px: 3,
          fontWeight: 600,
          '&:hover': { bgcolor: '#0b8a64' },
         }}
        >
         {isSubmitting
          ? 'กำลังบันทึก...'
          : isNewRound
          ? 'บันทึกการประเมินรอบใหม่'
          : 'อัปเดตการประเมินรอบนี้'}
        </Button>
        <Button
         variant='outlined'
         onClick={onClose}
         disabled={isSubmitting}
         sx={{ borderRadius: '8px', px: 3, color: 'text.secondary', borderColor: 'divider' }}
        >
         ยกเลิก
        </Button>
       </Box>
      </Grid>
     </Grid>
    </form>
   </DialogContent>
  </Dialog>
 )
}
