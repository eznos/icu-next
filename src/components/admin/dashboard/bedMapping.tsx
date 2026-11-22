'use client'

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import SingleBedRoundedIcon from '@mui/icons-material/SingleBedRounded'
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import dayjs from 'dayjs'
import { useTodayAssessments } from '@/apis/assessment'
import { BedPatientTarget, DailyAssessmentModal } from './dailyAssessmentModal'

export type BedPatientInfo = {
 _id?: string
 objectUuId?: string
 hn: string
 an: string
 patientName: string
 diagnosis: string
 attendingDoctor?: string
 admissionType?: string
 admissionDate?: string
}

export type BedItem = {
 bedIndex: number
 bedNumber: string
 status: 'Available' | 'Occupied'
 patient?: BedPatientInfo | null
}

export type BedMappingProps = {
 wardName?: string
 beds?: BedItem[]
 onBedClick?: (bed: BedItem) => void
}

export const BedMapping = ({
 wardName = 'MICU3',
 beds = [],
 onBedClick,
}: BedMappingProps) => {
 const router = useRouter()
 const { locale } = useParams<{ locale: string }>()
 const targetLocale = locale || 'th'

 const { data: todayAssessments, mutate: mutateTodayAssessments } =
  useTodayAssessments(wardName)
 const [assessmentTarget, setAssessmentTarget] =
  useState<BedPatientTarget | null>(null)

 const assessmentMap = new Map<string, any[]>()
 for (const a of todayAssessments?.data || []) {
  const list = assessmentMap.get(a.an) || []
  list.push(a)
  assessmentMap.set(a.an, list)
 }

 const handleCardClick = (bed: BedItem) => {
  if (onBedClick) {
   onBedClick(bed)
   return
  }

  const patientId = bed.patient?.objectUuId || bed.patient?._id
  if (bed.status === 'Occupied' && patientId) {
   router.push(`/${targetLocale}/patients?id=${encodeURIComponent(patientId)}`)
  } else {
   router.push(
    `/${targetLocale}/patients?action=create&bed=${encodeURIComponent(bed.bedNumber)}`,
   )
  }
 }

 return (
  <Card
   sx={{
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #E2E8F0',
   }}
  >
   <CardContent sx={{ p: 3 }}>
    <Box sx={{ mb: 2.5 }}>
     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <SingleBedRoundedIcon sx={{ color: '#047857', fontSize: 24 }} />
      <Typography
       variant='subtitle1'
       sx={{ fontWeight: 700, color: '#1E293B' }}
      >
       แผนผังสถานะเตียงในหอผู้ป่วย {wardName} (Bed Mapping 1-{beds.length || 10}
       )
      </Typography>
     </Box>
     <Typography
      variant='body2'
      sx={{ color: '#64748B', mt: 0.5, fontSize: '0.85rem' }}
     >
      คลิกเตียงว่างสีเขียวเพื่อกรอกข้อมูลผู้รับผู้ป่วยเข้าเตียงได้โดยตรงทันที
     </Typography>
    </Box>

    <Box
     sx={{
      display: 'grid',
      gridTemplateColumns: {
       xs: 'repeat(1, 1fr)',
       sm: 'repeat(2, 1fr)',
       md: 'repeat(3, 1fr)',
       lg: 'repeat(4, 1fr)',
      },
      gap: 2,
     }}
    >
     {beds.map((bed) => {
      const isOccupied = bed.status === 'Occupied'
      const checks = bed.patient?.an ? assessmentMap.get(bed.patient.an) || [] : []
      const checkCount = checks.length
      const todayData = checks[0] || null

      return (
       <Box
        key={bed.bedNumber}
        onClick={() => handleCardClick(bed)}
        sx={{
         p: 2,
         borderRadius: '16px',
         cursor: 'pointer',
         bgcolor: isOccupied ? '#FFF5F5' : '#F2FBF7',
         border: isOccupied ? '1.5px solid #FECDD3' : '1.5px solid #A7F3D0',
         display: 'flex',
         flexDirection: 'column',
         justifyContent: 'space-between',
         minHeight: 125,
         transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
         '&:hover': {
          transform: 'translateY(-3px)',
          bgcolor: isOccupied ? '#FFE4E6' : '#E6F9F0',
          borderColor: isOccupied ? '#F43F5E' : '#10B981',
          boxShadow: isOccupied
           ? '0 10px 20px -5px rgba(244, 63, 94, 0.2)'
           : '0 10px 20px -5px rgba(16, 185, 129, 0.2)',
         },
        }}
       >
        <Box
         sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
         }}
        >
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SingleBedRoundedIcon
           sx={{
            fontSize: 22,
            color: isOccupied ? '#BE123C' : '#047857',
           }}
          />
          <Typography
           variant='subtitle2'
           sx={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: isOccupied ? '#9F1239' : '#065F46',
           }}
          >
           {bed.bedNumber}
          </Typography>
         </Box>

         <Box
          sx={{
           px: 1,
           py: 0.25,
           borderRadius: '6px',
           fontSize: '0.7rem',
           fontWeight: 600,
           bgcolor: isOccupied ? '#FFE4E6' : '#D1FAE5',
           color: isOccupied ? '#BE123C' : '#065F46',
           border: isOccupied ? '1px solid #FECDD3' : '1px solid #A7F3D0',
          }}
         >
          {isOccupied ? 'มีคนไข้' : 'เตียงว่าง'}
         </Box>
        </Box>

        {isOccupied ? (
         <Box sx={{ my: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography
           variant='body2'
           sx={{
            fontWeight: 700,
            fontSize: '0.825rem',
            color: '#0F172A',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
           }}
          >
           {bed.patient?.patientName || '-'}
          </Typography>

          <Typography
           variant='caption'
           sx={{
            color: '#475569',
            fontSize: '0.72rem',
            display: 'block',
           }}
          >
           HN: {bed.patient?.hn || '-'} | AN: {bed.patient?.an || '-'}
          </Typography>

          <Typography
           variant='caption'
           sx={{
            color: '#475569',
            fontSize: '0.72rem',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
           }}
          >
           Dx: {bed.patient?.diagnosis || '-'}
          </Typography>

          <Typography
           variant='caption'
           sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            color: checkCount > 0 ? '#047857' : '#DC2626',
            mt: 0.25,
            display: 'block',
           }}
          >
           {checkCount > 0
            ? `✓ ตรวจแล้ว ${checkCount} ครั้ง (ล่าสุด ${dayjs(todayData?.recordDate).format('HH:mm น.')})`
            : '⚠ ยังไม่ได้ตรวจประเมินวันนี้'}
          </Typography>

          {todayData && (
           <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
            {todayData.hasVentilator && (
             <Chip
              label='Vent'
              size='small'
              sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#E0F2FE', color: '#0369A1' }}
             />
            )}
            {todayData.hasCentralLine && (
             <Chip
              label='C-Line'
              size='small'
              sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#FEF3C7', color: '#B45309' }}
             />
            )}
            {todayData.hasFoleyCatheter && (
             <Chip
              label='Foley'
              size='small'
              sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#F3E8FF', color: '#7E22CE' }}
             />
            )}
           </Box>
          )}

          <Button
           size='small'
           variant='outlined'
           onClick={(e) => {
            e.stopPropagation()
            if (bed.patient) {
             setAssessmentTarget({
              patientId: bed.patient.objectUuId || bed.patient._id || '',
              an: bed.patient.an,
              hn: bed.patient.hn,
              patientName: bed.patient.patientName,
              bedNumber: bed.bedNumber,
              ward: wardName,
             })
            }
           }}
           startIcon={<AssignmentTurnedInRoundedIcon sx={{ fontSize: '14px !important' }} />}
           sx={{
            mt: 0.5,
            py: 0.25,
            fontSize: '0.7rem',
            textTransform: 'none',
            borderRadius: '6px',
            color: checkCount > 0 ? '#047857' : '#B91C1C',
            borderColor: checkCount > 0 ? '#A7F3D0' : '#FECDD3',
            bgcolor: checkCount > 0 ? '#ECFDF5' : '#FFF1F2',
            '&:hover': {
             bgcolor: checkCount > 0 ? '#D1FAE5' : '#FFE4E6',
            },
           }}
          >
           {checkCount > 0 ? 'ประเมินเพิ่มรอบใหม่' : 'บันทึกประเมินเตียง'}
          </Button>
         </Box>
        ) : (
         <Box
          sx={{
           mt: 'auto',
           pt: 1.5,
           display: 'flex',
           alignItems: 'center',
           gap: 0.75,
           color: '#059669',
           fontSize: '0.75rem',
           fontWeight: 600,
          }}
         >
          <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
          <span>กดลงทะเบียนเตียง</span>
         </Box>
        )}
       </Box>
      )
     })}
    </Box>

    <DailyAssessmentModal
     open={Boolean(assessmentTarget)}
     onClose={() => setAssessmentTarget(null)}
     onSuccess={() => mutateTodayAssessments()}
     patient={assessmentTarget}
     initialData={
      assessmentTarget
       ? assessmentMap.get(assessmentTarget.an)?.[0] || null
       : null
     }
    />
   </CardContent>
  </Card>
 )
}
