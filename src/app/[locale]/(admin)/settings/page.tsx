'use client'

import {
 createWard,
 deleteWard,
 updateWard,
 useWardList,
 WardType,
} from '@/apis/ward'
import { TitlePage } from '@/components/utils/titlePage'
import { useSnackBarNotification } from '@/hooks'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import BedRoundedIcon from '@mui/icons-material/BedRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import HotelRoundedIcon from '@mui/icons-material/HotelRounded'
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
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
 FormControlLabel,
 Grid,
 IconButton,
 InputAdornment,
 Stack,
 Switch,
 TextField,
 Tooltip,
 Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'

export default function SettingsPage() {
 const { showSnackbar } = useSnackBarNotification()
 const [showInactive, setShowInactive] = useState(true)
 const { data: wardResponse, isLoading, mutate } = useWardList(showInactive)

 const wards = useMemo(() => wardResponse?.data || [], [wardResponse])

 const [searchQuery, setSearchQuery] = useState('')
 const [updatingWardId, setUpdatingWardId] = useState<string | null>(null)

 const [modalOpen, setModalOpen] = useState(false)
 const [editingWard, setEditingWard] = useState<WardType | null>(null)
 const [isSubmitting, setIsSubmitting] = useState(false)

 const [formData, setFormData] = useState({
  code: '',
  name: '',
  description: '',
  totalBeds: 10,
  targetMonthlyAdmissions: 18,
  isActive: true,
 })

 const filteredWards = useMemo(() => {
  const query = searchQuery.trim().toLowerCase()
  return wards.filter((w) => {
   if (!showInactive && !w.isActive) return false
   if (!query) return true
   return (
    w.code.toLowerCase().includes(query) ||
    w.name.toLowerCase().includes(query) ||
    (w.description || '').toLowerCase().includes(query)
   )
  })
 }, [wards, searchQuery, showInactive])

 const totalCapacity = useMemo(() => {
  return wards
   .filter((w) => w.isActive)
   .reduce((sum, w) => sum + (w.totalBeds ?? 10), 0)
 }, [wards])

 const activeWardsCount = useMemo(() => {
  return wards.filter((w) => w.isActive).length
 }, [wards])

 const handleOpenCreateModal = () => {
  setEditingWard(null)
  setFormData({
   code: '',
   name: '',
   description: '',
   totalBeds: 10,
   targetMonthlyAdmissions: 18,
   isActive: true,
  })
  setModalOpen(true)
 }

 const handleOpenEditModal = (ward: WardType) => {
  setEditingWard(ward)
  setFormData({
   code: ward.code,
   name: ward.name,
   description: ward.description || '',
   totalBeds: ward.totalBeds ?? 10,
   targetMonthlyAdmissions: ward.targetMonthlyAdmissions ?? 18,
   isActive: ward.isActive,
  })
  setModalOpen(true)
 }

 const handleCloseModal = () => {
  if (isSubmitting) return
  setModalOpen(false)
  setEditingWard(null)
 }

 const handleSubmitModal = async () => {
  if (!formData.code.trim() || !formData.name.trim()) {
   showSnackbar('กรุณากรอกรหัสและชื่อหอผู้ป่วย', 'error')
   return
  }

  setIsSubmitting(true)
  try {
   if (editingWard?._id) {
    await updateWard(editingWard._id, {
     name: formData.name.trim(),
     description: formData.description.trim(),
     totalBeds: Math.max(1, Number(formData.totalBeds)),
     targetMonthlyAdmissions: Math.max(0, Number(formData.targetMonthlyAdmissions)),
     isActive: formData.isActive,
    })
    showSnackbar('อัปเดตข้อมูลหอผู้ป่วยสำเร็จ', 'success')
   } else {
    await createWard({
     code: formData.code.toUpperCase().trim(),
     name: formData.name.trim(),
     description: formData.description.trim(),
     totalBeds: Math.max(1, Number(formData.totalBeds)),
     targetMonthlyAdmissions: Math.max(0, Number(formData.targetMonthlyAdmissions)),
    })
    showSnackbar(`เพิ่มหอผู้ป่วย ${formData.code.toUpperCase()} สำเร็จ`, 'success')
   }

   mutate()
   handleCloseModal()
  } catch (error: any) {
   showSnackbar(error.message || 'บันทึกข้อมูลไม่สำเร็จ', 'error')
  } finally {
   setIsSubmitting(false)
  }
 }

 const handleBedStep = async (ward: WardType, delta: number) => {
  if (!ward._id) return
  const currentBeds = ward.totalBeds ?? 10
  const newBeds = currentBeds + delta
  if (newBeds < 1) return

  setUpdatingWardId(ward._id)
  try {
   await updateWard(ward._id, { totalBeds: newBeds })
   mutate()
  } catch (error: any) {
   showSnackbar(error.message || 'ปรับจำนวนเตียงไม่สำเร็จ', 'error')
  } finally {
   setUpdatingWardId(null)
  }
 }

 const handleToggleActive = async (ward: WardType) => {
  if (!ward._id) return
  const newStatus = !ward.isActive
  try {
   if (!newStatus) {
    if (!confirm(`ต้องการปิดการใช้งานหอผู้ป่วย ${ward.code} หรือไม่?`)) return
    await deleteWard(ward._id)
    showSnackbar(`ปิดการใช้งานหอผู้ป่วย ${ward.code} แล้ว`, 'success')
   } else {
    await updateWard(ward._id, { isActive: true })
    showSnackbar(`เปิดการใช้งานหอผู้ป่วย ${ward.code} แล้ว`, 'success')
   }
   mutate()
  } catch (error: any) {
   showSnackbar(error.message || 'เปลี่ยนสถานะไม่สำเร็จ', 'error')
  }
 }

 return (
  <Box
   sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    width: '100%',
    minWidth: 0,
   }}
  >
   <TitlePage
    title='ตั้งค่าระบบและหอผู้ป่วย (Ward & Bed Settings)'
    actions={
     <Button
      variant='contained'
      startIcon={<AddRoundedIcon />}
      onClick={handleOpenCreateModal}
      sx={{
       bgcolor: '#0D9488',
       borderRadius: '10px',
       textTransform: 'none',
       fontWeight: 700,
       px: 2.5,
       boxShadow: 'none',
       '&:hover': { bgcolor: '#0b8a64', boxShadow: 'none' },
      }}
     >
      เพิ่ม Ward ใหม่
     </Button>
    }
   />

   <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 4 }}>
     <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0' }}>
      <CardContent sx={{ p: 2 }}>
       <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
         sx={{
          p: 1.2,
          borderRadius: '10px',
          bgcolor: '#EFF6FF',
          color: '#2563EB',
          display: 'flex',
         }}
        >
         <LocalHospitalRoundedIcon fontSize='small' />
        </Box>
        <Box>
         <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
          หอผู้ป่วยทั้งหมด (Total Wards)
         </Typography>
         <Typography variant='h5' sx={{ fontWeight: 800, color: '#1E293B' }}>
          {wards.length} <Typography component='span' variant='body2' color='text.secondary'>หอผู้ป่วย</Typography>
         </Typography>
        </Box>
       </Stack>
      </CardContent>
     </Card>
    </Grid>

    <Grid size={{ xs: 12, sm: 4 }}>
     <Card sx={{ borderRadius: '14px', border: '1px solid #A7F3D0', bgcolor: '#F0FDF4' }}>
      <CardContent sx={{ p: 2 }}>
       <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
         sx={{
          p: 1.2,
          borderRadius: '10px',
          bgcolor: '#DCFCE7',
          color: '#059669',
          display: 'flex',
         }}
        >
         <CheckCircleOutlineRoundedIcon fontSize='small' />
        </Box>
        <Box>
         <Typography variant='caption' sx={{ color: '#047857', fontWeight: 700 }}>
          เปิดใช้งานอยู่ (Active)
         </Typography>
         <Typography variant='h5' sx={{ fontWeight: 800, color: '#065F46' }}>
          {activeWardsCount} <Typography component='span' variant='body2' color='#047857'>หอผู้ป่วย</Typography>
         </Typography>
        </Box>
       </Stack>
      </CardContent>
     </Card>
    </Grid>

    <Grid size={{ xs: 12, sm: 4 }}>
     <Card sx={{ borderRadius: '14px', border: '1px solid #DDD6FE', bgcolor: '#FAF5FF' }}>
      <CardContent sx={{ p: 2 }}>
       <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
         sx={{
          p: 1.2,
          borderRadius: '10px',
          bgcolor: '#EDE9FE',
          color: '#7C3AED',
          display: 'flex',
         }}
        >
         <HotelRoundedIcon fontSize='small' />
        </Box>
        <Box>
         <Typography variant='caption' sx={{ color: '#6D28D9', fontWeight: 700 }}>
          ความจุเตียงรวมทั้งระบบ (Total Beds)
         </Typography>
         <Typography variant='h5' sx={{ fontWeight: 800, color: '#5B21B6' }}>
          {totalCapacity} <Typography component='span' variant='body2' color='#6D28D9'>เตียง</Typography>
         </Typography>
        </Box>
       </Stack>
      </CardContent>
     </Card>
    </Grid>
   </Grid>

   <Box
    sx={{
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'space-between',
     gap: 2,
     flexWrap: 'wrap',
    }}
   >
    <TextField
     size='small'
     placeholder='ค้นหาด้วยรหัส Ward หรือชื่อหอผู้ป่วย...'
     value={searchQuery}
     onChange={(e) => setSearchQuery(e.target.value)}
     slotProps={{
      input: {
       startAdornment: (
        <InputAdornment position='start'>
         <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        </InputAdornment>
       ),
      },
     }}
     sx={{
      bgcolor: 'background.paper',
      borderRadius: '10px',
      minWidth: { xs: '100%', sm: 300 },
     }}
    />

    <FormControlLabel
     control={
      <Switch
       checked={showInactive}
       onChange={(e) => setShowInactive(e.target.checked)}
       color='primary'
      />
     }
     label={
      <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary' }}>
       แสดงหอผู้ป่วยที่ปิดใช้งาน ({wards.filter((w) => !w.isActive).length})
      </Typography>
     }
    />
   </Box>

   {isLoading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
     <CircularProgress size={32} />
    </Box>
   ) : filteredWards.length === 0 ? (
    <Card sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
     <Typography variant='h6' sx={{ color: 'text.secondary', mb: 1 }}>
      ไม่พบข้อมูลหอผู้ป่วย
     </Typography>
     <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
      กดปุ่ม &quot;เพิ่ม Ward ใหม่&quot; ด้านบนเพื่อเพิ่มหอผู้ป่วยแรกเข้าสู่ระบบ
     </Typography>
     <Button
      variant='outlined'
      startIcon={<AddRoundedIcon />}
      onClick={handleOpenCreateModal}
      sx={{ borderRadius: '8px', textTransform: 'none' }}
     >
      เพิ่ม Ward ใหม่
     </Button>
    </Card>
   ) : (
    <Grid container spacing={2.5}>
     {filteredWards.map((ward) => {
      const isUpdating = updatingWardId === ward._id
      const currentBeds = ward.totalBeds ?? 10

      return (
       <Grid key={ward._id || ward.code} size={{ xs: 12, md: 6, lg: 4 }}>
        <Card
         sx={{
          borderRadius: '16px',
          border: ward.isActive ? '1px solid #E2E8F0' : '1px dashed #CBD5E1',
          opacity: ward.isActive ? 1 : 0.75,
          transition: 'all 0.2s ease-in-out',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          '&:hover': {
           boxShadow: ward.isActive ? '0 10px 25px -5px rgba(0,0,0,0.06)' : 'none',
           borderColor: ward.isActive ? '#94A3B8' : '#CBD5E1',
          },
         }}
        >
         <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Stack
           direction='row'
           sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
          >
           <Chip
            label={ward.code}
            sx={{
             fontWeight: 800,
             fontSize: '0.85rem',
             bgcolor: ward.isActive ? '#0D9488' : '#64748B',
             color: '#FFFFFF',
             borderRadius: '8px',
             px: 0.5,
             height: 28,
            }}
           />

           <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
            <Chip
             size='small'
             label={ward.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
             sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: ward.isActive ? '#DCFCE7' : '#F1F5F9',
              color: ward.isActive ? '#059669' : '#64748B',
              borderRadius: '6px',
             }}
            />

            <Tooltip title='แก้ไขข้อมูล'>
             <IconButton size='small' onClick={() => handleOpenEditModal(ward)}>
              <EditRoundedIcon sx={{ fontSize: 18 }} />
             </IconButton>
            </Tooltip>

            <Tooltip title={ward.isActive ? 'ปิดการใช้งาน' : 'เปิดใช้งาน'}>
             <IconButton
              size='small'
              color={ward.isActive ? 'error' : 'success'}
              onClick={() => handleToggleActive(ward)}
             >
              {ward.isActive ? (
               <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
               <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
              )}
             </IconButton>
            </Tooltip>
           </Stack>
          </Stack>

          <Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
           {ward.name}
          </Typography>

          <Typography
           variant='body2'
           sx={{
            color: 'text.secondary',
            mb: 2,
            minHeight: 40,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
           }}
          >
           {ward.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
          </Typography>

          <Box
           sx={{
            mt: 'auto',
            p: 2,
            borderRadius: '12px',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#1E293B' : '#F8FAFC'),
            border: '1px solid #E2E8F0',
           }}
          >
           <Stack direction='row' sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
             <BedRoundedIcon sx={{ fontSize: 18, color: '#0D9488' }} />
             <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary' }}>
              จำนวนเตียงรองรับ
             </Typography>
            </Stack>

            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
             เป้าหมาย {ward.targetMonthlyAdmissions ?? 18} ราย/เดือน
            </Typography>
           </Stack>

           <Box
            sx={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             bgcolor: 'background.paper',
             p: 1,
             borderRadius: '10px',
             border: '1px solid #E2E8F0',
            }}
           >
            <Tooltip title='ลดจำนวนเตียง'>
             <span>
              <IconButton
               size='small'
               disabled={isUpdating || currentBeds <= 1 || !ward.isActive}
               onClick={() => handleBedStep(ward, -1)}
               sx={{
                bgcolor: '#F1F5F9',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#E2E8F0' },
               }}
              >
               <RemoveRoundedIcon fontSize='small' />
              </IconButton>
             </span>
            </Tooltip>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
             {isUpdating ? (
              <CircularProgress size={20} sx={{ mx: 2 }} />
             ) : (
              <>
               <Typography variant='h5' sx={{ fontWeight: 800, color: '#1E293B' }}>
                {currentBeds}
               </Typography>
               <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                เตียง
               </Typography>
              </>
             )}
            </Box>

            <Tooltip title='เพิ่มจำนวนเตียง'>
             <span>
              <IconButton
               size='small'
               disabled={isUpdating || !ward.isActive}
               onClick={() => handleBedStep(ward, 1)}
               sx={{
                bgcolor: '#F1F5F9',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#E2E8F0' },
               }}
              >
               <AddRoundedIcon fontSize='small' />
              </IconButton>
             </span>
            </Tooltip>
           </Box>
          </Box>
         </CardContent>
        </Card>
       </Grid>
      )
     })}
    </Grid>
   )}

   <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth='sm' fullWidth>
    <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
     {editingWard ? `แก้ไขข้อมูลหอผู้ป่วย (${editingWard.code})` : 'เพิ่มหอผู้ป่วยใหม่ (New Ward)'}
    </DialogTitle>
    <Divider />
    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
     <TextField
      label='รหัสหอผู้ป่วย (Ward Code)*'
      placeholder='เช่น SICU, CCU, MICU3'
      value={formData.code}
      disabled={Boolean(editingWard)}
      onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
      helperText={editingWard ? 'ไม่สามารถแก้ไขรหัส Ward ได้' : 'ตัวอักษรภาษาอังกฤษตัวพิมพ์ใหญ่'}
      fullWidth
     />

     <TextField
      label='ชื่อหอผู้ป่วย (Ward Name)*'
      placeholder='เช่น หอผู้ป่วยวิกฤตศัลยกรรม (SICU)'
      value={formData.name}
      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
      fullWidth
     />

     <TextField
      label='คำอธิบาย / รายละเอียด'
      placeholder='เช่น Surgical Intensive Care Unit'
      value={formData.description}
      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
      multiline
      rows={2}
      fullWidth
     />

     <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
       <TextField
        type='number'
        label='จำนวนเตียงรองรับ (Total Beds)*'
        value={formData.totalBeds}
        onChange={(e) =>
         setFormData((prev) => ({ ...prev, totalBeds: Math.max(1, Number(e.target.value)) }))
        }
        slotProps={{ htmlInput: { min: 1 } }}
        fullWidth
       />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
       <TextField
        type='number'
        label='เป้าหมายรับผู้ป่วยต่อเดือน'
        value={formData.targetMonthlyAdmissions}
        onChange={(e) =>
         setFormData((prev) => ({
          ...prev,
          targetMonthlyAdmissions: Math.max(0, Number(e.target.value)),
         }))
        }
        slotProps={{ htmlInput: { min: 0 } }}
        fullWidth
       />
      </Grid>
     </Grid>

     {editingWard && (
      <FormControlLabel
       control={
        <Switch
         checked={formData.isActive}
         onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
         color='primary'
        />
       }
       label={
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
         สถานะเปิดใช้งาน (Active)
        </Typography>
       }
      />
     )}
    </DialogContent>
    <Divider />
    <DialogActions sx={{ p: 2 }}>
     <Button onClick={handleCloseModal} disabled={isSubmitting} sx={{ textTransform: 'none' }}>
      ยกเลิก
     </Button>
     <Button
      variant='contained'
      onClick={handleSubmitModal}
      disabled={isSubmitting}
      sx={{
       bgcolor: '#0D9488',
       textTransform: 'none',
       fontWeight: 700,
       px: 3,
       '&:hover': { bgcolor: '#0b8a64' },
      }}
     >
      {isSubmitting ? <CircularProgress size={20} color='inherit' /> : 'บันทึก'}
     </Button>
    </DialogActions>
   </Dialog>
  </Box>
 )
}
