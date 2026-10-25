'use client'

import { Column, TableList } from '@/components/utils'
import { PatientType } from '@/types'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import {
 Box,
 FormControl,
 IconButton,
 MenuItem,
 Select,
 SelectChangeEvent,
 Typography,
} from '@mui/material'
import dayjs from 'dayjs'

type PatientTableListProps = {
 data?: PatientType[]
 isLoading?: boolean
 onRowClick?: (row: PatientType, event: 'edit' | 'delete') => void
 statusFilter?: string
 onStatusFilterChange?: (status: string) => void
}

const admissionTypeBadgeConfig: Record<
 string,
 { label: string; bg: string; color: string; border: string }
> = {
 refer: { label: 'Fastack (Refer)', bg: '#FDF2F8', color: '#DB2777', border: '#FBCFE8' },
 transfer: { label: 'รับย้าย', bg: '#F3E8FF', color: '#9333EA', border: '#E9D5FF' },
 admit: { label: 'รับใหม่', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
}

export const PatientTableList = ({
 data,
 isLoading,
 onRowClick,
 statusFilter = '',
 onStatusFilterChange,
}: PatientTableListProps) => {
 const handleStatusChange = (event: SelectChangeEvent<string>) => {
  onStatusFilterChange?.(event.target.value)
 }

 const filteredData = statusFilter
  ? (data || []).filter((item) => item.status === statusFilter)
  : (data || [])

 const columns: Column<PatientType>[] = [
  {
   key: 'bedNumber',
   label: 'เตียง',
   width: 80,
   renderCell: (row) => (
    <Box
     sx={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: '1.5px solid #10B981',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '0.875rem',
      color: '#047857',
      bgcolor: '#ECFDF5',
     }}
    >
     {row.bedNumber.replace(/[^0-9]/g, '') || row.bedNumber}
    </Box>
   ),
  },
  {
   key: 'patientInfo',
   label: 'ข้อมูลผู้ป่วย (HN / AN)',
   width: 220,
   renderCell: (row) => (
    <Box>
     <Typography variant='body2' sx={{ fontWeight: 700, color: '#1E293B' }}>
      {row.patientName}
     </Typography>
     <Typography variant='caption' sx={{ color: '#64748B', display: 'block', mt: 0.25 }}>
      HN: {row.hn} | AN: {row.an}
     </Typography>
    </Box>
   ),
  },
  {
   key: 'hometown',
   label: 'ภูมิลำเนา',
   width: 160,
   renderCell: (row) => (
    <Typography variant='body2' sx={{ color: '#475569' }}>
     {row.hometown}
    </Typography>
   ),
  },
  {
   key: 'diagnosisInfo',
   label: 'การวินิจฉัย (DX.) / แพทย์',
   width: 240,
   renderCell: (row) => (
    <Box>
     <Typography variant='body2' sx={{ fontWeight: 700, color: '#1E293B' }}>
      {row.diagnosis}
     </Typography>
     <Typography
      variant='caption'
      sx={{ color: '#059669', fontWeight: 600, display: 'block', mt: 0.25 }}
     >
      แพทย์: {row.attendingDoctor}
     </Typography>
    </Box>
   ),
  },
  {
   key: 'admissionInfo',
   label: 'วันที่ ADMIT / ประเภท',
   width: 170,
   renderCell: (row) => {
    const badge =
     admissionTypeBadgeConfig[row.admissionType] || {
      label: row.admissionType,
      bg: '#F1F5F9',
      color: '#475569',
      border: '#E2E8F0',
     }
    const formattedDate = row.admissionDate
     ? dayjs(row.admissionDate).format('YYYY-MM-DD')
     : '-'

    return (
     <Box>
      <Typography variant='body2' sx={{ color: '#1E293B', mb: 0.5 }}>
       {formattedDate}
      </Typography>
      <Box
       component='span'
       sx={{
        display: 'inline-block',
        px: 1,
        py: 0.2,
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 600,
        bgcolor: badge.bg,
        color: badge.color,
        border: `1px solid ${badge.border}`,
       }}
      >
       {badge.label}
      </Box>
     </Box>
    )
   },
  },
  {
   key: 'status',
   label: 'สถานะ',
   width: 130,
   renderCell: (row) => {
    const isAdmitted = row.status === 'admitted'
    return (
     <Box
      component='span'
      sx={{
       display: 'inline-block',
       px: 1.5,
       py: 0.35,
       borderRadius: '16px',
       fontSize: '0.75rem',
       fontWeight: 600,
       bgcolor: isAdmitted ? '#FEF2F2' : '#F1F5F9',
       color: isAdmitted ? '#DC2626' : '#64748B',
       border: `1px solid ${isAdmitted ? '#FECACA' : '#E2E8F0'}`,
      }}
     >
      {isAdmitted ? 'กำลังรักษา' : 'จำหน่ายแล้ว'}
     </Box>
    )
   },
  },
  {
   key: 'actions',
   label: 'การจัดการ',
   width: 100,
   renderCell: (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
     <IconButton
      size='small'
      onClick={() => onRowClick?.(row, 'edit')}
      sx={{ color: '#64748B', '&:hover': { color: '#0da176', bgcolor: '#F1F5F9' } }}
     >
      <PersonOutlineIcon sx={{ fontSize: 20 }} />
     </IconButton>
     <IconButton
      size='small'
      onClick={() => onRowClick?.(row, 'delete')}
      sx={{ color: '#64748B', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
     >
      <DeleteOutlineIcon sx={{ fontSize: 20 }} />
     </IconButton>
    </Box>
   ),
  },
 ]

 return (
  <TableList<PatientType>
   rowKey={(row) => row.objectUuId || row._id || row.an}
   columns={columns}
   rows={filteredData}
   pageSize={20}
   loading={isLoading}
   searchPlaceholder='ค้นหา HN, AN, หรือชื่อผู้ป่วย...'
   searchKeys={['patientName', 'hn', 'an', 'diagnosis', 'attendingDoctor', 'hometown']}
   title={
    <Typography
     variant='subtitle1'
     sx={{ fontWeight: 700, color: '#1E293B', mr: 'auto' }}
    >
     รายการประวัติผู้ป่วยทั้งหมด: {filteredData.length} รายการ
    </Typography>
   }
   toolbarActions={
    <FormControl size='small' sx={{ minWidth: 140 }}>
     <Select
      value={statusFilter}
      onChange={handleStatusChange}
      displayEmpty
      sx={{
       borderRadius: '8px',
       bgcolor: '#fff',
       fontSize: '0.875rem',
      }}
     >
      <MenuItem value=''>ทุกสถานะ</MenuItem>
      <MenuItem value='admitted'>กำลังรักษา</MenuItem>
      <MenuItem value='discharged'>จำหน่ายแล้ว</MenuItem>
     </Select>
    </FormControl>
   }
   tableContainerProps={{
    sx: {
     maxHeight: 'calc(100vh - 280px)',
     overflowY: 'auto',
    },
   }}
  />
 )
}
