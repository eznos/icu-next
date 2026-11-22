'use client'

import { useCurrentUser } from '@/apis/auth'
import { KpiItem, useKpiData } from '@/apis/kpi'
import { useWardList } from '@/apis/ward'
import {
 CreateKpiModal,
 CustomKpiModal,
 EditKpiItemModal,
 KpiCards,
} from '@/components/admin/kpi'
import { TitlePage } from '@/components/utils/titlePage'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import {
 Box,
 Button,
 CircularProgress,
 MenuItem,
 TextField,
 Typography,
} from '@mui/material'
import { Suspense, useEffect, useMemo, useState } from 'react'

function KpiContent() {
 const { user } = useCurrentUser()
 const { data: wardResponse } = useWardList()
 const wardList = useMemo(() => wardResponse?.data || [], [wardResponse])

 const [selectedWard, setSelectedWard] = useState<string>('')
 const [modalOpen, setModalOpen] = useState(false)
 const [createModalOpen, setCreateModalOpen] = useState(false)
 const [editingItem, setEditingItem] = useState<KpiItem | null>(null)

 useEffect(() => {
  if (!selectedWard) {
   if (user?.ward) {
    setSelectedWard(user.ward)
   } else if (wardList.length > 0) {
    setSelectedWard(wardList[0].code)
   }
  }
 }, [user?.ward, wardList, selectedWard])

 const activeWard = selectedWard || user?.ward || 'MICU3'

 const { data, isLoading, error, mutate } = useKpiData(activeWard)
 const kpiRecord = data?.data?.[0] || null

 if (error) {
  return (
   <Box sx={{ p: 3 }}>
    <Typography color='error'>
     เกิดข้อผิดพลาดในการโหลดข้อมูลตัวชี้วัด (KPI)
    </Typography>
   </Box>
  )
 }

 if (isLoading) {
  return (
   <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 3 }}>
    <CircularProgress size={24} sx={{ color: '#0DA176' }} />
    <Typography sx={{ color: '#64748B' }}>
     กำลังคำนวณและประมวลผลตัวชี้วัดคุณภาพ ({activeWard} Quality KPIs)...
    </Typography>
   </Box>
  )
 }

 return (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
   <TitlePage
    title='ตัวชี้วัดผลการปฏิบัติงาน (KPI)'
    actions={
     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      <TextField
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
      </TextField>

      <Button
       variant='outlined'
       startIcon={<TuneRoundedIcon />}
       onClick={() => setModalOpen(true)}
       sx={{
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 700,
        px: 2,
        borderColor: 'divider',
        color: 'text.primary',
        bgcolor: 'background.paper',
        '&:hover': {
         bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
         borderColor: 'divider',
        },
       }}
      >
       จัดการตัวชี้วัด (Customize KPI)
      </Button>

      <Button
       variant='contained'
       startIcon={<AddRoundedIcon />}
       onClick={() => setCreateModalOpen(true)}
       sx={{
        bgcolor: '#0D9488',
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 700,
        px: 2,
        boxShadow: 'none',
        '&:hover': { bgcolor: '#0b8a64', boxShadow: 'none' },
       }}
      >
       + สร้าง KPI ใหม่ (New KPI)
      </Button>
     </Box>
    }
   />

   <KpiCards
    kpiRecord={kpiRecord}
    stats={data?.stats}
    onEditItem={(item) => setEditingItem(item)}
   />

   <CreateKpiModal
    open={createModalOpen}
    onClose={() => setCreateModalOpen(false)}
    ward={activeWard}
    existingItems={kpiRecord?.items || []}
    stats={data?.stats}
    onSuccess={() => mutate()}
   />

   <EditKpiItemModal
    open={Boolean(editingItem)}
    item={editingItem}
    onClose={() => setEditingItem(null)}
    ward={activeWard}
    allItems={kpiRecord?.items || []}
    stats={data?.stats}
    onSuccess={() => mutate()}
   />

   <CustomKpiModal
    open={modalOpen}
    onClose={() => setModalOpen(false)}
    ward={activeWard}
    items={kpiRecord?.items || []}
    stats={data?.stats}
    onSuccess={() => mutate()}
   />
  </Box>
 )
}

export default function KpiPage() {
 return (
  <Suspense
   fallback={
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 3 }}>
     <CircularProgress size={24} sx={{ color: '#0DA176' }} />
     <Typography sx={{ color: '#64748B' }}>
      กำลังคำนวณและประมวลผลตัวชี้วัดคุณภาพ...
     </Typography>
    </Box>
   }
  >
   <KpiContent />
  </Suspense>
 )
}
