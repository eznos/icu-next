'use client'

import { Column, TableList } from '@/components/utils'
import { OfficialType } from '@/types'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LocalPhoneRoundedIcon from '@mui/icons-material/LocalPhoneRounded'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import {
 Avatar,
 Box,
 Button,
 Chip,
 IconButton,
 Typography,
} from '@mui/material'
import dayjs from 'dayjs'

type OfficialTableListProps = {
 data?: OfficialType[]
 isLoading?: boolean
 onRowClick?: (row: OfficialType, event: 'edit' | 'delete') => void
}

export const OfficialTableList = ({
 data,
 isLoading,
 onRowClick,
}: OfficialTableListProps) => {
 const columns: Column<OfficialType>[] = [
  {
   key: 'officialInfo',
   label: 'ข้อมูลเจ้าหน้าที่',
   width: 280,
   renderCell: (row) => {
    const isFemale = row.gender === 'หญิง'
    return (
     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar
       sx={{
        width: 38,
        height: 38,
        bgcolor: isFemale ? '#FFF1F2' : '#F0FDF4',
        border: `1.5px solid ${isFemale ? '#FECDD3' : '#BBF7D0'}`,
        fontSize: '1.15rem',
       }}
      >
       {isFemale ? '👩‍⚕️' : '👨‍⚕️'}
      </Avatar>
      <Box>
       <Typography
        variant='body2'
        sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}
       >
        {row.fullName}
       </Typography>
       <Typography
        variant='caption'
        sx={{ color: '#64748B', display: 'block', mt: 0.25 }}
       >
        เพศ: {row.gender || '-'} | อายุ: {row.age ? `${row.age} ปี` : '-'}
       </Typography>
      </Box>
     </Box>
    )
   },
  },
  {
   key: 'positionAndCompetency',
   label: 'ตำแหน่ง / ระดับความเชี่ยวชาญ',
   width: 250,
   renderCell: (row) => (
    <Box>
     <Typography
      variant='body2'
      sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}
     >
      {row.position || '-'}
     </Typography>
     <Chip label={row.competencyLevel || 'Competent'} />
    </Box>
   ),
  },
  {
   key: 'licenseAndExpiry',
   label: 'เลขที่ใบอนุญาต & วันหมดอายุ',
   width: 280,
   renderCell: (row) => {
    const expiryDayjs = row.licenseExpiryDate
     ? dayjs(row.licenseExpiryDate)
     : null
    const formattedExpiry = expiryDayjs?.isValid()
     ? expiryDayjs.format('YYYY-MM-DD')
     : '-'
    const daysRemaining = expiryDayjs?.isValid()
     ? expiryDayjs.diff(dayjs(), 'day')
     : null
    const isExpiringSoon =
     daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 60
    const isExpired = daysRemaining !== null && daysRemaining < 0

    return (
     <Box>
      <Typography
       variant='body2'
       sx={{ fontWeight: 700, color: '#0F172A', mb: 0.25 }}
      >
       {row.licenseNumber || '-'}
      </Typography>
      <Box
       sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
      >
       <Typography
        variant='caption'
        sx={{ color: '#64748B', fontSize: '0.78rem' }}
       >
        หมดอายุ: {formattedExpiry}
       </Typography>
       {isExpiringSoon && (
        <Box
         component='span'
         sx={{
          display: 'inline-block',
          px: 0.9,
          py: 0.15,
          borderRadius: '4px',
          fontSize: '0.68rem',
          fontWeight: 700,
          bgcolor: '#FEF9C3',
          color: '#854D0E',
          border: '1px solid #FDE047',
          lineHeight: 1.2,
         }}
        >
         หมดอายุใน {daysRemaining} วัน
        </Box>
       )}
       {isExpired && (
        <Box
         component='span'
         sx={{
          display: 'inline-block',
          px: 0.9,
          py: 0.15,
          borderRadius: '4px',
          fontSize: '0.68rem',
          fontWeight: 700,
          bgcolor: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #FECACA',
          lineHeight: 1.2,
         }}
        >
         หมดอายุแล้ว
        </Box>
       )}
      </Box>
     </Box>
    )
   },
  },
  {
   key: 'phoneNumber',
   label: 'เบอร์ติดต่อ',
   width: 170,
   renderCell: (row) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
     <LocalPhoneRoundedIcon sx={{ fontSize: 17, color: '#64748B' }} />
     <Typography
      variant='body2'
      sx={{ fontWeight: 600, color: '#334155', letterSpacing: 0.2 }}
     >
      {row.phoneNumber || '-'}
     </Typography>
    </Box>
   ),
  },
  {
   key: 'document',
   label: 'หลักฐานแนบ (PDF)',
   width: 170,
   renderCell: (row) => (
    <Button
     variant='outlined'
     size='small'
     startIcon={
      <PictureAsPdfIcon
       sx={{ fontSize: '15px !important', color: '#DC2626' }}
      />
     }
     onClick={(e) => {
      e.stopPropagation()
      if (row.licenseDocumentUrl) {
       window.open(row.licenseDocumentUrl, '_blank', 'noopener,noreferrer')
      }
     }}
     disabled={!row.licenseDocumentUrl}
     sx={{
      borderRadius: '20px',
      textTransform: 'none',
      px: 1.5,
      py: 0.35,
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#DC2626',
      bgcolor: '#FEF2F2',
      borderColor: '#FECDD3',
      boxShadow: 'none',
      '&:hover': {
       bgcolor: '#FEE2E2',
       borderColor: '#FDA4AF',
       boxShadow: 'none',
      },
      '&.Mui-disabled': {
       bgcolor: '#F8FAFC',
       borderColor: '#E2E8F0',
       color: '#94A3B8',
      },
     }}
    >
     เปิดดูไฟล์แนบ
    </Button>
   ),
  },
  {
   key: 'actions',
   label: 'การจัดการ',
   width: 90,
   renderCell: (row) => (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
     <IconButton
      size='small'
      onClick={() => onRowClick?.(row, 'edit')}
      sx={{
       color: '#64748B',
       '&:hover': { color: '#0da176', bgcolor: '#F1F5F9' },
      }}
     >
      <EditOutlinedIcon sx={{ fontSize: 18 }} />
     </IconButton>
     <IconButton
      size='small'
      onClick={() => onRowClick?.(row, 'delete')}
      sx={{
       color: '#64748B',
       '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' },
      }}
     >
      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
     </IconButton>
    </Box>
   ),
  },
 ]

 return (
  <TableList<OfficialType>
   rowKey={(row) => row.objectUuId || (row as any)._id || row.fullName}
   columns={columns}
   rows={data || []}
   pageSize={20}
   loading={isLoading}
   tableContainerProps={{
    sx: {
     maxHeight: 'calc(100vh - 280px)',
     overflowY: 'auto',
    },
   }}
   searchKeys={['fullName', 'licenseNumber', 'position', 'phoneNumber']}
   searchPlaceholder='ค้นหาชื่อ, ตำแหน่ง, เลขที่ใบอนุญาต, หรือเบอร์โทร...'
  />
 )
}
