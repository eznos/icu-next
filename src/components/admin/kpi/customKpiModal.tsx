'use client'

import { KpiItem, KpiStats, updateWardKpi } from '@/apis/kpi'
import { useSnackBarNotification } from '@/hooks'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
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
 IconButton,
 Stack,
 Switch,
 Tab,
 Tabs,
 Tooltip,
 Typography,
 useMediaQuery,
 useTheme,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { EditKpiItemModal } from './editKpiItemModal'

type CustomKpiModalProps = {
 open: boolean
 onClose: () => void
 ward: string
 items: KpiItem[]
 stats?: KpiStats | null
 onSuccess: () => void
}

const DEFAULT_KPI_FALLBACKS: Record<
 string,
 { title: string; tag: string; targetDescription: string }
> = {
 BED_OCCUPANCY: {
  title: '1. อัตราการครองเตียง (Bed Occupancy Rate)',
  tag: 'การบริหารเตียง',
  targetDescription: 'เป้าหมายมาตรฐานสากล: 80% - 85%',
 },
 ALOS: {
  title: '2. วันนอนเฉลี่ยใน ICU (Average Length of Stay: ALOS)',
  tag: 'การบริหารเตียง',
  targetDescription: 'เป้าหมายมาตรฐานสากล: < 5.0 วัน',
 },
 READMISSION_48H: {
  title: '3. อัตรากลับเข้า ICU ซ้ำภายใน 48 ชั่วโมง (Readmission Rate 48h)',
  tag: 'การบริหารเตียง',
  targetDescription: 'เป้าหมายมาตรฐานสากล: < 2.0%',
 },
 MORTALITY: {
  title: '4. อัตราการเสียชีวิตใน ICU (Crude ICU Mortality Rate)',
  tag: 'ผลลัพธ์ทางคลินิก',
  targetDescription: 'เป้าหมายมาตรฐานสากล: < 10.0%',
 },
 SMR: {
  title: '5. อัตราส่วนการเสียชีวิตมาตรฐาน (Standardized Mortality Ratio: SMR)',
  tag: 'ผลลัพธ์ทางคลินิก',
  targetDescription: 'เป้าหมายมาตรฐานสากล: SMR < 1.0 (อิง APACHE II Score)',
 },
 VAP: {
  title: '6. อัตราเกิดการติดเชื้อปอดอักเสบจากเครื่องช่วยหายใจ (VAP Rate)',
  tag: 'การติดเชื้อใน รพ.',
  targetDescription: 'เป้าหมายมาตรฐานสากล: < 2.5 ต่อ 1,000 วันเครื่องช่วยหายใจ',
 },
 CLABSI: {
  title: '7. การติดเชื้อในกระแสเลือดจากสายสวนหลอดเลือดดำส่วนกลาง (CLABSI Rate)',
  tag: 'การติดเชื้อใน รพ.',
  targetDescription: 'เป้าหมายมาตรฐานสากล: < 1.5 ต่อ 1,000 วันสาย Central Line',
 },
 CAUTI: {
  title: '8. การติดเชื้อทางเดินปัสสาวะจากการคาสายสวน (CAUTI Rate)',
  tag: 'การติดเชื้อใน รพ.',
  targetDescription: 'เป้าหมายมาตรฐานสากล: < 2.0 ต่อ 1,000 วันคาสายสวนปัสสาวะ',
 },
 UNPLANNED_EXTUBATION: {
  title:
   '9. อัตราการเลื่อนหลุดของท่อช่วยหายใจโดยไม่ได้วางแผน (Unplanned Extubation)',
  tag: 'ความปลอดภัย',
  targetDescription: 'เป้าหมายมาตรฐานสากล: < 2.0 ต่อ 1,000 วันใส่ท่อช่วยหายใจ',
 },
 PRESSURE_INJURY: {
  title: '10. อัตราเกิดแผลกดทับระดับ 2 ขึ้นไปใน ICU (Pressure Injury Rate)',
  tag: 'ความปลอดภัย',
  targetDescription: 'เป้าหมายมาตรฐานสากล: 0% สำหรับระดับ 2 ขึ้นไป',
 },
 MED_ERROR: {
  title: '11. ความคลาดเคลื่อนทางยาระดับ E ขึ้นไป (Medication Error Rate)',
  tag: 'ความปลอดภัย',
  targetDescription: 'เป้าหมายมาตรฐานสากล: 0 ครั้งต่อ 1,000 วันนอน',
 },
}

