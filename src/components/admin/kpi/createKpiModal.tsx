'use client'

import {
 AVAILABLE_DENOMINATOR_OPTIONS,
 AVAILABLE_METRIC_DEFINITIONS,
 KpiItem,
 KpiStats,
 updateWardKpi,
} from '@/apis/kpi'
import { useSnackBarNotification } from '@/hooks'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded'
import PreviewRoundedIcon from '@mui/icons-material/PreviewRounded'
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded'
import {
 Box,
 Button,
 Card,
 CardContent,
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
 LinearProgress,
 MenuItem,
 Select,
 Stack,
 TextField,
 Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'

type CreateKpiModalProps = {
 open: boolean
 onClose: () => void
 ward: string
 existingItems: KpiItem[]
 stats?: KpiStats | null
 onSuccess: () => void
}

const PRESET_TAGS = [
 'ความปลอดภัย',
 'การติดเชื้อใน รพ.',
 'การบริหารเตียง',
 'ผลลัพธ์ทางคลินิก',
 'มาตรฐานสำคัญ',
]

export function CreateKpiModal({
 open,
 onClose,
 ward,
 existingItems,
 stats,
 onSuccess,
}: CreateKpiModalProps) {
 const { showSnackbar } = useSnackBarNotification()
 const [isSubmitting, setIsSubmitting] = useState(false)

 const [title, setTitle] = useState('')
 const [tag, setTag] = useState('ความปลอดภัย')
 const [numerator, setNumerator] = useState('vapCount')
 const [denominator, setDenominator] = useState('ventilatorDays')
 const [multiplier, setMultiplier] = useState(1000)
 const [unit, setUnit] = useState('ต่อ 1,000 วัน')
 const [targetValue, setTargetValue] = useState(2.0)
 const [targetDescription, setTargetDescription] = useState('< 2.0 ต่อ 1,000 วัน')
 const [operator, setOperator] = useState<'<=' | '>='>('<=')

 const rawMetrics = stats?.rawMetrics || {}

 // Live Calculation
 const liveCalculatedValue = useMemo(() => {
  const num = rawMetrics[numerator] ?? 0
  const den = denominator !== 'none' ? (rawMetrics[denominator] ?? 0) : null
  const mul = Number(multiplier) || 1

  if (den !== null) {
   return den > 0 ? Number(((num / den) * mul).toFixed(2)) : 0
  }
  return Number((num * mul).toFixed(2))
 }, [numerator, denominator, multiplier, rawMetrics])

 // Target evaluation for live preview
 const isPassed = useMemo(() => {
  return operator === '>='
   ? liveCalculatedValue >= targetValue
   : liveCalculatedValue <= targetValue
 }, [operator, liveCalculatedValue, targetValue])

 const progressPercent = useMemo(() => {
  if (targetValue > 0) {
   return Math.min(100, Math.max(0, Math.round((liveCalculatedValue / targetValue) * 100)))
  }
  return liveCalculatedValue === 0 ? 100 : 0
 }, [liveCalculatedValue, targetValue])

 const selectedNumeratorLabel =
  AVAILABLE_METRIC_DEFINITIONS.find((m) => m.key === numerator)?.label || numerator
 const selectedDenominatorLabel =
  AVAILABLE_DENOMINATOR_OPTIONS.find((d) => d.key === denominator)?.label || denominator

 const handleSave = async () => {
  if (!title.trim()) {
   showSnackbar('กรุณาระบุชื่อตัวชี้วัด', 'error')
   return
  }

  setIsSubmitting(true)
  try {
   const newCode = `CUSTOM_${Date.now()}`
   const newItem: KpiItem = {
    code: newCode,
    title: title.trim(),
    tag: tag.trim() || 'มาตรฐานสำคัญ',
    numerator,
    denominator,
    multiplier: Number(multiplier) || 1,
    unit: unit.trim() || '%',
    targetValue: Number(targetValue) || 0,
    targetDescription: targetDescription.trim(),
    operator,
    actualValue: liveCalculatedValue,
    isPassed,
    progressPercent,
    statusText: isPassed ? 'ผ่านเกณฑ์เป้าหมาย' : 'ไม่ผ่านเกณฑ์เป้าหมาย',
    statusColor: isPassed ? 'success' : 'error',
    isActive: true,
   }

   const updatedItems = [...existingItems, newItem]
   await updateWardKpi(ward, updatedItems)

   showSnackbar(`สร้างตัวชี้วัด "${newItem.title}" สำเร็จ`, 'success')
   onSuccess()
   handleClose()
  } catch (err: any) {
   showSnackbar(err?.message || 'เกิดข้อผิดพลาดในการสร้างตัวชี้วัด', 'error')
  } finally {
   setIsSubmitting(false)
  }
 }

 const handleClose = () => {
  setTitle('')
  setTag('ความปลอดภัย')
  setNumerator('vapCount')
  setDenominator('ventilatorDays')
  setMultiplier(1000)
  setUnit('ต่อ 1,000 วัน')
  setTargetValue(2.0)
  setTargetDescription('< 2.0 ต่อ 1,000 วัน')
  setOperator('<=')
  onClose()
 }

 return (
  <Dialog
   open={open}
   onClose={handleClose}
   maxWidth='lg'
   fullWidth
   slotProps={{
    paper: {
     sx: {
      borderRadius: '20px',
      overflow: 'hidden',
     },
    },
   }}
  >
   {/* Header */}
   <DialogTitle
    sx={{
     py: 2.25,
     px: 3,
     bgcolor: (theme) =>
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
     borderBottom: '1px solid',
     borderColor: 'divider',
     display: 'flex',
     justifyContent: 'space-between',
     alignItems: 'center',
    }}
   >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
     <Box
      sx={{
       width: 40,
       height: 40,
       borderRadius: '12px',
       bgcolor: 'rgba(13, 148, 136, 0.12)',
       color: '#0D9488',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
      }}
     >
      <FunctionsRoundedIcon />
     </Box>
     <Box>
      <Typography variant='h6' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
       สร้างตัวชี้วัดใหม่ (Custom KPI Builder)
      </Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
       กำหนดสูตรคำนวณจากตัวแปรในระบบ และจำลองผลลัพธ์ทันทีก่อนบันทึกใช้งานจริง ({ward})
      </Typography>
     </Box>
    </Box>

    <IconButton size='small' onClick={handleClose} sx={{ color: 'text.secondary' }}>
     <CloseRoundedIcon fontSize='small' />
    </IconButton>
   </DialogTitle>

   <DialogContent sx={{ p: 3 }}>
    <Grid container spacing={3.5}>
     {/* Left: Configuration Form */}
     <Grid size={{ xs: 12, md: 7 }}>
      <Stack spacing={3}>
       {/* Section 1: Basic Information */}
       <Box>
        <Typography
         variant='subtitle2'
         sx={{ fontWeight: 700, mb: 1.5, color: '#0D9488', display: 'flex', alignItems: 'center', gap: 1 }}
        >
         <SpeedRoundedIcon sx={{ fontSize: 18 }} />
         1. ข้อมูลตัวชี้วัด (Basic Info)
        </Typography>

        <Stack spacing={2}>
         <TextField
          fullWidth
          size='small'
          label='ชื่อตัวชี้วัด (Title)*'
          placeholder='เช่น อัตราการเกิด VAP ต่อ 1,000 วันเครื่องช่วยหายใจ'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
         />

         <Box>
          <TextField
           fullWidth
           size='small'
           label='หมวดหมู่ (Tag)*'
           value={tag}
           onChange={(e) => setTag(e.target.value)}
           sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
           {PRESET_TAGS.map((t) => (
            <Chip
             key={t}
             label={t}
             size='small'
             onClick={() => setTag(t)}
             color={tag === t ? 'primary' : 'default'}
             variant={tag === t ? 'filled' : 'outlined'}
             sx={{
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontWeight: tag === t ? 700 : 500,
             }}
            />
           ))}
          </Box>
         </Box>
        </Stack>
       </Box>

       <Divider />

       {/* Section 2: Live Formula Builder */}
       <Box>
        <Typography
         variant='subtitle2'
         sx={{ fontWeight: 700, mb: 1.5, color: '#0D9488', display: 'flex', alignItems: 'center', gap: 1 }}
        >
         <FunctionsRoundedIcon sx={{ fontSize: 18 }} />
         2. สูตรการคำนวณสด (Formula Definition)
        </Typography>

        <Grid container spacing={2}>
         <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size='small'>
           <InputLabel>ตัวตั้ง (Numerator)*</InputLabel>
           <Select
            value={numerator}
            label='ตัวตั้ง (Numerator)*'
            onChange={(e) => setNumerator(e.target.value)}
           >
            {AVAILABLE_METRIC_DEFINITIONS.map((m) => (
             <MenuItem key={m.key} value={m.key}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
               <span>{m.label}</span>
               <Typography
                component='span'
                variant='caption'
                sx={{ color: 'text.secondary', ml: 1, fontWeight: 700 }}
               >
                ({rawMetrics[m.key] ?? 0})
               </Typography>
              </Box>
             </MenuItem>
            ))}
           </Select>
          </FormControl>
         </Grid>

         <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size='small'>
           <InputLabel>ตัวหาร (Denominator)*</InputLabel>
           <Select
            value={denominator}
            label='ตัวหาร (Denominator)*'
            onChange={(e) => setDenominator(e.target.value)}
           >
            {AVAILABLE_DENOMINATOR_OPTIONS.map((d) => (
             <MenuItem key={d.key} value={d.key}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
               <span>{d.label}</span>
               {d.key !== 'none' && (
                <Typography
                 component='span'
                 variant='caption'
                 sx={{ color: 'text.secondary', ml: 1, fontWeight: 700 }}
                >
                 ({rawMetrics[d.key] ?? 0})
                </Typography>
               )}
              </Box>
             </MenuItem>
            ))}
           </Select>
          </FormControl>
         </Grid>

         <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size='small'>
           <InputLabel>ตัวคูณ (Multiplier)*</InputLabel>
           <Select
            value={multiplier}
            label='ตัวคูณ (Multiplier)*'
            onChange={(e) => {
             const mul = Number(e.target.value)
             setMultiplier(mul)
             if (mul === 1000) setUnit('ต่อ 1,000 วัน')
             else if (mul === 100) setUnit('%')
             else setUnit('ครั้ง')
            }}
           >
            <MenuItem value={1}>&times; 1 (นับจำนวนครั้ง / ค่าตรงๆ)</MenuItem>
            <MenuItem value={100}>&times; 100 (คำนวณเป็นร้อยละ %)</MenuItem>
            <MenuItem value={1000}>&times; 1,000 (ต่อ 1,000 วันครองเตียง/อุปกรณ์)</MenuItem>
           </Select>
          </FormControl>
         </Grid>

         <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
           fullWidth
           size='small'
           label='หน่วยนับ (Unit)*'
           placeholder='เช่น %, ต่อ 1,000 วัน, วัน'
           value={unit}
           onChange={(e) => setUnit(e.target.value)}
          />
         </Grid>
        </Grid>
       </Box>

       <Divider />

       {/* Section 3: Target & Evaluation */}
       <Box>
        <Typography
         variant='subtitle2'
         sx={{ fontWeight: 700, mb: 1.5, color: '#0D9488', display: 'flex', alignItems: 'center', gap: 1 }}
        >
         <SpeedRoundedIcon sx={{ fontSize: 18 }} />
         3. ค่าเป้าหมายและเกณฑ์การวัดผล (Target & Criteria)
        </Typography>

        <Grid container spacing={2}>
         <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size='small'>
           <InputLabel>เกณฑ์ประเมิน*</InputLabel>
           <Select
            value={operator}
            label='เกณฑ์ประเมิน*'
            onChange={(e) => setOperator(e.target.value as '<=' | '>=')}
           >
            <MenuItem value='<='>&le; น้อยกว่าหรือเท่ากับเป้าหมาย</MenuItem>
            <MenuItem value='>='>&ge; มากกว่าหรือเท่ากับเป้าหมาย</MenuItem>
           </Select>
          </FormControl>
         </Grid>

         <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
           fullWidth
           size='small'
           type='number'
           label='ค่าเป้าหมายตัวเลข*'
           value={targetValue}
           onChange={(e) => {
            const v = Number(e.target.value)
            setTargetValue(v)
            setTargetDescription(`${operator === '<=' ? '<' : '>'} ${v} ${unit}`)
           }}
          />
         </Grid>

         <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
           fullWidth
           size='small'
           label='คำอธิบายเป้าหมาย'
           value={targetDescription}
           onChange={(e) => setTargetDescription(e.target.value)}
           placeholder='เช่น < 2.0 ต่อ 1,000 วัน'
          />
         </Grid>
        </Grid>
       </Box>
      </Stack>
     </Grid>

     {/* Right: Live Card Preview */}
     <Grid size={{ xs: 12, md: 5 }}>
      <Box
       sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        borderRadius: '16px',
        bgcolor: (theme) =>
         theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
        border: '1px solid',
        borderColor: 'divider',
       }}
      >
       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <PreviewRoundedIcon sx={{ color: '#0D9488', fontSize: 20 }} />
        <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
         จำลองการแสดงผลบนกระดาน (Live Card Preview)
        </Typography>
       </Box>

       {/* Real Card Preview */}
       <Card
        sx={{
         borderRadius: '16px',
         border: '1px solid',
         borderColor: 'divider',
         bgcolor: 'background.paper',
         boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
         p: 2.5,
         mb: 2.5,
        }}
       >
        {/* Tag badge */}
        <Box sx={{ mb: 1.5 }}>
         <Box
          component='span'
          sx={{
           display: 'inline-block',
           px: 1.25,
           py: 0.25,
           borderRadius: '6px',
           fontSize: '0.72rem',
           fontWeight: 700,
           bgcolor: 'rgba(13, 148, 136, 0.1)',
           color: '#0D9488',
           border: '1px solid rgba(13, 148, 136, 0.2)',
          }}
         >
          {tag || 'มาตรฐานสำคัญ'}
         </Box>
        </Box>

        {/* Title */}
        <Typography
         variant='subtitle2'
         sx={{
          fontWeight: 700,
          color: 'text.primary',
          minHeight: '2.4em',
          lineHeight: 1.4,
          mb: 1,
         }}
        >
         {title || 'ชื่อตัวชี้วัดที่ต้องการสร้าง...'}
        </Typography>

        {/* Target description */}
        <Typography
         variant='caption'
         sx={{
          color: 'text.secondary',
          display: 'block',
          minHeight: '2em',
          mb: 2,
          lineHeight: 1.3,
         }}
        >
         เป้าหมายมาตรฐาน: {targetDescription || `${operator} ${targetValue} ${unit}`}
        </Typography>

        {/* Actual Value */}
        <Box
         sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          mb: 1,
         }}
        >
         <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.82rem' }}>
          สถานการณ์จริง (ข้อมูลปัจจุบัน)
         </Typography>
         <Typography variant='body2' sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem' }}>
          {liveCalculatedValue} {unit}
         </Typography>
        </Box>

        {/* Progress bar */}
        <Box sx={{ mb: 2 }}>
         <LinearProgress
          variant='determinate'
          value={progressPercent}
          sx={{
           height: 8,
           borderRadius: 4,
           bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
           '& .MuiLinearProgress-bar': {
            bgcolor: isPassed ? '#10B981' : '#EF4444',
            borderRadius: 4,
           },
          }}
         />
        </Box>

        {/* Status result */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
         {isPassed ? (
          <>
           <CheckCircleRoundedIcon sx={{ fontSize: 17, color: '#10B981' }} />
           <Typography variant='caption' sx={{ fontWeight: 700, color: '#10B981' }}>
            ผ่านเกณฑ์เป้าหมาย
           </Typography>
          </>
         ) : (
          <>
           <ErrorOutlineRoundedIcon sx={{ fontSize: 17, color: '#EF4444' }} />
           <Typography variant='caption' sx={{ fontWeight: 700, color: '#EF4444' }}>
            ยังไม่ผ่านเกณฑ์เป้าหมาย
           </Typography>
          </>
         )}
        </Box>
       </Card>

       {/* Math Formula breakdown */}
       <Box
        sx={{
         mt: 'auto',
         p: 2,
         borderRadius: '12px',
         bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(13, 148, 136, 0.1)' : '#F0FDFA',
         border: '1px dashed',
         borderColor: '#99F6E4',
        }}
       >
        <Typography variant='caption' sx={{ fontWeight: 700, color: '#0F766E', display: 'block', mb: 0.5 }}>
         ที่มาของตัวเลขคำนวณ (Calculation Breakdown):
        </Typography>
        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
         &bull; ตัวตั้ง ({selectedNumeratorLabel}) = <b>{rawMetrics[numerator] ?? 0}</b>
        </Typography>
        {denominator !== 'none' && (
         <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
          &bull; ตัวหาร ({selectedDenominatorLabel}) = <b>{rawMetrics[denominator] ?? 0}</b>
         </Typography>
        )}
        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
         &bull; สูตร: {denominator !== 'none' ? `(${rawMetrics[numerator] ?? 0} ÷ ${rawMetrics[denominator] ?? 0})` : `${rawMetrics[numerator] ?? 0}`} &times; {multiplier} = <b style={{ color: '#0D9488' }}>{liveCalculatedValue} {unit}</b>
        </Typography>
       </Box>
      </Box>
     </Grid>
    </Grid>
   </DialogContent>

   <Divider />

   <DialogActions sx={{ p: 2.5, px: 3, justifyContent: 'space-between' }}>
    <Button onClick={handleClose} color='inherit' sx={{ textTransform: 'none' }}>
     ยกเลิก
    </Button>
    <Button
     variant='contained'
     startIcon={<AddRoundedIcon />}
     onClick={handleSave}
     disabled={isSubmitting}
     sx={{
      bgcolor: '#0D9488',
      '&:hover': { bgcolor: '#0b8a64' },
      textTransform: 'none',
      fontWeight: 700,
      px: 3.5,
      borderRadius: '8px',
     }}
    >
     {isSubmitting ? <CircularProgress size={20} color='inherit' /> : 'บันทึกและสร้างตัวชี้วัดใหม่'}
    </Button>
   </DialogActions>
  </Dialog>
 )
}
