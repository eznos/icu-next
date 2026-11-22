'use client'

import { PortalHeaderConfig, updatePortalHeader } from '@/apis/content'
import { useSnackBarNotification } from '@/hooks'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { FormContainer, TextFieldElement, useForm } from 'react-hook-form-mui'

export interface PortalHeaderFormFields {
  badgeText: string
  title: string
  description: string
  visitingHoursLabel: string
  visitingHours: string
  safetyMeasuresLabel: string
  safetyMeasures: string
  guidelinesTitle: string
  guidelinesText: string
  emergencyPhone: string
}

const DEFAULT_HEADER_VALUES: PortalHeaderFormFields = {
  badgeText: 'บริการสารสนเทศและประชาสัมพันธ์สำหรับญาติผู้ป่วย',
  title: 'หออภิบาลผู้ป่วยวิกฤตอายุรกรรม (MICU)',
  description:
    'ศูนย์รวมข้อมูลระเบียบการเข้าเยี่ยม คำแนะนำการปฏิบัติตัวสำหรับครอบครัว และสาระความรู้ในการร่วมมือดูแลฟื้นฟูสุขภาพผู้ป่วยวิกฤตตามมาตรฐานความปลอดภัยสากล',
  visitingHoursLabel: 'เวลาเข้าเยี่ยมผู้ป่วย',
  visitingHours: '12:00 - 13:00 น. | 17:00 - 19:00 น.',
  safetyMeasuresLabel: 'มาตรการความปลอดภัย',
  safetyMeasures: 'ล้างมือก่อนเข้า-ออก | สวมหน้ากากอนามัย',
  guidelinesTitle: 'ข้อพึงปฏิบัติสำคัญ',
  guidelinesText: 'เข้าเยี่ยมเตียงละไม่เกิน 2 ท่าน พร้อมกัน\nงดถ่ายภาพและบันทึกวิดีโอเพื่อคุ้มครองสิทธิผู้ป่วย\nติดต่อสอบถามข้อมูลอาการได้ที่เคาน์เตอร์พยาบาล',
  emergencyPhone: 'สายด่วน ICU: 02-xxx-xxxx ต่อ 1234',
}

interface PortalHeaderModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: PortalHeaderConfig | null
}

