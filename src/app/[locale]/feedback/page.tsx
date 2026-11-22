'use client'

import { submitFeedback } from '@/apis/feedback'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: 'ต้องปรับปรุง (Needs Improvement)', color: '#EF4444' },
  2: { text: 'พอใช้ (Fair)', color: '#F97316' },
  3: { text: 'ปานกลาง (Moderate)', color: '#EAB308' },
  4: { text: 'ดี (Good)', color: '#10B981' },
  5: { text: 'ดีเยี่ยม (Excellent)', color: '#0D9488' },
}

export default function FeedbackPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'th'

  useEffect(() => {
    document.title = 'แบบประเมินความพึงพอใจการให้บริการ | MICU'
  }, [])

  const [overallRating, setOverallRating] = useState<number>(5)
  const [nurseRating, setNurseRating] = useState<number>(5)
  const [doctorRating, setDoctorRating] = useState<number>(5)
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5)
  const [coordinationRating, setCoordinationRating] = useState<number>(5)

  const [relationship, setRelationship] = useState('child')
  const [patientOrBedInfo, setPatientOrBedInfo] = useState('')
  const [visitorName, setVisitorName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [comment, setComment] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!overallRating || overallRating < 1) {
      setErrorMessage('กรุณาเลือกคะแนนความพึงพอใจในภาพรวม')
      return
    }

    setIsSubmitting(true)
    try {
      await submitFeedback({
        overallRating,
        nurseRating,
        doctorRating,
        cleanlinessRating,
        coordinationRating,
        relationship,
        patientOrBedInfo: patientOrBedInfo.trim(),
        visitorName: visitorName.trim(),
        contactPhone: contactPhone.trim(),
        comment: comment.trim(),
      })
      setIsSuccess(true)
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการส่งแบบประเมิน กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setOverallRating(5)
    setNurseRating(5)
    setDoctorRating(5)
    setCleanlinessRating(5)
    setCoordinationRating(5)
    setRelationship('child')
    setPatientOrBedInfo('')
    setVisitorName('')
    setContactPhone('')
    setComment('')
    setIsSuccess(false)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      {/* Navbar */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1.5,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth='lg'>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              component={Link}
              href={`/${locale}/portal`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: 'rgba(13, 148, 136, 0.12)',
                  color: '#0D9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LocalHospitalRoundedIcon />
              </Box>
              <Box>
                <Typography variant='subtitle1' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  MICU Service Feedback
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                  ระบบรับฟังความคิดเห็นและประเมินผลการบริการ
                </Typography>
              </Box>
            </Box>

            <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
              <Button
                component={Link}
                href={`/${locale}/portal`}
                variant='outlined'
                size='small'
                startIcon={<ArrowBackRoundedIcon />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'divider',
                  color: 'text.primary',
                }}
              >
                หน้าพอร์ทัล
              </Button>

              <Button
                component={Link}
                href={`/${locale}/login`}
                variant='text'
                size='small'
                startIcon={<LoginRoundedIcon />}
                sx={{
                  color: 'text.secondary',
                  textTransform: 'none',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              >
                สำหรับเจ้าหน้าที่
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth='md' sx={{ pt: { xs: 3, md: 5 } }}>
        {isSuccess ? (
          <Card
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'rgba(13, 148, 136, 0.12)',
                color: '#0D9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 44 }} />
            </Box>

            <Typography variant='h5' sx={{ fontWeight: 800, mb: 1 }}>
              ขอบพระคุณสำหรับความคิดเห็นและคะแนนประเมิน
            </Typography>

            <Typography
              variant='body1'
              sx={{ color: 'text.secondary', maxWidth: 540, mx: 'auto', mb: 4, lineHeight: 1.6 }}
            >
              ข้อมูลและข้อเสนอแนะของท่านได้รับการบันทึกเรียบร้อยแล้ว
              ทีมแพทย์และบุคลากรหอผู้ป่วยวิกฤต (MICU) จะนำข้อคิดเห็นของท่านไปพัฒนาคุณภาพการบริการและการดูแลผู้ป่วยให้ดียิ่งขึ้นต่อไป
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
              <Button
                component={Link}
                href={`/${locale}/portal`}
                variant='contained'
                size='large'
                sx={{
                  bgcolor: '#0D9488',
                  '&:hover': { bgcolor: '#0b8a64' },
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3.5,
                }}
              >
                กลับสู่หน้าสารสนเทศพอร์ทัล
              </Button>

              <Button
                variant='outlined'
                size='large'
                onClick={handleResetForm}
                sx={{
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderColor: 'divider',
                  color: 'text.primary',
                }}
              >
                ส่งแบบประเมินอีกครั้ง
              </Button>
            </Stack>
          </Card>
        ) : (
          <Box>
            {/* Page Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.6,
                  borderRadius: '20px',
                  bgcolor: 'rgba(13, 148, 136, 0.1)',
                  color: '#0D9488',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  mb: 1.5,
                }}
              >
                <FavoriteRoundedIcon sx={{ fontSize: 16 }} />
                แบบประเมินความพึงพอใจการให้บริการ (Patient & Family Satisfaction)
              </Box>

              <Typography
                variant='h4'
                component='h1'
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.65rem', md: '2.15rem' },
                  color: 'text.primary',
                  mb: 1.25,
                }}
              >
                ร่วมให้คะแนนและข้อเสนอแนะการบริการ
              </Typography>

              <Typography
                variant='body1'
                sx={{
                  color: 'text.secondary',
                  maxWidth: 640,
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontSize: '0.95rem',
                }}
              >
                ความคิดเห็นของท่านคือหัวใจสำคัญในการปรับปรุงการดูแลรักษาพยาบาล
                ท่านสามารถร่วมประเมินได้โดยไม่จำเป็นต้องระบุชื่อ-สกุล
              </Typography>
            </Box>

            {/* Survey Card Form */}
            <Card
              component='form'
              onSubmit={handleSubmit}
              sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              {errorMessage && (
                <Alert severity='error' sx={{ mb: 3, borderRadius: '10px' }}>
                  {errorMessage}
                </Alert>
              )}

              {/* Section 1: Overall Satisfaction */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F0FDFA',
                  border: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'divider' : '#CCFBF1',
                  textAlign: 'center',
                  mb: 3.5,
                }}
              >
                <Typography variant='subtitle1' sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                  ความพึงพอใจในภาพรวมต่อการดูแลและการบริการ (Overall Satisfaction)*
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                  กรุณาแตะที่ดาวเพื่อเลือกระดับความพึงพอใจของท่าน (1 ถึง 5 ดาว)
                </Typography>

                <Rating
                  value={overallRating}
                  onChange={(_, val) => val && setOverallRating(val)}
                  size='large'
                  icon={<StarRoundedIcon sx={{ fontSize: { xs: 40, sm: 48 }, color: '#0D9488' }} />}
                  emptyIcon={<StarRoundedIcon sx={{ fontSize: { xs: 40, sm: 48 }, opacity: 0.3 }} />}
                />

                <Box sx={{ mt: 1.5 }}>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      fontWeight: 800,
                      color: RATING_LABELS[overallRating]?.color || '#0D9488',
                    }}
                  >
                    {RATING_LABELS[overallRating]?.text}
                  </Typography>
                </Box>
              </Box>

              {/* Section 2: Aspect Ratings */}
              <Typography variant='h6' sx={{ fontWeight: 800, mb: 2, fontSize: '1.05rem' }}>
                การประเมินการบริการในแต่ละด้าน
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 700, mb: 0.5 }}>
                      1. การดูแลและการสื่อสารของทีมพยาบาล
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                      ความเอาใจใส่ ความสุภาพ และการตอบสนอง
                    </Typography>
                    <Rating
                      value={nurseRating}
                      onChange={(_, val) => val && setNurseRating(val)}
                      icon={<StarRoundedIcon fontSize='inherit' sx={{ color: '#0D9488' }} />}
                      emptyIcon={<StarRoundedIcon fontSize='inherit' sx={{ opacity: 0.3 }} />}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 700, mb: 0.5 }}>
                      2. การให้ข้อมูลและการอธิบายของแพทย์
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                      ความชัดเจนของแผนการรักษาและความใส่ใจ
                    </Typography>
                    <Rating
                      value={doctorRating}
                      onChange={(_, val) => val && setDoctorRating(val)}
                      icon={<StarRoundedIcon fontSize='inherit' sx={{ color: '#0D9488' }} />}
                      emptyIcon={<StarRoundedIcon fontSize='inherit' sx={{ opacity: 0.3 }} />}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 700, mb: 0.5 }}>
                      3. ความสะอาด สิ่งอำนวยความสะดวก และสิ่งแวดล้อม
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                      ความสะอาดของห้อง สุขอนามัย และบรรยากาศรอบข้าง
                    </Typography>
                    <Rating
                      value={cleanlinessRating}
                      onChange={(_, val) => val && setCleanlinessRating(val)}
                      icon={<StarRoundedIcon fontSize='inherit' sx={{ color: '#0D9488' }} />}
                      emptyIcon={<StarRoundedIcon fontSize='inherit' sx={{ opacity: 0.3 }} />}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 700, mb: 0.5 }}>
                      4. ความสะดวกรวดเร็วในการประสานงานและการเข้าเยี่ยม
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                      กระบวนการคัดกรอง ความสะดวกในการสอบถาม
                    </Typography>
                    <Rating
                      value={coordinationRating}
                      onChange={(_, val) => val && setCoordinationRating(val)}
                      icon={<StarRoundedIcon fontSize='inherit' sx={{ color: '#0D9488' }} />}
                      emptyIcon={<StarRoundedIcon fontSize='inherit' sx={{ opacity: 0.3 }} />}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Section 3: Feedback text */}
              <Typography variant='h6' sx={{ fontWeight: 800, mb: 1, fontSize: '1.05rem' }}>
                ข้อเสนอแนะ คำชมเชย หรือสิ่งที่ต้องการให้ปรับปรุง
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                ท่านสามารถระบุความประทับใจ หรือข้อเสนอแนะที่ต้องการให้ทีมงานนำไปปรับปรุง
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='พิมพ์ความคิดเห็น คำติชม หรือข้อเสนอแนะของท่านที่นี่...'
                sx={{ mb: 3.5 }}
              />

              <Divider sx={{ my: 3 }} />

              {/* Section 4: Visitor Info (Optional) */}
              <Typography variant='h6' sx={{ fontWeight: 800, mb: 1, fontSize: '1.05rem' }}>
                ข้อมูลผู้ประเมิน (ไม่บังคับระบุ - สามารถเว้นว่างได้)
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                ข้อมูลส่วนนี้เป็นประโยชน์ในการประสานงานดูแลผู้ป่วยของท่านอย่างต่อเนื่อง
              </Typography>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>ความเกี่ยวข้องกับผู้ป่วย</InputLabel>
                    <Select
                      value={relationship}
                      label='ความเกี่ยวข้องกับผู้ป่วย'
                      onChange={(e) => setRelationship(e.target.value)}
                    >
                      <MenuItem value='child'>บุตร / หลาน</MenuItem>
                      <MenuItem value='spouse'>คู่สมรส (สามี/ภรรยา)</MenuItem>
                      <MenuItem value='parent'>บิดา / มารดา</MenuItem>
                      <MenuItem value='relative'>ญาติผู้ป่วย</MenuItem>
                      <MenuItem value='other'>ผู้มาติดต่อ / อื่นๆ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size='small'
                    label='หมายเลขเตียง หรือ ชื่อผู้ป่วย (ถ้าประสงค์ระบุ)'
                    value={patientOrBedInfo}
                    onChange={(e) => setPatientOrBedInfo(e.target.value)}
                    placeholder='เช่น เตียง 3 หรือ คุณสมชาย'
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size='small'
                    label='ชื่อ-นามสกุล ผู้ประเมิน (ถ้าประสงค์ระบุ)'
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder='เว้นว่างได้เพื่อประเมินแบบไม่ระบุชื่อ'
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size='small'
                    label='เบอร์โทรศัพท์ติดต่อกลับ (ถ้าต้องการ)'
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder='เช่น 08x-xxx-xxxx'
                  />
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Button
                type='submit'
                variant='contained'
                size='large'
                fullWidth
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color='inherit' /> : <SendRoundedIcon />}
                sx={{
                  bgcolor: '#0D9488',
                  '&:hover': { bgcolor: '#0b8a64' },
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  py: 1.5,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
                }}
              >
                {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งความคิดเห็นและคะแนนการบริการ'}
              </Button>
            </Card>
          </Box>
        )}
      </Container>
    </Box>
  )
}
