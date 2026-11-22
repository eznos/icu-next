'use client'

import { BedAssessmentStatusItem, DailyAssessmentData } from '@/apis/assessment'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import HotelRoundedIcon from '@mui/icons-material/HotelRounded'
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import {
 AppBar,
 Avatar,
 Box,
 Button,
 Card,
 CardContent,
 Chip,
 Container,
 Dialog,
 Divider,
 Grid,
 IconButton,
 Stack,
 Toolbar,
 Typography,
 useMediaQuery,
 useTheme,
} from '@mui/material'
import dayjs from 'dayjs'

type BedAssessmentDetailModalProps = {
 open: boolean
 onClose: () => void
 bed: BedAssessmentStatusItem | null
 selectedDate: string
 onOpenNewAssessment: (bed: BedAssessmentStatusItem) => void
 onEditAssessment: (
  bed: BedAssessmentStatusItem,
  assessment: DailyAssessmentData,
 ) => void
 onDeleteAssessment: (id?: string) => void
}

export const BedAssessmentDetailModal = ({
 open,
 onClose,
 bed,
 selectedDate,
 onOpenNewAssessment,
 onEditAssessment,
 onDeleteAssessment,
}: BedAssessmentDetailModalProps) => {
 const theme = useTheme()
 const isDark = theme.palette.mode === 'dark'
 const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

 if (!bed) return null

 const patient = bed.patient
 const checks = bed.checks || []
 const checkCount = checks.length
 const isAssessed = checkCount > 0
 const latestCheck = checks[0] || null

 const admissionDays = patient?.admissionDate
  ? Math.max(
     1,
     dayjs(selectedDate).diff(dayjs(patient.admissionDate), 'day') + 1,
    )
  : null

 const handleNewAssessmentClick = () => {
  onClose()
  onOpenNewAssessment(bed)
 }

 return (
  <Dialog
   fullScreen={isMobile}
   maxWidth='xl'
   fullWidth
   open={open}
   onClose={onClose}
   sx={{
    '& .MuiDialog-paper': {
     bgcolor: isDark ? '#0F172A' : '#F8FAFC',
     height: { xs: '100dvh', sm: 'auto' },
     maxHeight: { xs: '100dvh', sm: '92vh' },
     display: 'flex',
     flexDirection: 'column',
     borderRadius: { xs: 0, sm: '16px' },
     overflow: 'hidden',
    },
   }}
  >
   {/* Mobile-First Top AppBar */}
   <AppBar
    position='sticky'
    elevation={0}
    sx={{
     bgcolor: isDark ? '#1E293B' : '#FFFFFF',
     borderBottom: '1px solid',
     borderColor: 'divider',
     color: 'text.primary',
     px: { xs: 1.5, sm: 2, md: 3 },
     py: { xs: 0.5, sm: 0.75 },
    }}
   >
    <Toolbar
     disableGutters
     sx={{
      justifyContent: 'space-between',
      gap: { xs: 1, sm: 2 },
      minHeight: { xs: 56, sm: 64 },
     }}
    >
     <Box
      sx={{
       display: 'flex',
       alignItems: 'center',
       gap: { xs: 1.25, sm: 2 },
       minWidth: 0,
       flex: 1,
      }}
     >
      <IconButton
       color='inherit'
       onClick={onClose}
       aria-label='close'
       size={isMobile ? 'small' : 'medium'}
       sx={{
        flexShrink: 0,
        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
        '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0' },
       }}
      >
       <CloseRoundedIcon fontSize={isMobile ? 'small' : 'medium'} />
      </IconButton>

      <Box sx={{ minWidth: 0, flex: 1 }}>
       <Box
        sx={{
         display: 'flex',
         alignItems: 'center',
         gap: 1,
         flexWrap: 'nowrap',
        }}
       >
        <Chip
         label={bed.bedNumber}
         size='small'
         sx={{
          flexShrink: 0,
          height: { xs: 22, sm: 24 },
          fontSize: { xs: '0.72rem', sm: '0.8rem' },
          bgcolor: isDark ? 'rgba(13,148,136,0.2)' : '#ECFDF5',
          color: isDark ? '#2DD4BF' : '#0D9488',
          fontWeight: 700,
          border: '1px solid',
          borderColor: isDark ? 'rgba(13,148,136,0.4)' : '#A7F3D0',
         }}
        />
        <Typography
         variant='h6'
         noWrap
         sx={{
          fontWeight: 800,
          fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.2rem' },
         }}
        >
         รายละเอียดการประเมินเตียง
        </Typography>
       </Box>
       <Typography
        variant='caption'
        noWrap
        sx={{
         color: 'text.secondary',
         display: 'block',
         mt: 0.25,
         fontSize: { xs: '0.7rem', sm: '0.75rem' },
        }}
       >
        หอผู้ป่วย: {patient ? 'MICU3' : '-'} • วันที่:{' '}
        {dayjs(selectedDate).format('DD/MM/YYYY')}
       </Typography>
      </Box>
     </Box>

     {/* ปุ่มสำหรับหน้าจอ Tablet ขึ้นไป (บนมือถือจะย้ายไปไว้ Bottom Bar เพื่อกดมือเดียวได้สะดวก) */}
     {patient && !isMobile && (
      <Button
       variant='contained'
       startIcon={<AddCircleOutlineRoundedIcon />}
       onClick={handleNewAssessmentClick}
       sx={{
        flexShrink: 0,
        bgcolor: '#0D9488',
        fontWeight: 700,
        borderRadius: '10px',
        px: { sm: 2, md: 2.5 },
        '&:hover': { bgcolor: '#0F766E' },
       }}
      >
       ประเมินรอบใหม่
      </Button>
     )}
    </Toolbar>
   </AppBar>

   {/* Scrollable Content Area */}
   <Box
    sx={{
     flex: 1,
     overflowY: 'auto',
     WebkitOverflowScrolling: 'touch',
     '&::-webkit-scrollbar': {
      width: '6px',
     },
     '&::-webkit-scrollbar-thumb': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
      borderRadius: '4px',
     },
    }}
   >
    <Container
     maxWidth='lg'
     sx={{
      px: { xs: 1.5, sm: 2.5, md: 3 },
      py: { xs: 2, sm: 3 },
     }}
    >
     {patient ? (
      <Stack spacing={{ xs: 2, sm: 3 }}>
       {/* Patient Summary Card */}
       <Card
        variant='outlined'
        sx={{
         borderRadius: { xs: '12px', sm: '16px' },
         bgcolor: isDark ? '#1E293B' : '#FFFFFF',
         p: { xs: 1.75, sm: 2.5, md: 3 },
        }}
       >
        <Grid
         container
         spacing={{ xs: 2, md: 3 }}
         sx={{ alignItems: 'center' }}
        >
         <Grid size={{ xs: 12, md: 7 }}>
          <Box
           sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: { xs: 1.5, sm: 2 },
           }}
          >
           <Avatar
            sx={{
             width: { xs: 44, sm: 56 },
             height: { xs: 44, sm: 56 },
             bgcolor: isDark ? 'rgba(13,148,136,0.2)' : '#E0F2FE',
             color: '#0284C7',
             fontWeight: 800,
             fontSize: { xs: '1rem', sm: '1.25rem' },
             flexShrink: 0,
            }}
           >
            {bed.bedIndex}
           </Avatar>
           <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
             variant='h5'
             sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' },
              lineHeight: 1.3,
             }}
            >
             {patient.patientName}
            </Typography>
            <Box
             sx={{
              display: 'flex',
              columnGap: { xs: 1.5, sm: 2 },
              rowGap: 0.5,
              flexWrap: 'wrap',
              mt: 0.75,
             }}
            >
             <Typography
              variant='body2'
              sx={{
               color: 'text.secondary',
               fontSize: { xs: '0.8rem', sm: '0.875rem' },
              }}
             >
              <strong>HN:</strong> {patient.hn}
             </Typography>
             <Typography
              variant='body2'
              sx={{
               color: 'text.secondary',
               fontSize: { xs: '0.8rem', sm: '0.875rem' },
              }}
             >
              <strong>AN:</strong> {patient.an}
             </Typography>
             {admissionDays && (
              <Typography
               variant='body2'
               sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
               }}
              >
               <strong>ครองเตียง:</strong> {admissionDays} วัน
              </Typography>
             )}
            </Box>
            <Typography
             variant='body2'
             sx={{
              color: isDark ? '#38BDF8' : '#0369A1',
              fontWeight: 600,
              mt: 1,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
             }}
            >
             Dx: {patient.diagnosis || 'ยังไม่ได้ระบุ'}
            </Typography>
           </Box>
          </Box>
         </Grid>

         <Grid size={{ xs: 12, md: 5 }}>
          <Card
           elevation={0}
           sx={{
            borderRadius: '12px',
            p: { xs: 1.5, sm: 2 },
            bgcolor: isAssessed
             ? isDark
               ? 'rgba(16,185,129,0.1)'
               : '#F0FDF4'
             : isDark
               ? 'rgba(239,68,68,0.1)'
               : '#FFF1F2',
            border: '1px solid',
            borderColor: isAssessed
             ? isDark
               ? 'rgba(16,185,129,0.3)'
               : '#BBF7D0'
             : isDark
               ? 'rgba(239,68,68,0.3)'
               : '#FECDD3',
           }}
          >
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isAssessed ? (
             <CheckCircleRoundedIcon
              sx={{ color: '#059669', fontSize: { xs: 28, sm: 32 } }}
             />
            ) : (
             <ErrorOutlineRoundedIcon
              sx={{ color: '#BE123C', fontSize: { xs: 28, sm: 32 } }}
             />
            )}
            <Box sx={{ minWidth: 0 }}>
             <Typography
              variant='subtitle1'
              sx={{
               fontWeight: 800,
               fontSize: { xs: '0.9rem', sm: '1rem' },
               color: isAssessed
                ? isDark
                  ? '#34D399'
                  : '#047857'
                : isDark
                  ? '#FDA4AF'
                  : '#9F1239',
              }}
             >
              {isAssessed
               ? `ตรวจประเมินแล้ว ${checkCount} ครั้งในวันนี้`
               : 'ยังไม่ได้รับการตรวจประเมินวันนี้'}
             </Typography>
             {latestCheck && (
              <Typography
               variant='caption'
               sx={{
                color: 'text.secondary',
                display: 'block',
                mt: 0.25,
                fontSize: { xs: '0.72rem', sm: '0.75rem' },
               }}
              >
               ล่าสุด: {dayjs(latestCheck.recordDate).format('HH:mm น.')} โดย{' '}
               <strong>
                {latestCheck.recordedByName ||
                 latestCheck.recordedBy ||
                 'Staff'}
               </strong>
              </Typography>
             )}
            </Box>
           </Box>
          </Card>
         </Grid>
        </Grid>
       </Card>

       {/* Assessment History Section */}
       <Box>
        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
         <Typography
          variant='h6'
          sx={{
           fontWeight: 800,
           color: 'text.primary',
           fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
          }}
         >
          ประวัติการตรวจประเมินรายรอบ ({checkCount} รอบ)
         </Typography>
         <Typography
          variant='caption'
          sx={{
           color: 'text.secondary',
           fontSize: { xs: '0.72rem', sm: '0.75rem' },
          }}
         >
          บันทึกตามเวลาจริง แสดงผู้ประเมินด้วยชื่อและนามสกุล
         </Typography>
        </Box>

        {checks.length === 0 ? (
         <Card
          variant='outlined'
          sx={{
           p: { xs: 3.5, sm: 6 },
           textAlign: 'center',
           borderRadius: { xs: '12px', sm: '16px' },
           bgcolor: isDark ? '#1E293B' : '#FFFFFF',
          }}
         >
          <HotelRoundedIcon
           sx={{
            fontSize: { xs: 44, sm: 56 },
            color: 'text.disabled',
            mb: 1,
           }}
          />
          <Typography
           variant='h6'
           sx={{
            fontWeight: 700,
            color: 'text.secondary',
            fontSize: { xs: '0.95rem', sm: '1.15rem' },
           }}
          >
           ยังไม่มีข้อมูลการประเมินเตียงในวันที่{' '}
           {dayjs(selectedDate).format('DD/MM/YYYY')}
          </Typography>
          <Typography
           variant='body2'
           sx={{
            color: 'text.secondary',
            mt: 0.5,
            mb: { xs: 2.5, sm: 3 },
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
           }}
          >
           กดปุ่มเพื่อทำการประเมินอาการและอุปกรณ์สำหรับผู้ป่วยเตียงนี้
          </Typography>
          <Button
           variant='contained'
           fullWidth={isMobile}
           startIcon={<AddCircleOutlineRoundedIcon />}
           onClick={handleNewAssessmentClick}
           sx={{
            bgcolor: '#0D9488',
            borderRadius: '10px',
            px: 3,
            py: 1.25,
            fontWeight: 700,
            '&:hover': { bgcolor: '#0F766E' },
           }}
          >
           เริ่มการตรวจประเมินรอบแรก
          </Button>
         </Card>
        ) : (
         <Stack spacing={{ xs: 1.75, sm: 2.5 }}>
          {checks.map((check, idx) => {
           const roundNumber = checks.length - idx
           const staffName = check.recordedByName || check.recordedBy || 'Staff'

           return (
            <Card
             key={check.objectUuId || idx}
             variant='outlined'
             sx={{
              borderRadius: { xs: '12px', sm: '16px' },
              bgcolor: isDark ? '#1E293B' : '#FFFFFF',
              borderLeft: { xs: '4px solid #0D9488', sm: '5px solid #0D9488' },
              overflow: 'hidden',
             }}
            >
             <CardContent sx={{ p: { xs: 1.75, sm: 2.5, md: 3 } }}>
              {/* Card Header: Round Info & Actions */}
              <Box
               sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'flex-start' },
                gap: 1.5,
               }}
              >
               <Box
                sx={{
                 display: 'flex',
                 alignItems: 'flex-start',
                 gap: { xs: 1.25, sm: 1.5 },
                }}
               >
                <Avatar
                 sx={{
                  bgcolor: '#0D9488',
                  width: { xs: 34, sm: 40 },
                  height: { xs: 34, sm: 40 },
                  fontWeight: 800,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  flexShrink: 0,
                 }}
                >
                 #{roundNumber}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                 <Box
                  sx={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: 0.75,
                   flexWrap: 'wrap',
                  }}
                 >
                  <Typography
                   sx={{
                    fontWeight: 800,
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    color: 'text.primary',
                   }}
                  >
                   รอบตรวจที่ {roundNumber}:{' '}
                   {dayjs(check.recordDate).format('HH:mm น.')}
                  </Typography>
                  <Chip
                   icon={<EventAvailableRoundedIcon sx={{ fontSize: 13 }} />}
                   label={dayjs(check.recordDate).format('DD/MM/YYYY')}
                   size='small'
                   sx={{
                    height: 22,
                    fontSize: '0.72rem',
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                    fontWeight: 600,
                   }}
                  />
                 </Box>
                 <Box
                  sx={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: 0.75,
                   mt: 0.5,
                  }}
                 >
                  <PersonRoundedIcon
                   sx={{ fontSize: 15, color: '#0D9488', flexShrink: 0 }}
                  />
                  <Typography
                   variant='body2'
                   sx={{
                    fontWeight: 700,
                    color: '#0D9488',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                   }}
                  >
                   ผู้ตรวจ: {staffName}
                  </Typography>
                 </Box>
                </Box>
               </Box>

               {/* Edit / Delete Buttons */}
               <Box
                sx={{
                 display: 'flex',
                 gap: 1,
                 justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                 pt: { xs: 0.5, sm: 0 },
                }}
               >
                <Button
                 size='small'
                 variant='outlined'
                 startIcon={<EditRoundedIcon fontSize='small' />}
                 onClick={() => {
                  onClose()
                  onEditAssessment(bed, check)
                 }}
                 sx={{
                  flex: { xs: 1, sm: 'initial' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                 }}
                >
                 แก้ไขรอบนี้
                </Button>
                <IconButton
                 size='small'
                 aria-label='delete assessment'
                 onClick={() =>
                  onDeleteAssessment(check.objectUuId || check._id)
                 }
                 sx={{
                  px: { xs: 1.5, sm: 1 },
                  color: '#DC2626',
                  bgcolor: isDark ? 'rgba(220,38,38,0.12)' : '#FEF2F2',
                  borderRadius: '8px',
                  '&:hover': {
                   bgcolor: isDark ? 'rgba(220,38,38,0.2)' : '#FEE2E2',
                  },
                 }}
                >
                 <DeleteOutlineRoundedIcon fontSize='small' />
                </IconButton>
               </Box>
              </Box>

              <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

              {/* Medical Devices & Incidents */}
              <Grid container spacing={{ xs: 2, md: 2.5 }}>
               <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                 variant='caption'
                 sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 1,
                 }}
                >
                 <MedicalServicesRoundedIcon sx={{ fontSize: 15 }} />
                 อุปกรณ์ทางการแพทย์ (Medical Devices)
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                 <Chip
                  label='Ventilator'
                  size='small'
                  color={check.hasVentilator ? 'primary' : 'default'}
                  variant={check.hasVentilator ? 'filled' : 'outlined'}
                  sx={{
                   fontWeight: check.hasVentilator ? 700 : 500,
                   bgcolor: check.hasVentilator ? '#0284C7' : undefined,
                   color: check.hasVentilator ? '#FFFFFF' : 'text.disabled',
                  }}
                 />
                 <Chip
                  label='Central Line'
                  size='small'
                  color={check.hasCentralLine ? 'warning' : 'default'}
                  variant={check.hasCentralLine ? 'filled' : 'outlined'}
                  sx={{
                   fontWeight: check.hasCentralLine ? 700 : 500,
                   bgcolor: check.hasCentralLine ? '#D97706' : undefined,
                   color: check.hasCentralLine ? '#FFFFFF' : 'text.disabled',
                  }}
                 />
                 <Chip
                  label='Foley Catheter'
                  size='small'
                  color={check.hasFoleyCatheter ? 'secondary' : 'default'}
                  variant={check.hasFoleyCatheter ? 'filled' : 'outlined'}
                  sx={{
                   fontWeight: check.hasFoleyCatheter ? 700 : 500,
                   bgcolor: check.hasFoleyCatheter ? '#7C3AED' : undefined,
                   color: check.hasFoleyCatheter ? '#FFFFFF' : 'text.disabled',
                  }}
                 />
                </Box>
               </Grid>

               <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                 variant='caption'
                 sx={{
                  fontWeight: 700,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mb: 1,
                 }}
                >
                 <WarningAmberRoundedIcon sx={{ fontSize: 15 }} />
                 การติดเชื้อและอุบัติการณ์ (Infections & Incidents)
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                 {check.hasVap && (
                  <Chip
                   label='พบเชื้อ VAP'
                   size='small'
                   color='error'
                   sx={{ fontWeight: 700 }}
                  />
                 )}
                 {check.hasClabsi && (
                  <Chip
                   label='พบเชื้อ CLABSI'
                   size='small'
                   color='error'
                   sx={{ fontWeight: 700 }}
                  />
                 )}
                 {check.hasCauti && (
                  <Chip
                   label='พบเชื้อ CAUTI'
                   size='small'
                   color='error'
                   sx={{ fontWeight: 700 }}
                  />
                 )}
                 {(check.unplannedExtubation || 0) > 0 && (
                  <Chip
                   label={`ท่อช่วยหายใจหลุด ${check.unplannedExtubation} ครั้ง`}
                   size='small'
                   color='error'
                   sx={{ fontWeight: 700 }}
                  />
                 )}
                 {check.pressureInjuryStage &&
                  check.pressureInjuryStage !== 'none' && (
                   <Chip
                    label={`แผลกดทับ ${check.pressureInjuryStage}`}
                    size='small'
                    color='warning'
                    sx={{ fontWeight: 700 }}
                   />
                  )}
                 {(check.medicationErrorGradeEUp || 0) > 0 && (
                  <Chip
                   label={`คลาดเคลื่อนทางยา >= E (${check.medicationErrorGradeEUp} ครั้ง)`}
                   size='small'
                   color='error'
                   sx={{ fontWeight: 700 }}
                  />
                 )}
                 {!check.hasVap &&
                  !check.hasClabsi &&
                  !check.hasCauti &&
                  !(check.unplannedExtubation || 0) &&
                  (!check.pressureInjuryStage ||
                   check.pressureInjuryStage === 'none') &&
                  !(check.medicationErrorGradeEUp || 0) && (
                   <Chip
                    icon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
                    label='ปลอดภัย ไม่พบอุบัติการณ์'
                    size='small'
                    sx={{
                     bgcolor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                     color: isDark ? '#34D399' : '#059669',
                     fontWeight: 700,
                    }}
                   />
                  )}
                </Box>
               </Grid>

               {check.note && (
                <Grid size={{ xs: 12 }}>
                 <Box
                  sx={{
                   bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                   p: { xs: 1.25, sm: 1.5 },
                   borderRadius: '10px',
                   border: '1px solid',
                   borderColor: 'divider',
                  }}
                 >
                  <Typography
                   variant='caption'
                   sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    display: 'block',
                   }}
                  >
                   บันทึกเพิ่มเติมจากผู้ตรวจประเมิน:
                  </Typography>
                  <Typography
                   variant='body2'
                   sx={{
                    mt: 0.5,
                    color: 'text.primary',
                    whiteSpace: 'pre-line',
                    fontSize: { xs: '0.82rem', sm: '0.875rem' },
                   }}
                  >
                   {check.note}
                  </Typography>
                 </Box>
                </Grid>
               )}
              </Grid>
             </CardContent>
            </Card>
           )
          })}
         </Stack>
        )}
       </Box>
      </Stack>
     ) : (
      <Card
       variant='outlined'
       sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: '16px' }}
      >
       <Typography
        variant='h6'
        sx={{
         color: 'text.secondary',
         fontSize: { xs: '1rem', sm: '1.25rem' },
        }}
       >
        {bed.bedNumber}: ไม่มีผู้ป่วยนอนครองเตียงในขณะนี้ (เตียงว่าง)
       </Typography>
      </Card>
     )}
    </Container>
   </Box>

   {/* Mobile Sticky Bottom Action Bar (กดด้วยนิ้วโป้งมือเดียวได้สะดวก) */}
   {patient && isMobile && (
    <Box
     sx={{
      position: 'sticky',
      bottom: 0,
      zIndex: 10,
      p: 1.5,
      pb: 'calc(12px + env(safe-area-inset-bottom))',
      bgcolor: isDark ? '#1E293B' : '#FFFFFF',
      borderTop: '1px solid',
      borderColor: 'divider',
     }}
    >
     <Button
      fullWidth
      variant='contained'
      size='large'
      startIcon={<AddCircleOutlineRoundedIcon />}
      onClick={handleNewAssessmentClick}
      sx={{
       bgcolor: '#0D9488',
       fontWeight: 700,
       borderRadius: '12px',
       py: 1.25,
       boxShadow: 'none',
       '&:hover': { bgcolor: '#0F766E' },
      }}
     >
      ประเมินรอบใหม่
     </Button>
    </Box>
   )}
  </Dialog>
 )
}
