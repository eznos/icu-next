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
 {
  label: string
  bg: (theme: any) => string
  color: (theme: any) => string
  border: (theme: any) => string
 }
> = {
 refer: {
  label: 'Fastack (Refer)',
  bg: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(219, 39, 119, 0.15)' : '#FDF2F8',
  color: (theme: any) =>
   theme.palette.mode === 'dark' ? '#F472B6' : '#DB2777',
  border: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(219, 39, 119, 0.3)' : '#FBCFE8',
 },
 transfer: {
  label: 'รับย้าย',
  bg: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(147, 51, 234, 0.15)' : '#F3E8FF',
  color: (theme: any) =>
   theme.palette.mode === 'dark' ? '#C084FC' : '#9333EA',
  border: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(147, 51, 234, 0.3)' : '#E9D5FF',
 },
 admit: {
  label: 'รับใหม่',
  bg: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.15)' : '#EFF6FF',
  color: (theme: any) =>
   theme.palette.mode === 'dark' ? '#60A5FA' : '#2563EB',
  border: (theme: any) =>
   theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.3)' : '#BFDBFE',
 },
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
      border: '1.5px solid',
      borderColor: (theme) =>
       theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.5)' : '#10B981',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '0.875rem',
      color: (theme) =>
       theme.palette.mode === 'dark' ? '#34D399' : '#047857',
      bgcolor: (theme) =>
       theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
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
     <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
      {row.patientName}
     </Typography>
     <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
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
    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
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
     <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
      {row.diagnosis}
     </Typography>
     <Typography
      variant='caption'
      sx={{
       color: (theme) =>
        theme.palette.mode === 'dark' ? '#34D399' : '#059669',
       fontWeight: 600,
       display: 'block',
       mt: 0.25,
      }}
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
      bg: (theme: any) =>
       theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
      color: (theme: any) =>
       theme.palette.mode === 'dark' ? '#94A3B8' : '#475569',
      border: (theme: any) =>
       theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
     }
    const formattedDate = row.admissionDate
     ? dayjs(row.admissionDate).format('YYYY-MM-DD')
     : '-'

    return (
     <Box>
      <Typography variant='body2' sx={{ color: 'text.primary', mb: 0.5 }}>
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
        border: '1px solid',
        borderColor: badge.border,
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
       bgcolor: (theme) =>
        isAdmitted
         ? theme.palette.mode === 'dark'
           ? 'rgba(239, 68, 68, 0.15)'
           : '#FEF2F2'
         : theme.palette.mode === 'dark'
           ? 'rgba(148, 163, 184, 0.12)'
           : '#F1F5F9',
       color: (theme) =>
        isAdmitted
         ? theme.palette.mode === 'dark'
           ? '#F87171'
           : '#DC2626'
         : theme.palette.mode === 'dark'
           ? '#94A3B8'
           : '#64748B',
       border: '1px solid',
       borderColor: (theme) =>
        isAdmitted
         ? theme.palette.mode === 'dark'
           ? 'rgba(239, 68, 68, 0.3)'
           : '#FECACA'
         : theme.palette.mode === 'dark'
           ? 'rgba(148, 163, 184, 0.25)'
           : '#E2E8F0',
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
      sx={{
       color: 'text.secondary',
       '&:hover': {
        color: '#0da176',
        bgcolor: (theme) =>
         theme.palette.mode === 'dark'
          ? 'rgba(20, 184, 166, 0.1)'
          : '#F1F5F9',
       },
      }}
     >
      <PersonOutlineIcon sx={{ fontSize: 20 }} />
     </IconButton>
     <IconButton
      size='small'
      onClick={() => onRowClick?.(row, 'delete')}
      sx={{
       color: 'text.secondary',
       '&:hover': {
        color: '#DC2626',
        bgcolor: (theme) =>
         theme.palette.mode === 'dark'
          ? 'rgba(220, 38, 38, 0.1)'
          : '#FEF2F2',
       },
      }}
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
     sx={{ fontWeight: 700, color: 'text.primary', mr: 'auto' }}
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
       bgcolor: 'background.paper',
       color: 'text.primary',
       fontSize: '0.875rem',
       border: '1px solid',
       borderColor: 'divider',
       '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
       },
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
