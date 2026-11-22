'use client'

import { useCurrentUser } from '@/apis/auth'
import {
 deleteUser,
 ManagedUser,
 updateUserRole,
 updateUserStatus,
 useUserList,
} from '@/apis/user'
import { Column, TableList } from '@/components/utils'
import { TitlePage } from '@/components/utils/titlePage'
import { useSnackBarNotification } from '@/hooks'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded'
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded'
import PersonOffRoundedIcon from '@mui/icons-material/PersonOffRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded'
import {
 Avatar,
 Box,
 Button,
 Card,
 CardContent,
 Chip,
 Dialog,
 DialogActions,
 DialogContent,
 DialogTitle,
 FormControl,
 Grid,
 IconButton,
 MenuItem,
 Select,
 Stack,
 Tab,
 Tabs,
 Tooltip,
 Typography,
 useTheme,
} from '@mui/material'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

export default function UserManagementPage() {
 const theme = useTheme()
 const isDark = theme.palette.mode === 'dark'
 const { showSnackbar } = useSnackBarNotification()
 const { user: currentUser } = useCurrentUser()
 const { users, isLoading, mutate } = useUserList()

 const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'active' | 'rejected'>('all')
 const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null)
 const [isProcessing, setIsProcessing] = useState(false)

 const counts = useMemo(() => {
  const total = users.length
  const pending = users.filter((u) => u.status === 'pending').length
  const active = users.filter((u) => u.status === 'active').length
  const rejected = users.filter((u) => u.status === 'rejected').length
  return { total, pending, active, rejected }
 }, [users])

 const filteredUsers = useMemo(() => {
  if (statusTab === 'all') return users
  return users.filter((u) => u.status === statusTab)
 }, [users, statusTab])

 const handleStatusChange = async (
  userId: string,
  newStatus: 'pending' | 'active' | 'rejected',
 ) => {
  setIsProcessing(true)
  try {
   await updateUserStatus(userId, newStatus)
   showSnackbar(
    newStatus === 'active'
     ? 'อนุมัติการเข้าใช้งานสำเร็จ'
     : newStatus === 'rejected'
       ? 'ปฏิเสธการเข้าใช้งานเรียบร้อยแล้ว'
       : 'เปลี่ยนสถานะเป็นรอการอนุมัติแล้ว',
    'success',
   )
   mutate()
  } catch (error: any) {
   showSnackbar(error.message || 'เกิดข้อผิดพลาดในการปรับสถานะ', 'error')
  } finally {
   setIsProcessing(false)
  }
 }

 const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
  setIsProcessing(true)
  try {
   await updateUserRole(userId, newRole)
   showSnackbar(`ปรับบทบาทเป็น ${newRole} สำเร็จ`, 'success')
   mutate()
  } catch (error: any) {
   showSnackbar(error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์', 'error')
  } finally {
   setIsProcessing(false)
  }
 }

 const handleDeleteUser = async () => {
  if (!deletingUser) return
  setIsProcessing(true)
  try {
   await deleteUser(deletingUser._id)
   showSnackbar('ลบบัญชีผู้ใช้งานสำเร็จ', 'success')
   mutate()
   setDeletingUser(null)
  } catch (error: any) {
   showSnackbar(error.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้', 'error')
  } finally {
   setIsProcessing(false)
  }
 }

 const columns: Column<ManagedUser>[] = [
  {
   key: 'user',
   label: 'ผู้ใช้งาน',
   width: 240,
   renderCell: (row) => {
    const fullName =
     [row.firstName, row.lastName].filter(Boolean).join(' ') || row.username
    const initial = (row.firstName || row.username || 'U')[0].toUpperCase()

    return (
     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar
       sx={{
        width: 38,
        height: 38,
        bgcolor: row.role === 'admin' ? '#0D9488' : '#3B82F6',
        color: '#FFFFFF',
        fontWeight: 700,
        fontSize: '0.95rem',
       }}
      >
       {initial}
      </Avatar>
      <Box sx={{ lineHeight: 1.3 }}>
       <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
        {fullName}
       </Typography>
       <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
        @{row.username}
       </Typography>
      </Box>
     </Box>
    )
   },
  },
  {
   key: 'email',
   label: 'อีเมล',
   width: 200,
   renderCell: (row) => (
    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
     {row.email}
    </Typography>
   ),
  },
  {
   key: 'ward',
   label: 'หน่วยงาน / วอร์ด',
   width: 130,
   renderCell: (row) => (
    <Chip
     label={row.ward || 'MICU3'}
     size='small'
     sx={{
      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
      fontWeight: 700,
      borderRadius: '6px',
     }}
    />
   ),
  },
  {
   key: 'role',
   label: 'สิทธิ์การใช้งาน',
   width: 140,
   renderCell: (row) => {
    const isSelf = currentUser?.id === row._id

    return (
     <FormControl size='small' sx={{ minWidth: 100 }}>
      <Select
       value={row.role || 'user'}
       disabled={isProcessing || isSelf}
       onChange={(e) => handleRoleChange(row._id, e.target.value as 'user' | 'admin')}
       sx={{
        height: 32,
        fontSize: '0.8rem',
        fontWeight: 700,
        borderRadius: '8px',
        bgcolor: row.role === 'admin' ? (isDark ? 'rgba(13,148,136,0.15)' : '#ECFDF5') : undefined,
        color: row.role === 'admin' ? '#0D9488' : 'text.primary',
        '& .MuiOutlinedInput-notchedOutline': {
         borderColor: row.role === 'admin' ? (isDark ? 'rgba(13,148,136,0.3)' : '#A7F3D0') : 'divider',
        },
       }}
      >
       <MenuItem value='user'>User</MenuItem>
       <MenuItem value='admin'>Admin</MenuItem>
      </Select>
     </FormControl>
    )
   },
  },
  {
   key: 'status',
   label: 'สถานะการอนุมัติ',
   width: 160,
   renderCell: (row) => {
    if (row.status === 'pending') {
     return (
      <Chip
       icon={<HourglassTopRoundedIcon sx={{ fontSize: '14px !important' }} />}
       label='รอการอนุมัติ'
       size='small'
       sx={{
        bgcolor: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7',
        color: isDark ? '#FBBF24' : '#B45309',
        border: '1px solid',
        borderColor: isDark ? 'rgba(245,158,11,0.3)' : '#FDE68A',
        fontWeight: 700,
       }}
      />
     )
    }

    if (row.status === 'active') {
     return (
      <Chip
       icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
       label='อนุมัติแล้ว'
       size='small'
       sx={{
        bgcolor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
        color: isDark ? '#34D399' : '#047857',
        border: '1px solid',
        borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#A7F3D0',
        fontWeight: 700,
       }}
      />
     )
    }

    return (
     <Chip
      icon={<CancelRoundedIcon sx={{ fontSize: '14px !important' }} />}
      label='ปฏิเสธ'
      size='small'
      sx={{
       bgcolor: isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2',
       color: isDark ? '#F87171' : '#B91C1C',
       border: '1px solid',
       borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FECDD3',
       fontWeight: 700,
      }}
     />
    )
   },
  },
  {
   key: 'createdAt',
   label: 'วันที่ลงทะเบียน',
   width: 160,
   renderCell: (row) => (
    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
     {row.createdAt ? dayjs(row.createdAt).format('DD/MM/YYYY HH:mm น.') : '-'}
    </Typography>
   ),
  },
  {
   key: 'actions',
   label: 'การจัดการ',
   width: 220,
   align: 'left',
   renderCell: (row) => {
    const isSelf = currentUser?.id === row._id

    return (
     <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {row.status === 'pending' && (
       <>
        <Button
         size='small'
         variant='contained'
         disabled={isProcessing}
         startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
         onClick={() => handleStatusChange(row._id, 'active')}
         sx={{
          bgcolor: '#0D9488',
          textTransform: 'none',
          fontSize: '0.75rem',
          fontWeight: 700,
          borderRadius: '8px',
          '&:hover': { bgcolor: '#0F766E' },
         }}
        >
         อนุมัติ
        </Button>
        <Button
         size='small'
         variant='outlined'
         disabled={isProcessing}
         color='error'
         startIcon={<CancelRoundedIcon sx={{ fontSize: 16 }} />}
         onClick={() => handleStatusChange(row._id, 'rejected')}
         sx={{
          textTransform: 'none',
          fontSize: '0.75rem',
          fontWeight: 700,
          borderRadius: '8px',
         }}
        >
         ปฏิเสธ
        </Button>
       </>
      )}

      {row.status === 'active' && !isSelf && (
       <Button
        size='small'
        variant='outlined'
        disabled={isProcessing}
        color='warning'
        onClick={() => handleStatusChange(row._id, 'rejected')}
        sx={{
         textTransform: 'none',
         fontSize: '0.75rem',
         fontWeight: 600,
         borderRadius: '8px',
        }}
       >
        ระงับใช้งาน
       </Button>
      )}

      {row.status === 'rejected' && (
       <Button
        size='small'
        variant='outlined'
        disabled={isProcessing}
        color='success'
        onClick={() => handleStatusChange(row._id, 'active')}
        sx={{
         textTransform: 'none',
         fontSize: '0.75rem',
         fontWeight: 600,
         borderRadius: '8px',
        }}
       >
        อนุมัติใหม่
       </Button>
      )}

      {!isSelf && (
       <Tooltip title='ลบผู้ใช้งานนี้'>
        <IconButton
         size='small'
         disabled={isProcessing}
         onClick={() => setDeletingUser(row)}
         sx={{
          color: '#DC2626',
          borderRadius: '8px',
          bgcolor: isDark ? 'rgba(220,38,38,0.1)' : '#FEF2F2',
          '&:hover': { bgcolor: isDark ? 'rgba(220,38,38,0.2)' : '#FEE2E2' },
         }}
        >
         <DeleteOutlineRoundedIcon fontSize='small' />
        </IconButton>
       </Tooltip>
      )}
     </Box>
    )
   },
  },
 ]

 return (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%', minWidth: 0 }}>
   <TitlePage
    title='จัดการผู้ใช้งานและสิทธิ์ (User Management)'
    actions={
     <Chip
      icon={<SupervisorAccountRoundedIcon sx={{ fontSize: '16px !important' }} />}
      label='สิทธิ์ผู้ดูแลระบบ (Admin Only)'
      sx={{
       bgcolor: isDark ? 'rgba(13,148,136,0.15)' : '#ECFDF5',
       color: '#0D9488',
       fontWeight: 700,
       border: '1px solid',
       borderColor: isDark ? 'rgba(13,148,136,0.3)' : '#A7F3D0',
      }}
     />
    }
   />

   <Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
     <Card sx={{ borderRadius: '14px', border: '1px solid #E2E8F0' }}>
      <CardContent sx={{ p: 2 }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
         <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
          ผู้ใช้งานทั้งหมด
         </Typography>
         <Typography variant='h5' sx={{ fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
          {counts.total} คน
         </Typography>
        </Box>
        <Avatar sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: 'text.primary' }}>
         <PersonOutlineRoundedIcon />
        </Avatar>
       </Box>
      </CardContent>
     </Card>
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
     <Card sx={{ borderRadius: '14px', border: '1px solid #FDE68A', bgcolor: isDark ? 'rgba(245,158,11,0.05)' : '#FFFBEB' }}>
      <CardContent sx={{ p: 2 }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
         <Typography variant='caption' sx={{ color: '#B45309', fontWeight: 700 }}>
          รอการอนุมัติ (Pending)
         </Typography>
         <Typography variant='h5' sx={{ fontWeight: 800, color: '#B45309', mt: 0.5 }}>
          {counts.pending} คน
         </Typography>
        </Box>
        <Avatar sx={{ bgcolor: '#FEF3C7', color: '#B45309' }}>
         <HourglassTopRoundedIcon />
        </Avatar>
       </Box>
      </CardContent>
     </Card>
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
     <Card sx={{ borderRadius: '14px', border: '1px solid #A7F3D0', bgcolor: isDark ? 'rgba(16,185,129,0.05)' : '#F0FDF4' }}>
      <CardContent sx={{ p: 2 }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
         <Typography variant='caption' sx={{ color: '#047857', fontWeight: 700 }}>
          อนุมัติแล้ว (Active)
         </Typography>
         <Typography variant='h5' sx={{ fontWeight: 800, color: '#065F46', mt: 0.5 }}>
          {counts.active} คน
         </Typography>
        </Box>
        <Avatar sx={{ bgcolor: '#ECFDF5', color: '#047857' }}>
         <HowToRegRoundedIcon />
        </Avatar>
       </Box>
      </CardContent>
     </Card>
    </Grid>

    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
     <Card sx={{ borderRadius: '14px', border: '1px solid #FECDD3', bgcolor: isDark ? 'rgba(239,68,68,0.05)' : '#FEF2F2' }}>
      <CardContent sx={{ p: 2 }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
         <Typography variant='caption' sx={{ color: '#991B1B', fontWeight: 700 }}>
          ปฏิเสธ / ระงับ (Rejected)
         </Typography>
         <Typography variant='h5' sx={{ fontWeight: 800, color: '#991B1B', mt: 0.5 }}>
          {counts.rejected} คน
         </Typography>
        </Box>
        <Avatar sx={{ bgcolor: '#FEE2E2', color: '#991B1B' }}>
         <PersonOffRoundedIcon />
        </Avatar>
       </Box>
      </CardContent>
     </Card>
    </Grid>
   </Grid>

   <TableList<ManagedUser>
    rowKey='_id'
    columns={columns}
    rows={filteredUsers}
    pageSize={10}
    loading={isLoading}
    searchPlaceholder='ค้นหาชื่อผู้ใช้, ชื่อ-นามสกุล, อีเมล, วอร์ด...'
    searchKeys={['username', 'firstName', 'lastName', 'email', 'ward']}
    tabs={
     <Tabs
      value={statusTab}
      onChange={(_, val) => setStatusTab(val)}
      variant='scrollable'
      scrollButtons='auto'
      sx={{
       minHeight: 48,
       '& .MuiTabs-indicator': {
        backgroundColor: statusTab === 'pending' ? '#B45309' : '#0D9488',
        height: 2.5,
        borderRadius: '2px 2px 0 0',
       },
      }}
     >
      <Tab
       value='all'
       label={`ทั้งหมด (${counts.total})`}
       sx={{
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.875rem',
        minHeight: 48,
        px: 2.5,
        color: 'text.secondary',
        '&.Mui-selected': { color: '#0D9488' },
       }}
      />
      <Tab
       value='pending'
       label={`รอการอนุมัติ (${counts.pending})`}
       sx={{
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.875rem',
        minHeight: 48,
        px: 2.5,
        color: counts.pending > 0 ? '#B45309' : 'text.secondary',
        '&.Mui-selected': { color: '#B45309' },
       }}
      />
      <Tab
       value='active'
       label={`อนุมัติแล้ว (${counts.active})`}
       sx={{
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.875rem',
        minHeight: 48,
        px: 2.5,
        color: 'text.secondary',
        '&.Mui-selected': { color: '#0D9488' },
       }}
      />
      <Tab
       value='rejected'
       label={`ปฏิเสธ (${counts.rejected})`}
       sx={{
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.875rem',
        minHeight: 48,
        px: 2.5,
        color: 'text.secondary',
        '&.Mui-selected': { color: '#0D9488' },
       }}
      />
     </Tabs>
    }
    title={
     <Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'text.primary', mr: 'auto' }}>
      รายการผู้ใช้งานทั้งหมด: {filteredUsers.length} คน
     </Typography>
    }
    tableContainerProps={{
     sx: {
      maxHeight: 'calc(100vh - 280px)',
      overflowY: 'auto',
     },
    }}
   />

   <Dialog
    open={Boolean(deletingUser)}
    onClose={() => setDeletingUser(null)}
    maxWidth='xs'
    fullWidth
    sx={{ '& .MuiDialog-paper': { borderRadius: '16px', p: 1 } }}
   >
    <DialogTitle sx={{ fontWeight: 800 }}>ยืนยันการลบบัญชีผู้ใช้</DialogTitle>
    <DialogContent>
     <Typography variant='body2' sx={{ color: 'text.secondary' }}>
      ต้องการลบบัญชีของ <strong>{deletingUser?.firstName} {deletingUser?.lastName} (@{deletingUser?.username})</strong> ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
     </Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2, pt: 0 }}>
     <Button onClick={() => setDeletingUser(null)} disabled={isProcessing}>
      ยกเลิก
     </Button>
     <Button
      variant='contained'
      color='error'
      onClick={handleDeleteUser}
      loading={isProcessing}
      sx={{ borderRadius: '8px' }}
     >
      ลบบัญชี
     </Button>
    </DialogActions>
   </Dialog>
  </Box>
 )
}