export function CustomKpiModal({
 open,
 onClose,
 ward,
 items: initialItems,
 stats,
 onSuccess,
}: CustomKpiModalProps) {
 const theme = useTheme()
 const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
 const { showSnackbar } = useSnackBarNotification()
 const [items, setItems] = useState<KpiItem[]>([])
 const [isSaving, setIsSaving] = useState(false)
 const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>(
  'all',
 )
 const [editingItem, setEditingItem] = useState<KpiItem | null>(null)

 useEffect(() => {
  if (open) {
   setItems(
    initialItems.map((it) => {
     const fallback = DEFAULT_KPI_FALLBACKS[it.code]
     return {
      ...it,
      title: it.title || fallback?.title || it.code,
      tag: it.tag || fallback?.tag || 'มาตรฐานสำคัญ',
      targetDescription:
       it.targetDescription || fallback?.targetDescription || '',
      isActive: it.isActive !== false,
     }
    }),
   )
  }
 }, [open, initialItems])

 const filteredItems = useMemo(() => {
  return items.filter((it) => {
   if (filterTab === 'active') return it.isActive !== false
   if (filterTab === 'inactive') return it.isActive === false
   return true
  })
 }, [items, filterTab])

 const handleToggleItem = (code: string) => {
  setItems((prev) =>
   prev.map((it) =>
    it.code === code ? { ...it, isActive: !it.isActive } : it,
   ),
  )
 }

 const handleDeleteCustom = (code: string) => {
  if (!confirm('ยืนยันที่จะลบตัวชี้วัดนี้หรือไม่?')) return
  setItems((prev) => prev.filter((it) => it.code !== code))
 }

 const handleSaveAll = async () => {
  setIsSaving(true)
  try {
   await updateWardKpi(ward, items)
   showSnackbar('บันทึกการตั้งค่าตัวชี้วัด (KPI) สำเร็จ', 'success')
   onSuccess()
   onClose()
  } catch (error: any) {
   showSnackbar(error.message || 'บันทึกการตั้งค่าไม่สำเร็จ', 'error')
  } finally {
   setIsSaving(false)
  }
 }

 return (
  <>
   <Dialog
    fullScreen={isMobile}
    open={open}
    onClose={onClose}
    maxWidth='md'
    fullWidth
    slotProps={{
     paper: {
      sx: {
       borderRadius: { xs: 0, sm: '16px' },
       height: { xs: '100dvh', sm: 'auto' },
       maxHeight: { xs: '100dvh', sm: '90vh' },
       display: 'flex',
       flexDirection: 'column',
       overflow: 'hidden',
      },
     },
    }}
   >
    {/* Header */}
    <DialogTitle
     sx={{
      p: { xs: 1.75, sm: 2.5 },
      pb: { xs: 1.5, sm: 2 },
      bgcolor: (t) =>
       t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
      borderBottom: '1px solid',
      borderColor: 'divider',
      flexShrink: 0,
     }}
    >
     <Box
      sx={{
       display: 'flex',
       alignItems: 'flex-start',
       justifyContent: 'space-between',
       gap: 1.5,
      }}
     >
      <Box
       sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1.25, sm: 1.5 },
        minWidth: 0,
       }}
      >
       <Box
        sx={{
         width: { xs: 34, sm: 38 },
         height: { xs: 34, sm: 38 },
         borderRadius: '10px',
         bgcolor: 'rgba(13, 148, 136, 0.12)',
         color: '#0D9488',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         flexShrink: 0,
        }}
       >
        <TuneRoundedIcon fontSize={isMobile ? 'small' : 'medium'} />
       </Box>
       <Box sx={{ minWidth: 0 }}>
        <Typography
         variant='h6'
         sx={{
          fontWeight: 800,
          lineHeight: 1.25,
          fontSize: { xs: '1rem', sm: '1.2rem' },
         }}
        >
         จัดการและปรับแต่ง KPI ({ward})
        </Typography>
        <Typography
         variant='caption'
         sx={{
          color: 'text.secondary',
          display: 'block',
          mt: 0.25,
          fontSize: { xs: '0.72rem', sm: '0.78rem' },
         }}
        >
         เปิด/ปิดการแสดงผล และปรับแต่งเกณฑ์ของหอผู้ป่วย
        </Typography>
       </Box>
      </Box>

      <IconButton
       size='small'
       onClick={onClose}
       aria-label='close'
       sx={{
        color: 'text.secondary',
        flexShrink: 0,
        bgcolor: (t) =>
         t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
       }}
      >
       <CloseRoundedIcon fontSize='small' />
      </IconButton>
     </Box>
    </DialogTitle>

    {/* Body */}
    <DialogContent
     sx={{
      p: { xs: 1.5, sm: 2.5 },
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 1.5, sm: 2 },
      flex: 1,
      overflow: 'hidden',
     }}
    >
     {/* Tabs Filter Bar */}
     <Box
      sx={{
       display: 'flex',
       flexDirection: { xs: 'column', sm: 'row' },
       alignItems: { xs: 'stretch', sm: 'center' },
       justifyContent: 'space-between',
       borderBottom: '1px solid',
       borderColor: 'divider',
       pb: 0.5,
       gap: 0.5,
       flexShrink: 0,
      }}
     >
      <Tabs
       value={filterTab}
       onChange={(_, val) => setFilterTab(val)}
       variant='scrollable'
       scrollButtons='auto'
       allowScrollButtonsMobile
       sx={{
        minHeight: 36,
        '& .MuiTabs-indicator': { backgroundColor: '#0D9488', height: 3 },
        '& .MuiTab-root': {
         minHeight: 36,
         textTransform: 'none',
         fontWeight: 700,
         fontSize: { xs: '0.8rem', sm: '0.85rem' },
         px: { xs: 1.5, sm: 2 },
         '&.Mui-selected': { color: '#0D9488' },
        },
       }}
      >
       <Tab value='all' label={`ทั้งหมด (${items.length})`} />
       <Tab
        value='active'
        label={`กำลังใช้งาน (${items.filter((it) => it.isActive !== false).length})`}
       />
       <Tab
        value='inactive'
        label={`ปิดใช้งาน (${items.filter((it) => it.isActive === false).length})`}
       />
      </Tabs>

      {!isMobile && (
       <Typography
        variant='caption'
        sx={{ color: 'text.secondary', fontWeight: 600 }}
       >
        แสดงผล {filteredItems.length} รายการ
       </Typography>
      )}
     </Box>

     {/* Scrollable Item List */}
     <Stack
      spacing={{ xs: 1.25, sm: 1.5 }}
      sx={{
       flex: 1,
       overflowY: 'auto',
       WebkitOverflowScrolling: 'touch',
       pr: { xs: 0, sm: 0.5 },
       pb: 1,
      }}
     >
      {filteredItems.map((item) => {
       const isCustom =
        item.code.startsWith('CUSTOM_') || Boolean(item.numerator)
       const isActive = item.isActive !== false
       const fallback = DEFAULT_KPI_FALLBACKS[item.code]
       const displayTitle = item.title || fallback?.title || item.code
       const displayTag = item.tag || fallback?.tag || 'มาตรฐานสำคัญ'
       const displayDesc =
        item.targetDescription ||
        fallback?.targetDescription ||
        `${item.operator || '<='} ${item.targetValue} ${item.unit}`

       return (
        <Card
         key={item.code}
         variant='outlined'
         sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          bgcolor: isActive
           ? 'background.paper'
           : (t) =>
              t.palette.mode === 'dark'
               ? 'rgba(255, 255, 255, 0.02)'
               : '#F8FAFC',
          opacity: isActive ? 1 : 0.65,
          transition: 'all 0.15s ease',
          '&:hover': {
           boxShadow: (t) =>
            t.palette.mode === 'dark'
             ? '0 2px 8px rgba(0,0,0,0.3)'
             : '0 2px 8px rgba(0,0,0,0.05)',
          },
         }}
        >
         <Box
          sx={{
           display: 'flex',
           flexDirection: { xs: 'column', sm: 'row' },
           alignItems: { xs: 'stretch', sm: 'flex-start' },
           justifyContent: 'space-between',
           gap: { xs: 1.25, sm: 2 },
          }}
         >
          {/* ข้อมูลชื่อและรายละเอียดตัวชี้วัด */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
           <Stack
            direction='row'
            spacing={0.75}
            sx={{
             alignItems: 'center',
             mb: 0.75,
             flexWrap: 'wrap',
             rowGap: 0.5,
            }}
           >
            <Chip
             size='small'
             label={displayTag}
             sx={{
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22,
              bgcolor: (t) =>
               t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
              color: 'text.primary',
             }}
            />
            {isCustom && (
             <Chip
              size='small'
              label='Custom'
              sx={{
               fontWeight: 700,
               fontSize: '0.65rem',
               height: 20,
               bgcolor: '#FEF3C7',
               color: '#B45309',
              }}
             />
            )}
            <Typography
             variant='caption'
             sx={{
              color: 'text.secondary',
              fontFamily: 'monospace',
              fontSize: '0.7rem',
             }}
            >
             [{item.code}]
            </Typography>
           </Stack>

           {/* Title */}
           <Typography
            variant='subtitle2'
            sx={{
             fontWeight: 700,
             color: (t) => (t.palette.mode === 'dark' ? '#F8FAFC' : '#0F172A'),
             fontSize: { xs: '0.88rem', sm: '0.92rem' },
             lineHeight: 1.4,
             mb: 0.5,
             wordBreak: 'break-word',
            }}
           >
            {displayTitle}
           </Typography>

           {/* Target Description */}
           <Typography
            variant='caption'
            sx={{
             color: (t) => (t.palette.mode === 'dark' ? '#94A3B8' : '#475569'),
             display: 'block',
             fontSize: { xs: '0.76rem', sm: '0.8rem' },
             lineHeight: 1.35,
            }}
           >
            เป้าหมาย: {displayDesc}
           </Typography>
          </Box>

          {/* ฝั่งขวา (บนจอใหญ่) / แถบด้านล่าง (บนมือถือ): สถานะ + ปุ่มควบคุม */}
          <Box
           sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
            gap: { xs: 1.5, sm: 2 },
            flexShrink: 0,
            pt: { xs: 1, sm: 0.5 },
            borderTop: { xs: '1px dashed', sm: 'none' },
            borderColor: 'divider',
           }}
          >
           <Box
            sx={{
             textAlign: { xs: 'left', sm: 'right' },
             display: { xs: 'flex', sm: 'block' },
             alignItems: 'center',
             gap: 1,
             minWidth: { sm: 90 },
            }}
           >
            <Typography
             variant='body2'
             sx={{
              fontWeight: 800,
              color: (t) => (t.palette.mode === 'dark' ? '#F8FAFC' : '#0F172A'),
              fontSize: { xs: '0.82rem', sm: '0.9rem' },
             }}
            >
             {item.unit || item.actualValue}
            </Typography>
            <Chip
             size='small'
             icon={
              item.isPassed !== false ? (
               <CheckCircleRoundedIcon sx={{ fontSize: '13px !important' }} />
              ) : (
               <ErrorOutlineRoundedIcon sx={{ fontSize: '13px !important' }} />
              )
             }
             label={item.isPassed !== false ? 'ผ่านเกณฑ์' : 'ไม่ผ่าน'}
             color={item.isPassed !== false ? 'success' : 'error'}
             variant='outlined'
             sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              mt: { xs: 0, sm: 0.25 },
             }}
            />
           </Box>

           {!isMobile && (
            <Divider orientation='vertical' flexItem sx={{ my: 0.5 }} />
           )}

           {/* Controls */}
           <Stack direction='row' spacing={0.75} sx={{ alignItems: 'center' }}>
            <Tooltip
             title={
              isActive
               ? 'เปิดใช้งานอยู่ (กดเพื่อปิด)'
               : 'ปิดใช้งานอยู่ (กดเพื่อเปิด)'
             }
            >
             <Switch
              size={isMobile ? 'small' : 'medium'}
              checked={isActive}
              onChange={() => handleToggleItem(item.code)}
              color='success'
             />
            </Tooltip>

            <Tooltip title='แก้ไขข้อมูลตัวชี้วัดนี้'>
             <IconButton
              size='small'
              onClick={() => setEditingItem(item)}
              sx={{
               p: 0.75,
               bgcolor: (t) =>
                t.palette.mode === 'dark'
                 ? 'rgba(255,255,255,0.06)'
                 : '#F1F5F9',
               '&:hover': {
                bgcolor: (t) =>
                 t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.12)'
                  : '#E2E8F0',
                color: '#0D9488',
               },
              }}
             >
              <EditRoundedIcon sx={{ fontSize: 16 }} />
             </IconButton>
            </Tooltip>

            {isCustom && (
             <Tooltip title='ลบตัวชี้วัด Custom นี้'>
              <IconButton
               size='small'
               color='error'
               onClick={() => handleDeleteCustom(item.code)}
              >
               <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
             </Tooltip>
            )}
           </Stack>
          </Box>
         </Box>
        </Card>
       )
      })}
     </Stack>
    </DialogContent>

    <Divider />

    {/* Footer Actions */}
    <DialogActions
     sx={{
      p: { xs: 1.5, sm: 2 },
      px: { xs: 2, sm: 3 },
      pb: { xs: 'calc(12px + env(safe-area-inset-bottom))', sm: 2 },
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'stretch', sm: 'center' },
      justifyContent: 'space-between',
      gap: 1.25,
      flexShrink: 0,
     }}
    >
     <Typography
      variant='caption'
      sx={{
       color: 'text.secondary',
       textAlign: { xs: 'center', sm: 'left' },
      }}
     >
      กำลังใช้งาน {items.filter((it) => it.isActive !== false).length} จาก{' '}
      {items.length} ตัวชี้วัด
     </Typography>

     <Box
      sx={{
       display: 'flex',
       gap: 1.25,
       width: { xs: '100%', sm: 'auto' },
      }}
     >
      <Button
       fullWidth={isMobile}
       onClick={onClose}
       disabled={isSaving}
       variant={isMobile ? 'outlined' : 'text'}
       sx={{
        textTransform: 'none',
        borderRadius: '10px',
        borderColor: 'divider',
       }}
      >
       ยกเลิก
      </Button>
      <Button
       fullWidth={isMobile}
       variant='contained'
       onClick={handleSaveAll}
       disabled={isSaving}
       sx={{
        bgcolor: '#0D9488',
        textTransform: 'none',
        fontWeight: 700,
        px: 3,
        borderRadius: '10px',
        boxShadow: 'none',
        whiteSpace: 'nowrap',
        '&:hover': { bgcolor: '#0b8a64', boxShadow: 'none' },
       }}
      >
       {isSaving ? (
        <CircularProgress size={20} color='inherit' />
       ) : (
        'บันทึกการตั้งค่า KPI'
       )}
      </Button>
     </Box>
    </DialogActions>
   </Dialog>

   {/* Dedicated Edit KPI Modal */}
   <EditKpiItemModal
    open={Boolean(editingItem)}
    item={editingItem}
    onClose={() => setEditingItem(null)}
    ward={ward}
    allItems={items}
    stats={stats}
    onSuccess={() => {
     onSuccess()
     setEditingItem(null)
    }}
   />
  </>
 )
}
