'use client'

import {
 BedAssessmentStatusItem,
 DailyAssessmentData,
 deleteAssessment,
 useBedAssessmentStatus,
} from '@/apis/assessment'
import { useCurrentUser } from '@/apis/auth/me'
import { useWardList } from '@/apis/ward'
import { DailyAssessmentModal } from '@/components/admin/dashboard/dailyAssessmentModal'
import { BedAssessmentDetailModal } from '@/components/admin/reports/bedAssessmentDetailModal'
import { Column, TableList } from '@/components/utils'
import { TitlePage } from '@/components/utils/titlePage'
import { useSnackBarNotification } from '@/hooks'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import HotelRoundedIcon from '@mui/icons-material/HotelRounded'
import {
 Box,
 Button,
 Card,
 CardContent,
 Chip,
 Divider,
 Grid,
 IconButton,
 MenuItem,
 Stack,
 Tab,
 Tabs,
 TextField,
 Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

type BedAssessmentRow = {
 [key: string]: unknown
 bedIndex: number
 bedNumber: string
 status: 'Available' | 'Occupied'
 patient: {
  patientId: string
  an: string
  hn: string
  patientName: string
  diagnosis: string
  admissionDate: string
 } | null
 isAssessed: boolean
 checkCount: number
 latestCheck: DailyAssessmentData | null
 checks: DailyAssessmentData[]
 patientNameSearch: string
 anSearch: string
 hnSearch: string
}

export default function ReportsPage() {
 const { showSnackbar } = useSnackBarNotification()
 const { user } = useCurrentUser()
 //  const { data: wardResponse } = useWardList()

 //  const wardList = useMemo(() => wardResponse?.data || [], [wardResponse])
 const [selectedWard, setSelectedWard] = useState<string>('')

 useEffect(() => {
  if (!selectedWard) {
   if (user?.ward) {
    setSelectedWard(user.ward)
   }
  }
 }, [user?.ward, selectedWard])

 const activeWard = selectedWard || user?.ward || 'MICU3'
 const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
 const [statusFilter, setStatusFilter] = useState('all')

 const {
  data: statusResponse,
  isLoading,
  mutate,
 } = useBedAssessmentStatus(activeWard, selectedDate)

 const [activeModalPatient, setActiveModalPatient] = useState<{
  patientId: string
  an: string
  hn: string
  patientName: string
  bedNumber: string
  ward: string
 } | null>(null)
 const [editingAssessment, setEditingAssessment] =
  useState<DailyAssessmentData | null>(null)

 const [viewingBedDetail, setViewingBedDetail] = useState<
  BedAssessmentStatusItem | BedAssessmentRow | null
 >(null)

 const summary = statusResponse?.data
 const beds = summary?.beds || []

 const currentViewingBed = useMemo(() => {
  if (!viewingBedDetail) return null
  return (
   beds.find((b) => b.bedNumber === viewingBedDetail.bedNumber) ||
   viewingBedDetail
  )
 }, [beds, viewingBedDetail])

 const rows: BedAssessmentRow[] = useMemo(() => {
  return beds.map((b) => ({
   ...b,
   patientNameSearch: b.patient?.patientName || '',
   anSearch: b.patient?.an || '',
   hnSearch: b.patient?.hn || '',
  }))
 }, [beds])

 const tabCounts = useMemo(() => {
  const total = rows.length
  const pending = rows.filter(
   (r) => r.status === 'Occupied' && !r.isAssessed,
  ).length
  const checked = rows.filter(
   (r) => r.status === 'Occupied' && r.isAssessed,
  ).length
  const available = rows.filter((r) => r.status === 'Available').length
  return { total, pending, checked, available }
 }, [rows])

 const filteredRows = useMemo(() => {
  return rows.filter((row) => {
   if (statusFilter === 'pending') {
    return row.status === 'Occupied' && !row.isAssessed
   }
   if (statusFilter === 'checked') {
    return row.status === 'Occupied' && row.isAssessed
   }
   if (statusFilter === 'available') {
    return row.status === 'Available'
   }
   return true
  })
 }, [rows, statusFilter])

 const handleOpenNewAssessment = (
  bed: BedAssessmentRow | BedAssessmentStatusItem,
 ) => {
  if (!bed.patient) return
  setActiveModalPatient({
   patientId: bed.patient.patientId,
   an: bed.patient.an,
   hn: bed.patient.hn,
   patientName: bed.patient.patientName,
   bedNumber: bed.bedNumber,
   ward: activeWard,
  })
  setEditingAssessment(null)
 }

 const handleEditAssessment = (
  bed: BedAssessmentStatusItem,
  assessment: DailyAssessmentData,
 ) => {
  if (!bed.patient) return
  setActiveModalPatient({
   patientId: bed.patient.patientId,
   an: bed.patient.an,
   hn: bed.patient.hn,
   patientName: bed.patient.patientName,
   bedNumber: bed.bedNumber,
   ward: activeWard,
  })
  setEditingAssessment(assessment)
 }

 const handleDeleteAssessment = async (id?: string) => {
  if (!id) return
  if (!confirm('ยืนยันที่จะลบข้อมูลการประเมินรอบเวลานี้?')) return

  try {
   await deleteAssessment(id)
   showSnackbar('ลบข้อมูลการประเมินสำเร็จ', 'success')
   mutate()
  } catch (error: any) {
   showSnackbar(error.message || 'ลบไม่สำเร็จ', 'error')
  }
 }

 const columns: Column<BedAssessmentRow>[] = [
  {
   key: 'bedNumber',
   label: 'เตียง',
   width: 120,
   sortable: true,
   renderCell: (row) => {
    const isOccupied = row.status === 'Occupied'
    return (
     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <HotelRoundedIcon
       sx={{
        fontSize: 20,
        color: isOccupied
         ? row.isAssessed
           ? '#059669'
           : '#DC2626'
         : '#94A3B8',
       }}
      />
      <Typography
       sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}
      >
       {row.bedNumber}
      </Typography>
     </Box>
    )
   },
  },
  {
   key: 'patientInfo',
   label: 'ข้อมูลผู้ป่วย',
   width: 220,
   renderCell: (row) => {
    if (row.status !== 'Occupied' || !row.patient) {
     return (
      <Typography
       variant='body2'
       sx={{ color: 'text.secondary', fontStyle: 'italic' }}
      >
       เตียงว่าง (Available)
      </Typography>
     )
    }

    return (
     <Box>
      <Typography
       sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}
      >
       {row.patient.patientName}
      </Typography>
      <Typography
       variant='caption'
       sx={{ color: 'text.secondary', display: 'block' }}
      >
       HN: {row.patient.hn} | AN: {row.patient.an}
      </Typography>
      <Typography
       variant='caption'
       sx={{ color: 'text.secondary', display: 'block' }}
      >
       Dx: {row.patient.diagnosis}
      </Typography>
     </Box>
    )
   },
  },
  {
   key: 'assessmentStatus',
   label: 'สถานะการตรวจ',
   width: 190,
   renderCell: (row) => {
    if (row.status !== 'Occupied') {
     return (
      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
       -
      </Typography>
     )
    }

    const latest = row.latestCheck
    if (row.isAssessed) {
     return (
      <Box>
       <Box
        component='span'
        onClick={(e) => {
         e.stopPropagation()
         setViewingBedDetail(row)
        }}
        sx={{
         cursor: 'pointer',
         display: 'inline-flex',
         alignItems: 'center',
         gap: 0.5,
         px: 1,
         py: 0.35,
         borderRadius: '6px',
         fontSize: '0.75rem',
         fontWeight: 700,
         bgcolor: (theme) =>
          theme.palette.mode === 'dark'
           ? 'rgba(16, 185, 129, 0.15)'
           : '#ECFDF5',
         color: (theme) =>
          theme.palette.mode === 'dark' ? '#34D399' : '#047857',
         border: '1px solid',
         borderColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0',
         '&:hover': {
          bgcolor: (theme) =>
           theme.palette.mode === 'dark'
            ? 'rgba(16, 185, 129, 0.25)'
            : '#D1FAE5',
         },
        }}
       >
        <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
        ตรวจแล้ว {row.checkCount} ครั้ง
       </Box>
       <Typography
        variant='caption'
        sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}
       >
        ล่าสุด: {dayjs(latest?.recordDate).format('HH:mm น.')} (
        {latest?.recordedByName || latest?.recordedBy || 'Staff'})
       </Typography>
      </Box>
     )
    }

    return (
     <Box
      component='span'
      sx={{
       display: 'inline-flex',
       alignItems: 'center',
       gap: 0.5,
       px: 1,
       py: 0.35,
       borderRadius: '6px',
       fontSize: '0.75rem',
       fontWeight: 700,
       bgcolor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#FFF1F2',
       color: (theme) =>
        theme.palette.mode === 'dark' ? '#F87171' : '#BE123C',
       border: '1px solid',
       borderColor: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#FECDD3',
      }}
     >
      <ErrorOutlineRoundedIcon sx={{ fontSize: 14 }} />
      ยังไม่ได้ตรวจวันนี้
     </Box>
    )
   },
  },
  {
   key: 'devices',
   label: 'อุปกรณ์การแพทย์ (ล่าสุด)',
   width: 200,
   renderCell: (row) => {
    const latest = row.latestCheck
    if (row.status !== 'Occupied' || !latest) {
     return (
      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
       -
      </Typography>
     )
    }

    const hasAnyDevice =
     latest.hasVentilator || latest.hasCentralLine || latest.hasFoleyCatheter

    if (!hasAnyDevice) {
     return (
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
       ไม่มีอุปกรณ์
      </Typography>
     )
    }

    return (
     <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {latest.hasVentilator && (
       <Chip
        label='Vent'
        size='small'
        sx={{
         height: 20,
         fontSize: '0.68rem',
         bgcolor: '#E0F2FE',
         color: '#0369A1',
        }}
       />
      )}
      {latest.hasCentralLine && (
       <Chip
        label='C-Line'
        size='small'
        sx={{
         height: 20,
         fontSize: '0.68rem',
         bgcolor: '#FEF3C7',
         color: '#B45309',
        }}
       />
      )}
      {latest.hasFoleyCatheter && (
       <Chip
        label='Foley'
        size='small'
        sx={{
         height: 20,
         fontSize: '0.68rem',
         bgcolor: '#F3E8FF',
         color: '#7E22CE',
        }}
       />
      )}
     </Box>
    )
   },
  },
  {
   key: 'incidents',
   label: 'การติดเชื้อ / อุบัติการณ์',
   width: 200,
   renderCell: (row) => {
    const latest = row.latestCheck
    if (row.status !== 'Occupied' || !latest) {
     return (
      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
       -
      </Typography>
     )
    }

    const hasEvents =
     latest.hasVap ||
     latest.hasClabsi ||
     latest.hasCauti ||
     Boolean(latest.unplannedExtubation) ||
     (latest.pressureInjuryStage && latest.pressureInjuryStage !== 'none') ||
     Boolean(latest.medicationErrorGradeEUp)

    if (!hasEvents) {
     return (
      <Typography variant='caption' sx={{ color: '#059669', fontWeight: 600 }}>
       ปลอดภัยปกติ (Zero Events)
      </Typography>
     )
    }

    return (
     <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {latest.hasVap && (
       <Chip
        label='VAP'
        size='small'
        color='error'
        sx={{ height: 20, fontSize: '0.65rem' }}
       />
      )}
      {latest.hasClabsi && (
       <Chip
        label='CLABSI'
        size='small'
        color='error'
        sx={{ height: 20, fontSize: '0.65rem' }}
       />
      )}
      {latest.hasCauti && (
       <Chip
        label='CAUTI'
        size='small'
        color='error'
        sx={{ height: 20, fontSize: '0.65rem' }}
       />
      )}
      {Boolean(latest.unplannedExtubation) && (
       <Chip
        label={`ท่อหลุด ${latest.unplannedExtubation}`}
        size='small'
        color='error'
        sx={{ height: 20, fontSize: '0.65rem' }}
       />
      )}
      {latest.pressureInjuryStage && latest.pressureInjuryStage !== 'none' && (
       <Chip
        label={`แผลกดทับ ${latest.pressureInjuryStage}`}
        size='small'
        color='warning'
        sx={{ height: 20, fontSize: '0.65rem' }}
       />
      )}
     </Box>
    )
   },
  },
  {
   key: 'actions',
   label: 'การจัดการ',
   width: 260,
   align: 'right',
   headerAlign: 'right',
   renderCell: (row) => {
    if (row.status !== 'Occupied') return null

    return (
     <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Button
       size='small'
       variant='contained'
       onClick={() => handleOpenNewAssessment(row)}
       startIcon={
        <AddCircleOutlineRoundedIcon sx={{ fontSize: '15px !important' }} />
       }
       sx={{
        bgcolor: '#0da176',
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.78rem',
        '&:hover': { bgcolor: '#0b8a64' },
       }}
      >
       ประเมินรอบใหม่
      </Button>

      {row.checkCount > 0 && (
       <Button
        size='small'
        variant='outlined'
        onClick={(e) => {
         e.stopPropagation()
         setViewingBedDetail(row)
        }}
        startIcon={<HistoryRoundedIcon sx={{ fontSize: '15px !important' }} />}
        sx={{
         borderRadius: '8px',
         textTransform: 'none',
         fontSize: '0.78rem',
         borderColor: 'divider',
         color: 'text.secondary',
         '&:hover': { borderColor: 'text.primary' },
        }}
       >
        รอบเวลา ({row.checkCount})
       </Button>
      )}
     </Box>
    )
   },
  },
 ]

 return (
  <Box
   sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
    width: '100%',
    minWidth: 0,
   }}
  >
   <TitlePage
    title='รายงานการตรวจประเมินเตียงประจำวัน (Bed Assessment Round Sheet)'
    actions={
     <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
     >
      {/* <TextField
       select
       size='small'
       label='หอผู้ป่วย (Ward)'
       value={activeWard}
       onChange={(e) => setSelectedWard(e.target.value)}
       sx={{
        bgcolor: 'background.paper',
        borderRadius: '8px',
        minWidth: 160,
       }}
      >
       {wardList.length > 0 ? (
        wardList.map((w) => (
         <MenuItem key={w.code} value={w.code}>
          {w.code} - {w.name}
         </MenuItem>
        ))
       ) : (
        <MenuItem value={activeWard}>{activeWard}</MenuItem>
       )}
      </TextField> */}
      <TextField
       type='date'
       size='small'
       value={selectedDate}
       onChange={(e) => setSelectedDate(e.target.value)}
       sx={{ bgcolor: 'background.paper', borderRadius: '8px' }}
      />
      <Button
       variant='outlined'
       size='small'
       onClick={() => setSelectedDate(dayjs().format('YYYY-MM-DD'))}
       sx={{ borderRadius: '8px', textTransform: 'none', px: 2 }}
      >
       วันนี้
      </Button>
     </Box>
    }
   />

   <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
     <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0' }}>
      <CardContent sx={{ p: 2 }}>
       <Typography
        variant='caption'
        sx={{ color: 'text.secondary', fontWeight: 600 }}
       >
        เตียงที่มีผู้ป่วยนอน (Occupied)
       </Typography>
       <Typography
        variant='h5'
        sx={{ fontWeight: 800, color: '#1E293B', mt: 0.5 }}
       >
        {summary?.occupiedBedsCount || 0} /{' '}
        {summary?.totalBeds || beds.length || 10} เตียง
       </Typography>
      </CardContent>
     </Card>
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
     <Card
      sx={{
       borderRadius: '14px',
       border: '1px solid #A7F3D0',
       bgcolor: '#F0FDF4',
      }}
     >
      <CardContent sx={{ p: 2 }}>
       <Typography variant='caption' sx={{ color: '#047857', fontWeight: 700 }}>
        ตรวจประเมินแล้ววันนี้ (Checked)
       </Typography>
       <Typography
        variant='h5'
        sx={{ fontWeight: 800, color: '#065F46', mt: 0.5 }}
       >
        {summary?.checkedBedsCount || 0} เตียง
       </Typography>
      </CardContent>
     </Card>
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
     <Card
      sx={{
       borderRadius: '14px',
       border: '1px solid #FECDD3',
       bgcolor: '#FFF1F2',
      }}
     >
      <CardContent sx={{ p: 2 }}>
       <Typography variant='caption' sx={{ color: '#BE123C', fontWeight: 700 }}>
        ยังไม่ได้รับการตรวจ (Pending)
       </Typography>
       <Typography
        variant='h5'
        sx={{ fontWeight: 800, color: '#9F1239', mt: 0.5 }}
       >
        {summary?.pendingBedsCount || 0} เตียง
       </Typography>
      </CardContent>
     </Card>
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
     <Card
      sx={{
       borderRadius: '14px',
       border: '1px solid #E2E8F0',
       bgcolor: '#F8FAFC',
      }}
     >
      <CardContent sx={{ p: 2 }}>
       <Typography
        variant='caption'
        sx={{ color: 'text.secondary', fontWeight: 600 }}
       >
        เตียงว่าง (Available)
       </Typography>
       <Typography
        variant='h5'
        sx={{ fontWeight: 800, color: '#64748B', mt: 0.5 }}
       >
        {(summary?.totalBeds || 10) - (summary?.occupiedBedsCount || 0)} เตียง
       </Typography>
      </CardContent>
     </Card>
    </Grid>
   </Grid>

   <TableList<BedAssessmentRow>
    rowKey={(row) => row.bedNumber}
    columns={columns}
    rows={filteredRows}
    pageSize={Math.max(50, filteredRows.length)}
    loading={isLoading}
    searchPlaceholder='ค้นหาเตียง, ชื่อผู้ป่วย, HN, AN...'
    searchKeys={['bedNumber', 'patientNameSearch', 'anSearch', 'hnSearch']}
    tabs={
     <Tabs
      value={statusFilter}
      onChange={(_, val) => setStatusFilter(val)}
      variant='scrollable'
      scrollButtons='auto'
      sx={{
       minHeight: 48,
       '& .MuiTabs-indicator': {
        backgroundColor: statusFilter === 'pending' ? '#BE123C' : '#0D9488',
        height: 2.5,
        borderRadius: '2px 2px 0 0',
       },
      }}
     >
      <Tab
       value='all'
       label={`ทุกลำดับเตียง (${tabCounts.total})`}
       sx={{
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.875rem',
        minHeight: 48,
        minWidth: 'auto',
        px: { xs: 1.5, sm: 2.5 },
        color: 'text.secondary',
        '&.Mui-selected': {
         color: '#0D9488',
        },
       }}
      />
      <Tab
       value='pending'
       label={`รอการตรวจประเมิน (${tabCounts.pending})`}
       sx={{
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.875rem',
        minHeight: 48,
        minWidth: 'auto',
        px: { xs: 1.5, sm: 2.5 },
        color: tabCounts.pending > 0 ? '#BE123C' : 'text.secondary',
        '&.Mui-selected': {
         color: '#BE123C',
        },
       }}
      />
      <Tab
       value='checked'
       label={`ตรวจแล้ว (${tabCounts.checked})`}
       sx={{
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.875rem',
        minHeight: 48,
        minWidth: 'auto',
        px: { xs: 1.5, sm: 2.5 },
        color: 'text.secondary',
        '&.Mui-selected': {
         color: '#0D9488',
        },
       }}
      />
      <Tab
       value='available'
       label={`เตียงว่าง (${tabCounts.available})`}
       sx={{
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.875rem',
        minHeight: 48,
        minWidth: 'auto',
        px: { xs: 1.5, sm: 2.5 },
        color: 'text.secondary',
        '&.Mui-selected': {
         color: '#0D9488',
        },
       }}
      />
     </Tabs>
    }
    title={
     <Typography
      variant='subtitle1'
      sx={{ fontWeight: 700, color: 'text.primary', mr: 'auto' }}
     >
      สถานะการตรวจประเมินเตียง ({activeWard} - {selectedDate}):{' '}
      {filteredRows.length} เตียง
     </Typography>
    }
    tableContainerProps={{
     sx: {
      overflowX: 'auto',
      overflowY: 'auto',
      width: '100%',
     },
    }}
    onRowClick={(row) => {
     if (row.status === 'Occupied') setViewingBedDetail(row)
    }}
   />

   <DailyAssessmentModal
    open={Boolean(activeModalPatient)}
    onClose={() => {
     setActiveModalPatient(null)
     setEditingAssessment(null)
    }}
    onSuccess={() => mutate()}
    patient={activeModalPatient}
    initialData={editingAssessment}
   />

   <BedAssessmentDetailModal
    open={Boolean(currentViewingBed)}
    onClose={() => setViewingBedDetail(null)}
    bed={currentViewingBed}
    selectedDate={selectedDate}
    onOpenNewAssessment={handleOpenNewAssessment}
    onEditAssessment={handleEditAssessment}
    onDeleteAssessment={handleDeleteAssessment}
   />
  </Box>
 )
}
