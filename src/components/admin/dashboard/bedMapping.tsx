'use client'

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import SingleBedRoundedIcon from '@mui/icons-material/SingleBedRounded'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'

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

export const BedMapping = ({ wardName = 'MICU3', beds = [], onBedClick }: BedMappingProps) => {
 const router = useRouter()
 const { locale } = useParams<{ locale: string }>()
 const targetLocale = locale || 'th'

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
      <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#1E293B' }}>
       แผนผังสถานะเตียงในหอผู้ป่วย {wardName} (Bed Mapping 1-{beds.length || 10})
      </Typography>
     </Box>
     <Typography variant='body2' sx={{ color: '#64748B', mt: 0.5, fontSize: '0.85rem' }}>
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
       lg: 'repeat(5, 1fr)',
      },
      gap: 2,
     }}
    >
     {beds.map((bed) => {
      const isOccupied = bed.status === 'Occupied'

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
         <Box sx={{ my: 1 }}>
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
            mt: 0.25,
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
   </CardContent>
  </Card>
 )
}