export function PortalHeaderModal({
  open,
  onClose,
  onSuccess,
  initialData,
}: PortalHeaderModalProps) {
  const { showSnackbar } = useSnackBarNotification()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<PortalHeaderFormFields>({
    defaultValues: DEFAULT_HEADER_VALUES,
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          badgeText: initialData.badgeText || '',
          title: initialData.title || '',
          description: initialData.description || '',
          visitingHoursLabel: initialData.visitingHoursLabel || 'เวลาเข้าเยี่ยมผู้ป่วย',
          visitingHours: initialData.visitingHours || '',
          safetyMeasuresLabel: initialData.safetyMeasuresLabel || 'มาตรการความปลอดภัย',
          safetyMeasures: initialData.safetyMeasures || '',
          guidelinesTitle: initialData.guidelinesTitle || 'ข้อพึงปฏิบัติสำคัญ',
          guidelinesText: (initialData.guidelines || []).join('\n'),
          emergencyPhone: initialData.emergencyPhone || '',
        })
      } else {
        form.reset(DEFAULT_HEADER_VALUES)
      }
    }
  }, [open, initialData, form])

  const handleSubmit = async (values: PortalHeaderFormFields) => {
    if (!values.title.trim()) {
      showSnackbar('กรุณากรอกหัวข้อหลักของ Header', 'error')
      return
    }

    setIsSaving(true)
    try {
      const guidelinesList = values.guidelinesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      const payload: PortalHeaderConfig = {
        badgeText: values.badgeText.trim(),
        title: values.title.trim(),
        description: values.description.trim(),
        visitingHoursLabel: values.visitingHoursLabel.trim(),
        visitingHours: values.visitingHours.trim(),
        safetyMeasuresLabel: values.safetyMeasuresLabel.trim(),
        safetyMeasures: values.safetyMeasures.trim(),
        guidelinesTitle: values.guidelinesTitle.trim(),
        guidelines: guidelinesList,
        emergencyPhone: values.emergencyPhone.trim(),
      }

      await updatePortalHeader(payload)
      showSnackbar('อัปเดตข้อมูลส่วนหัว Portal เรียบร้อยแล้ว', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      showSnackbar(err.message || 'บันทึกข้อมูลส่วนหัวไม่สำเร็จ', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: '18px', overflow: 'hidden' },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 2,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: 'rgba(13, 148, 136, 0.12)',
              color: '#0D9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EditNoteRoundedIcon fontSize='small' />
          </Box>
          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              แก้ไขข้อมูลส่วนหัวพอร์ทัล (Edit Portal Header)
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              ปรับแต่งข้อความประกาศ เวลาเข้าเยี่ยม และมาตรการสำคัญบนหน้า /portal
            </Typography>
          </Box>
        </Box>
        <IconButton size='small' onClick={onClose}>
          <CloseRoundedIcon fontSize='small' />
        </IconButton>
      </DialogTitle>

      <FormContainer formContext={form} onSuccess={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <TextFieldElement
              name='badgeText'
              fullWidth
              size='small'
              label='ป้ายข้อความบนสุด (Badge Text)'
              placeholder='เช่น บริการสารสนเทศและประชาสัมพันธ์สำหรับญาติผู้ป่วย'
            />

            <TextFieldElement
              name='title'
              required
              fullWidth
              label='หัวข้อหลัก (Title)*'
              placeholder='เช่น หออภิบาลผู้ป่วยวิกฤตอายุรกรรม (MICU)'
            />

            <TextFieldElement
              name='description'
              fullWidth
              multiline
              rows={3}
              label='คำอธิบายย่อย (Description)'
              placeholder='เช่น ศูนย์รวมข้อมูลระเบียบการเข้าเยี่ยม คำแนะนำการปฏิบัติตัวสำหรับครอบครัว...'
            />

            <Divider sx={{ my: 0.5 }} />

            <Typography variant='subtitle2' sx={{ fontWeight: 800, color: '#0D9488' }}>
              กล่องข้อมูลด่วน (Quick Info Boxes)
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldElement
                  name='visitingHoursLabel'
                  fullWidth
                  size='small'
                  label='ป้ายเวลาเข้าเยี่ยม'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextFieldElement
                  name='visitingHours'
                  fullWidth
                  size='small'
                  label='ช่วงเวลาเข้าเยี่ยมผู้ป่วย'
                  placeholder='เช่น 12:00 - 13:00 น. | 17:00 - 19:00 น.'
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldElement
                  name='safetyMeasuresLabel'
                  fullWidth
                  size='small'
                  label='ป้ายมาตรการความปลอดภัย'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextFieldElement
                  name='safetyMeasures'
                  fullWidth
                  size='small'
                  label='รายละเอียดมาตรการความปลอดภัย'
                  placeholder='เช่น ล้างมือก่อนเข้า-ออก | สวมหน้ากากอนามัย'
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant='subtitle2' sx={{ fontWeight: 800, color: '#0D9488' }}>
              กล่องข้อพึงปฏิบัติสำคัญ (Guidelines Card ด้านขวา)
            </Typography>

            <TextFieldElement
              name='guidelinesTitle'
              fullWidth
              size='small'
              label='หัวข้อข้อพึงปฏิบัติ'
              placeholder='เช่น ข้อพึงปฏิบัติสำคัญ'
            />

            <TextFieldElement
              name='guidelinesText'
              fullWidth
              multiline
              rows={4}
              label='รายการข้อปฏิบัติสำคัญ (ขึ้นบรรทัดใหม่ละ 1 ข้อ)'
              placeholder='เช่น เข้าเยี่ยมเตียงละไม่เกิน 2 ท่าน พร้อมกัน'
            />

            <TextFieldElement
              name='emergencyPhone'
              fullWidth
              size='small'
              label='เบอร์ติดต่อ / สายด่วนฉุกเฉิน'
              placeholder='เช่น สายด่วน ICU: 02-xxx-xxxx ต่อ 1234'
            />
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, px: 3, justifyContent: 'space-between' }}>
          <Button onClick={onClose} color='inherit' sx={{ textTransform: 'none' }}>
            ยกเลิก
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isSaving}
            sx={{
              bgcolor: '#0D9488',
              '&:hover': { bgcolor: '#0b8a64' },
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              borderRadius: '8px',
            }}
          >
            {isSaving ? <CircularProgress size={20} color='inherit' /> : 'บันทึกการแก้ไข Header'}
          </Button>
        </DialogActions>
      </FormContainer>
    </Dialog>
  )
}
