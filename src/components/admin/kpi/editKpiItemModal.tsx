'use client'

import {
 AVAILABLE_DENOMINATOR_OPTIONS,
 AVAILABLE_METRIC_DEFINITIONS,
 KpiItem,
 KpiStats,
 updateWardKpi,
} from '@/apis/kpi'
import { useSnackBarNotification } from '@/hooks'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import {
 Box,
 Button,
 Card,
 Chip,
 CircularProgress,
 Dialog,
 DialogActions,
 DialogContent,
 DialogTitle,
 Divider,
 FormControl,
 Grid,
 IconButton,
 InputLabel,
 MenuItem,
 Select,
 Stack,
 Switch,
 TextField,
 Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

type EditKpiItemModalProps = {
 open: boolean
 item: KpiItem | null
 onClose: () => void
 ward: string
 allItems: KpiItem[]
 stats?: KpiStats | null
 onSuccess: () => void
}

export function EditKpiItemModal({
 open,
 item,
 onClose,
 ward,
 allItems,
 stats,
 onSuccess,
}: EditKpiItemModalProps) {
 const { showSnackbar } = useSnackBarNotification()
 const [isSaving, setIsSaving] = useState(false)
 const [formData, setFormData] = useState({
  title: '',
  tag: '',
  targetValue: 0,
  targetDescription: '',
  operator: '<=',
  unit: '',
  numerator: '',
  denominator: 'none',
  multiplier: 1,
  isActive: true,
 })

 useEffect(() => {
  if (item && open) {
   setFormData({
    title: item.title || '',
    tag: item.tag || 'มาตรฐานสำคัญ',
    targetValue: item.targetValue ?? 0,
    targetDescription: item.targetDescription || '',
    operator: item.operator || '<=',
    unit: item.unit || '%',
    numerator: item.numerator || '',
    denominator: item.denominator || 'none',
    multiplier: item.multiplier || 1,
    isActive: item.isActive !== false,
   })
  }
 }, [item, open])

 const rawMetrics = stats?.rawMetrics || {}

 const liveCalculatedValue = useMemo(() => {
  if (!formData.numerator) return null
  const num = rawMetrics[formData.numerator] ?? 0
  const den =
   formData.denominator !== 'none'
    ? (rawMetrics[formData.denominator] ?? 0)
    : null
  const mul = formData.multiplier || 1

  if (den !== null) {
   return den > 0 ? Number(((num / den) * mul).toFixed(2)) : 0
  }
  return Number((num * mul).toFixed(2))
 }, [formData.numerator, formData.denominator, formData.multiplier, rawMetrics])

 const handleSave = async () => {
  if (!item) return
  if (!formData.title.trim()) {
   showSnackbar('กรุณาระบุชื่อตัวชี้วัด', 'error')
   return
  }

  setIsSaving(true)
  try {
   const updatedItems = allItems.map((it) => {
    if (it.code === item.code) {
     return {
      ...it,
      title: formData.title.trim(),
      tag: formData.tag.trim(),
      targetValue: Number(formData.targetValue) || 0,
      targetDescription: formData.targetDescription.trim(),
      operator: formData.operator as '<=' | '>=',
      unit: formData.unit.trim(),
      isActive: formData.isActive,
      ...(formData.numerator
       ? {
          numerator: formData.numerator,
          denominator: formData.denominator,
          multiplier: Number(formData.multiplier) || 1,
         }
       : {}),
     }
    }
    return it
   })

   await updateWardKpi(ward, updatedItems)
   showSnackbar(`บันทึกข้อมูลตัวชี้วัด "${formData.title}" สำเร็จ`, 'success')
   onSuccess()
   onClose()
  } catch (err: any) {
   showSnackbar(err?.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error')
  } finally {
   setIsSaving(false)
  }
 }

 if (!item) return null

 return (
  <Dialog
   open={open}
   onClose={onClose}
   maxWidth='sm'
   fullWidth
   slotProps={{
    paper: {
     sx: {
      borderRadius: '16px',
      overflow: 'hidden',
     },
    },
   }}
  >
   <DialogTitle
    sx={{
     display: 'flex',
     justifyContent: 'space-between',
     alignItems: 'center',
     bgcolor: (theme) =>
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
     borderBottom: '1px solid',
     borderColor: 'divider',
     py: 2,
     px: 3,
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
      <TuneRoundedIcon fontSize='small' />
     </Box>
     <Box>
      <Typography variant='subtitle1' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
       แก้ไขตัวชี้วัด (Edit KPI)
      </Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
       รหัส: {item.code} | หอผู้ป่วย: {ward}
      </Typography>
     </Box>
    </Box>
    <IconButton size='small' onClick={onClose} sx={{ color: 'text.secondary' }}>
     <CloseRoundedIcon fontSize='small' />
    </IconButton>
   </DialogTitle>

   <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
    {/* Active Status Toggle Banner */}
    <Card
     variant='outlined'
     sx={{
      p: 2,
      borderRadius: '12px',
      bgcolor: formData.isActive
       ? (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.08)' : '#F0FDF4'
       : (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2',
      borderColor: formData.isActive ? '#BBF7D0' : '#FECACA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
     }}
    >
     <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
       <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
        สถานะการใช้งานตัวชี้วัดนี้
       </Typography>
       <Chip
        size='small'
        label={formData.isActive ? 'เปิดใช้งาน (Active)' : 'ปิดการใช้งาน (Inactive)'}
        color={formData.isActive ? 'success' : 'default'}
        sx={{ fontWeight: 600, height: 22, fontSize: '0.75rem' }}
       />
      </Box>
      <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
       {formData.isActive
        ? 'ตัวชี้วัดนี้จะแสดงผลบนหน้าแดชบอร์ด KPI ปกติ'
        : 'เมื่อปิดการใช้งาน ตัวชี้วัดนี้จะถูกซ่อนออกจากหน้าแดชบอร์ดหลัก'}
      </Typography>
     </Box>
     <Switch
      checked={formData.isActive}
      onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
      color='success'
     />
    </Card>

    {/* Current Stats Overview */}
    <Card
     variant='outlined'
     sx={{
      p: 2,
      borderRadius: '12px',
      bgcolor: (theme) =>
       theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
     }}
    >
     <Grid container spacing={2}>
      <Grid size={{ xs: 6 }}>
       <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
        สถานการณ์จริงปัจจุบัน
       </Typography>
       <Typography variant='h6' sx={{ fontWeight: 800, color: 'text.primary' }}>
        {item.unit || item.actualValue}
       </Typography>
      </Grid>
      <Grid size={{ xs: 6 }}>
       <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
        ผลการประเมิน
       </Typography>
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        {item.isPassed !== false ? (
         <>
          <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#10B981' }} />
          <Typography variant='body2' sx={{ fontWeight: 700, color: '#10B981' }}>
           ผ่านเกณฑ์
          </Typography>
         </>
        ) : (
         <>
          <ErrorOutlineRoundedIcon sx={{ fontSize: 18, color: '#EF4444' }} />
          <Typography variant='body2' sx={{ fontWeight: 700, color: '#EF4444' }}>
           ไม่ผ่านเกณฑ์
          </Typography>
         </>
        )}
       </Box>
      </Grid>
     </Grid>
    </Card>

    {/* Form Fields */}
    <Stack spacing={2}>
     <TextField
      fullWidth
      label='ชื่อตัวชี้วัด (Title)'
      size='small'
      value={formData.title}
      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
     />

     <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
       <TextField
        fullWidth
        label='หมวดหมู่ (Tag)'
        size='small'
        value={formData.tag}
        onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
        placeholder='เช่น การบริหารเตียง, ความปลอดภัย'
       />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
       <TextField
        fullWidth
        label='หน่วยนับ (Unit)'
        size='small'
        value={formData.unit}
        onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
        placeholder='เช่น %, ต่อ 1,000 วัน, วัน'
       />
      </Grid>
     </Grid>

     <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 4 }}>
       <TextField
        fullWidth
        type='number'
        label='ค่าเป้าหมาย (Target Value)'
        size='small'
        value={formData.targetValue}
        onChange={(e) =>
         setFormData((prev) => ({ ...prev, targetValue: Number(e.target.value) }))
        }
       />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
       <FormControl fullWidth size='small'>
        <InputLabel>เกณฑ์ผ่าน (Operator)</InputLabel>
        <Select
         value={formData.operator}
         label='เกณฑ์ผ่าน (Operator)'
         onChange={(e) =>
          setFormData((prev) => ({ ...prev, operator: e.target.value }))
         }
        >
         <MenuItem value='<='>&le; น้อยกว่าหรือเท่ากับเป้าหมาย</MenuItem>
         <MenuItem value='>='>&ge; มากกว่าหรือเท่ากับเป้าหมาย</MenuItem>
        </Select>
       </FormControl>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
       <TextField
        fullWidth
        label='คำอธิบายเป้าหมาย'
        size='small'
        value={formData.targetDescription}
        onChange={(e) =>
         setFormData((prev) => ({ ...prev, targetDescription: e.target.value }))
        }
        placeholder='เช่น < 5.0 วัน'
       />
      </Grid>
     </Grid>

     {/* Optional Formula / Live Calculation (If metric has formula) */}
     {formData.numerator && (
      <Box
       sx={{
        p: 2,
        borderRadius: '12px',
        border: '1px dashed',
        borderColor: 'primary.main',
        bgcolor: (theme) =>
         theme.palette.mode === 'dark' ? 'rgba(13, 148, 136, 0.05)' : '#F0FDFA',
       }}
      >
       <Typography
        variant='subtitle2'
        sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}
       >
        <FunctionsRoundedIcon fontSize='small' color='primary' />
        สูตรคำนวณสด (Live Formula):
       </Typography>
       <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
         <FormControl fullWidth size='small'>
          <InputLabel>ตัวตั้ง (Numerator)</InputLabel>
          <Select
           value={formData.numerator}
           label='ตัวตั้ง (Numerator)'
           onChange={(e) =>
            setFormData((prev) => ({ ...prev, numerator: e.target.value }))
           }
          >
           {AVAILABLE_METRIC_DEFINITIONS.map((m) => (
            <MenuItem key={m.key} value={m.key}>
             {m.label} ({rawMetrics[m.key] ?? 0})
            </MenuItem>
           ))}
          </Select>
         </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
         <FormControl fullWidth size='small'>
          <InputLabel>ตัวหาร (Denominator)</InputLabel>
          <Select
           value={formData.denominator}
           label='ตัวหาร (Denominator)'
           onChange={(e) =>
            setFormData((prev) => ({ ...prev, denominator: e.target.value }))
           }
          >
           {AVAILABLE_DENOMINATOR_OPTIONS.map((d) => (
            <MenuItem key={d.key} value={d.key}>
             {d.label} {d.key !== 'none' ? `(${rawMetrics[d.key] ?? 0})` : ''}
            </MenuItem>
           ))}
          </Select>
         </FormControl>
        </Grid>
       </Grid>

       {liveCalculatedValue !== null && (
        <Box
         sx={{
          mt: 1.5,
          p: 1.25,
          borderRadius: '8px',
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
         }}
        >
         <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          คำนวณได้จริงจากข้อมูลปัจจุบัน:
         </Typography>
         <Typography variant='body2' sx={{ fontWeight: 800, color: '#0D9488' }}>
          {liveCalculatedValue} {formData.unit}
         </Typography>
        </Box>
       )}
      </Box>
     )}
    </Stack>
   </DialogContent>

   <Divider />

   <DialogActions sx={{ p: 2.5, px: 3, justifyContent: 'space-between' }}>
    <Button onClick={onClose} color='inherit' sx={{ textTransform: 'none' }}>
     ยกเลิก
    </Button>
    <Button
     variant='contained'
     onClick={handleSave}
     disabled={isSaving}
     sx={{
      bgcolor: '#0D9488',
      '&:hover': { bgcolor: '#0b8a64' },
      textTransform: 'none',
      fontWeight: 700,
      px: 3,
     }}
    >
     {isSaving ? <CircularProgress size={20} color='inherit' /> : 'บันทึกการเปลี่ยนแปลง'}
    </Button>
   </DialogActions>
  </Dialog>
 )
}
