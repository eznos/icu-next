'use client'

import { usePatientList } from '@/apis/patients'
import {
 DeletePatientModal,
 PatientModal,
 PatientTableList,
} from '@/components/admin/patients'
import { TitlePage } from '@/components/utils/titlePage'
import { useDialog } from '@/hooks/useDialog'
import { PatientType } from '@/types'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

function PatientsContent() {
 const [statusFilter, setStatusFilter] = useState<string>('')
 const router = useRouter()
 const { locale } = useParams<{ locale: string }>()
 const searchParams = useSearchParams()

 const paramId = searchParams.get('id')
 const paramAction = searchParams.get('action')
 const paramBed = searchParams.get('bed')

 const {
  open: isPatientModalOpen,
  openDialog: openPatientModal,
  closeDialog: closePatientModal,
  data: selectedPatient,
 } = useDialog<PatientType | null>()

 const {
  open: isDeleteModalOpen,
  openDialog: openDeleteModal,
  closeDialog: closeDeleteModal,
  data: deletePatientData,
 } = useDialog<PatientType | null>()

 const { data, isLoading, error, mutate } = usePatientList({
  limit: 50,
  page: 1,
  sortBy: 'admissionDate',
  order: 'desc',
 })

 const currentParamKey = paramAction
  ? `${paramAction}_${paramBed || ''}`
  : paramId
    ? `id_${paramId}`
    : null

 const handledParamKeyRef = useRef<string | null>(null)

 useEffect(() => {
  if (!currentParamKey) {
   handledParamKeyRef.current = null
   return
  }

  if (handledParamKeyRef.current === currentParamKey) {
   return
  }

  handledParamKeyRef.current = currentParamKey

  if (paramAction === 'create') {
   openPatientModal(paramBed ? ({ bedNumber: paramBed } as PatientType) : null)
  } else if (paramId) {
   const existing = data?.data?.find(
    (p) => p.objectUuId === paramId || p._id === paramId,
   )
   if (existing) {
    openPatientModal(existing)
   } else {
    openPatientModal({ objectUuId: paramId } as PatientType)
   }
  }
 }, [currentParamKey, paramAction, paramId, paramBed, data?.data, openPatientModal])

 const handleClosePatientModal = () => {
  closePatientModal()
  if (paramId || paramAction || paramBed) {
   router.replace(`/${locale || 'th'}/patients`)
  }
 }

 const handleSuccessPatientModal = () => {
  closePatientModal()
  mutate()
  if (paramId || paramAction || paramBed) {
   router.replace(`/${locale || 'th'}/patients`)
  }
 }

 const handleRowClick = (row: PatientType, event: 'edit' | 'delete') => {
  if (event === 'edit') {
   openPatientModal(row)
  } else if (event === 'delete') {
   openDeleteModal(row)
  }
 }

 if (error) {
  return (
   <Box sx={{ p: 3 }}>
    <Typography color='error'>เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ป่วย</Typography>
   </Box>
  )
 }

 if (isLoading) {
  return (
   <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 3 }}>
    <CircularProgress size={24} sx={{ color: '#0da176' }} />
    <Typography>กำลังโหลดข้อมูลผู้ป่วย...</Typography>
   </Box>
  )
 }

 return (
  <Box>
   <TitlePage
    title='Patients'
    actions={
     <Button
      onClick={() => openPatientModal(null)}
      variant='contained'
      startIcon={<PersonAddIcon />}
     >
      ลงทะเบียนผู้ป่วย
     </Button>
    }
   />
   <PatientTableList
    data={data?.data || []}
    isLoading={isLoading}
    statusFilter={statusFilter}
    onStatusFilterChange={setStatusFilter}
    onRowClick={handleRowClick}
   />
   <PatientModal
    open={isPatientModalOpen}
    onClose={handleClosePatientModal}
    onSuccess={handleSuccessPatientModal}
    data={selectedPatient}
    activePatients={data?.data || []}
   />
   <DeletePatientModal
    open={isDeleteModalOpen}
    onClose={closeDeleteModal}
    onSuccess={() => mutate()}
    data={deletePatientData}
   />
  </Box>
 )
}

export default function PatientsPage() {
 return (
  <Suspense
   fallback={
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 3 }}>
     <CircularProgress size={24} sx={{ color: '#0da176' }} />
     <Typography>กำลังโหลดข้อมูลผู้ป่วย...</Typography>
    </Box>
   }
  >
   <PatientsContent />
  </Suspense>
 )
}
