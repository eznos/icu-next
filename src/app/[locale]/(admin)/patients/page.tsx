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
import { useState } from 'react'

export default function PatientsPage() {
 const [statusFilter, setStatusFilter] = useState<string>('')

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
    onClose={closePatientModal}
    onSuccess={() => mutate()}
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
