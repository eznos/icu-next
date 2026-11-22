'use client'

import { ContentItem, useContentList, usePortalHeader } from '@/apis/content'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import CallRoundedIcon from '@mui/icons-material/CallRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded'
import SanitizerRoundedIcon from '@mui/icons-material/SanitizerRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import {
 Box,
 Button,
 Card,
 CardContent,
 CardMedia,
 Chip,
 CircularProgress,
 Container,
 Dialog,
 DialogActions,
 DialogContent,
 DialogTitle,
 Divider,
 Grid,
 IconButton,
 InputAdornment,
 Stack,
 Tab,
 Tabs,
 TextField,
 Typography,
} from '@mui/material'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'

const CATEGORY_MAP: Record<
 string,
 { label: string; color: string; bg: string }
> = {
 announcement: { label: 'ประกาศ ICU', color: '#D97706', bg: '#FEF3C7' },
 policy: { label: 'ระเบียบการเข้าเยี่ยม', color: '#DC2626', bg: '#FEE2E2' },
 education: { label: 'สุขศึกษาและคำแนะนำ', color: '#0D9488', bg: '#CCFBF1' },
 news: { label: 'ข่าวสารและนวัตกรรม', color: '#2563EB', bg: '#DBEAFE' },
 guideline: { label: 'แนวทางปฏิบัติ', color: '#7C3AED', bg: '#EDE9FE' },
}

export default function PortalPage() {
 const params = useParams()
 const locale = (params?.locale as string) || 'th'

 const [search, setSearch] = useState('')
 const [selectedTab, setSelectedTab] = useState('all')
 const [selectedArticle, setSelectedArticle] = useState<ContentItem | null>(
  null,
 )

 // Public Query: เฉพาะเนื้อหาที่ isPublished: true
 const queryParams = useMemo(() => {
  return {
   publicOnly: true,
   category: selectedTab !== 'all' ? selectedTab : undefined,
   search: search.trim() || undefined,
  }
 }, [selectedTab, search])

 const { data, isLoading } = useContentList(queryParams)
 const articles: ContentItem[] = data?.data || []

 const { data: headerRes } = usePortalHeader()
 const portalHeader = headerRes?.data

 // ข่าวสารที่ปักหมุด
 const pinnedArticles = useMemo(
  () => articles.filter((a) => a.isPinned),
  [articles],
 )

 return (
  <Box
   sx={{
    minHeight: '100vh',
    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC'),
   }}
  >
   {/* Navigation Header */}
   <Box
    component='header'
    sx={{
     position: 'sticky',
     top: 0,
     zIndex: 100,
     bgcolor: 'background.paper',
     borderBottom: '1px solid',
     borderColor: 'divider',
     py: 1.5,
     backdropFilter: 'blur(8px)',
    }}
   >
    <Container maxWidth='lg'>
     <Box
      sx={{
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'space-between',
      }}
     >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
        <Typography
         variant='subtitle1'
         sx={{ fontWeight: 800, lineHeight: 1.2 }}
        >
         MICU Public Portal
        </Typography>
        <Typography
         variant='caption'
         sx={{ color: 'text.secondary', display: 'block' }}
        >
         ศูนย์ข้อมูลและสารสนเทศหอผู้ป่วยวิกฤต
        </Typography>
       </Box>
      </Box>

      <Stack direction='row' spacing={1.5} sx={{ alignItems: 'center' }}>
       <Button
        component={Link}
        href={`/${locale}/login`}
        variant='contained'
        size='small'
        startIcon={<LoginRoundedIcon />}
        sx={{
         bgcolor: '#0D9488',
         textTransform: 'none',
         fontWeight: 700,
         borderRadius: '8px',
         px: 2,
         boxShadow: 'none',
         '&:hover': { bgcolor: '#0b8a64', boxShadow: 'none' },
        }}
       >
        เข้าสู่ระบบบุคลากร (Staff Login)
       </Button>
      </Stack>
     </Box>
    </Container>
   </Box>

   {/* Hero Section */}
   <Box
    sx={{
     bgcolor: (theme) =>
      theme.palette.mode === 'dark'
       ? 'linear-gradient(180deg, #132A27 0%, #0F172A 100%)'
       : 'linear-gradient(180deg, #E6FFFA 0%, #F8FAFC 100%)',
     py: { xs: 5, md: 8 },
     borderBottom: '1px solid',
     borderColor: 'divider',
    }}
   >
    <Container maxWidth='lg'>
     <Grid container spacing={4} sx={{ alignItems: 'center' }}>
      <Grid size={{ xs: 12, md: 8 }}>
       <Chip
        label={
         portalHeader?.badgeText ||
         'บริการสารสนเทศและประชาสัมพันธ์สำหรับญาติผู้ป่วย'
        }
        size='small'
        sx={{
         bgcolor: '#0D9488',
         color: '#FFFFFF',
         fontWeight: 700,
         fontSize: '0.75rem',
         mb: 2,
        }}
       />
       <Typography
        variant='h3'
        sx={{
         fontWeight: 900,
         fontSize: { xs: '1.85rem', md: '2.5rem' },
         lineHeight: 1.25,
         color: 'text.primary',
         mb: 2,
        }}
       >
        {portalHeader?.title || 'หออภิบาลผู้ป่วยวิกฤตอายุรกรรม (MICU)'}
       </Typography>
       <Typography
        variant='body1'
        sx={{
         color: 'text.secondary',
         fontSize: { xs: '0.95rem', md: '1.05rem' },
         lineHeight: 1.6,
         maxWidth: 680,
         mb: 3,
        }}
       >
        {portalHeader?.description ||
         'ศูนย์รวมข้อมูลระเบียบการเข้าเยี่ยม คำแนะนำการปฏิบัติตัวสำหรับครอบครัว และสาระความรู้ในการร่วมมือดูแลฟื้นฟูสุขภาพผู้ป่วยวิกฤตตามมาตรฐานความปลอดภัยสากล'}
       </Typography>

       {/* Quick Notice Badges */}
       <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box
         sx={{
          p: 1.75,
          borderRadius: '12px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
         }}
        >
         <AccessTimeRoundedIcon sx={{ color: '#0D9488' }} />
         <Box>
          <Typography
           variant='caption'
           sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
           {portalHeader?.visitingHoursLabel || 'เวลาเข้าเยี่ยมผู้ป่วย'}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 800 }}>
           {portalHeader?.visitingHours ||
            '12:00 - 13:00 น. | 17:00 - 19:00 น.'}
          </Typography>
         </Box>
        </Box>

        <Box
         sx={{
          p: 1.75,
          borderRadius: '12px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
         }}
        >
         <SanitizerRoundedIcon sx={{ color: '#0D9488' }} />
         <Box>
          <Typography
           variant='caption'
           sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
           {portalHeader?.safetyMeasuresLabel || 'มาตรการความปลอดภัย'}
          </Typography>
          <Typography variant='body2' sx={{ fontWeight: 800 }}>
           {portalHeader?.safetyMeasures ||
            'ล้างมือก่อนเข้า-ออก | สวมหน้ากากอนามัย'}
          </Typography>
         </Box>
        </Box>
       </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
       <Card
        sx={{
         borderRadius: '18px',
         border: '1px solid',
         borderColor: 'divider',
         p: 3,
         bgcolor: 'background.paper',
         boxShadow: '0 8px 24px rgba(13,148,136,0.08)',
        }}
       >
        <Typography
         variant='subtitle1'
         sx={{
          fontWeight: 800,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
         }}
        >
         <SecurityRoundedIcon sx={{ color: '#0D9488' }} />
         {portalHeader?.guidelinesTitle || 'ข้อพึงปฏิบัติสำคัญ'}
        </Typography>

        <Stack spacing={1.5}>
         {(
          portalHeader?.guidelines || [
           'เข้าเยี่ยมเตียงละไม่เกิน 2 ท่าน พร้อมกัน',
           'งดถ่ายภาพและบันทึกวิดีโอเพื่อคุ้มครองสิทธิผู้ป่วย',
           'ติดต่อสอบถามข้อมูลอาการได้ที่เคาน์เตอร์พยาบาล',
          ]
         ).map((g: string, idx: number) => (
          <Box
           key={idx}
           sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}
          >
           <CheckCircleRoundedIcon
            sx={{ color: '#10B981', fontSize: 18, mt: 0.25 }}
           />
           <Typography
            variant='body2'
            sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
           >
            {g}
           </Typography>
          </Box>
         ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
         <CallRoundedIcon sx={{ color: '#0D9488', fontSize: 18 }} />
         <Typography variant='body2' sx={{ fontWeight: 700 }}>
          {portalHeader?.emergencyPhone ||
           'สายด่วน ICU: 02-xxx-xxxx ต่อ 1234'}
         </Typography>
        </Box>
       </Card>
      </Grid>
     </Grid>
    </Container>
   </Box>

   {/* Main Content Area */}
   <Container maxWidth='lg' sx={{ py: 5 }}>
    {/* Pinned Highlights (ถ้ามีประกาศสำคัญ) */}
    {pinnedArticles.length > 0 && selectedTab === 'all' && !search && (
     <Box sx={{ mb: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
       <PushPinRoundedIcon sx={{ color: '#D97706', fontSize: 20 }} />
       <Typography variant='h6' sx={{ fontWeight: 800 }}>
        ประกาศและระเบียบสำคัญ (Important Announcements)
       </Typography>
      </Box>

      <Grid container spacing={3}>
       {pinnedArticles.map((article) => (
        <Grid key={article.slug || article._id} size={{ xs: 12, md: 6 }}>
         <Card
          onClick={() => setSelectedArticle(article)}
          sx={{
           cursor: 'pointer',
           borderRadius: '16px',
           border: '2px solid',
           borderColor: '#FDE68A',
           bgcolor: 'background.paper',
           boxShadow: '0 4px 16px rgba(217,119,6,0.06)',
           transition: 'all 0.2s ease',
           '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 24px rgba(217,119,6,0.12)',
           },
          }}
         >
          {article.coverImage && (
           <CardMedia
            component='img'
            height='180'
            image={article.coverImage}
            alt={article.title}
           />
          )}
          <CardContent sx={{ p: 3 }}>
           <Chip
            size='small'
            label='ประกาศสำคัญ'
            color='warning'
            sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22, mb: 1.5 }}
           />
           <Typography
            variant='h6'
            sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1 }}
           >
            {article.title}
           </Typography>
           <Typography
            variant='body2'
            sx={{
             color: 'text.secondary',
             lineHeight: 1.5,
             mb: 2,
             display: '-webkit-box',
             WebkitLineClamp: 3,
             WebkitBoxOrient: 'vertical',
             overflow: 'hidden',
            }}
           >
            {article.summary || article.content}
           </Typography>
           <Typography
            variant='caption'
            sx={{ color: '#0D9488', fontWeight: 700 }}
           >
            คลิกอ่านรายละเอียดฉบับเต็ม &rarr;
           </Typography>
          </CardContent>
         </Card>
        </Grid>
       ))}
      </Grid>
     </Box>
    )}

    {/* Search & Category Filter */}
    <Box sx={{ mb: 4 }}>
     <Box
      sx={{
       display: 'flex',
       flexDirection: { xs: 'column', md: 'row' },
       alignItems: { xs: 'stretch', md: 'center' },
       justifyContent: 'space-between',
       gap: 2,
       mb: 3,
      }}
     >
      <Tabs
       value={selectedTab}
       onChange={(_, val) => setSelectedTab(val)}
       variant='scrollable'
       scrollButtons='auto'
       sx={{
        minHeight: 42,
        '& .MuiTabs-indicator': { backgroundColor: '#0D9488', height: 3 },
        '& .MuiTab-root': {
         minHeight: 42,
         textTransform: 'none',
         fontWeight: 700,
         fontSize: '0.9rem',
         px: 2,
         '&.Mui-selected': { color: '#0D9488' },
        },
       }}
      >
       <Tab value='all' label='เนื้อหาทั้งหมด' />
       <Tab value='announcement' label='ประกาศ ICU' />
       <Tab value='policy' label='ระเบียบการเยี่ยม' />
       <Tab value='education' label='สุขศึกษา/คำแนะนำ' />
       <Tab value='news' label='ข่าวสารและนวัตกรรม' />
      </Tabs>

      <TextField
       size='small'
       placeholder='ค้นหาหัวข้อ คำแนะนำ หรือประกาศ...'
       value={search}
       onChange={(e) => setSearch(e.target.value)}
       sx={{ minWidth: { md: 280 } }}
       slotProps={{
        input: {
         startAdornment: (
          <InputAdornment position='start'>
           <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          </InputAdornment>
         ),
        },
       }}
      />
     </Box>
    </Box>

    {/* Articles Grid */}
    {isLoading ? (
     <Box
      sx={{
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
       p: 8,
       gap: 2,
      }}
     >
      <CircularProgress size={28} sx={{ color: '#0D9488' }} />
      <Typography color='text.secondary'>
       กำลังโหลดข้อมูลเนื้อหาและประกาศ...
      </Typography>
     </Box>
    ) : articles.length === 0 ? (
     <Card
      sx={{
       p: 6,
       textAlign: 'center',
       borderRadius: '16px',
       border: '1px dashed',
       borderColor: 'divider',
       bgcolor: 'background.paper',
      }}
     >
      <Typography
       variant='h6'
       sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}
      >
       ไม่พบเนื้อหาที่ตรงกับเงื่อนไขการค้นหา
      </Typography>
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
       กรุณาลองเปลี่ยนคำค้นหาหรือเลือกดูหมวดหมู่อื่น
      </Typography>
     </Card>
    ) : (
     <Grid container spacing={3}>
      {articles.map((item) => {
       const catConfig = CATEGORY_MAP[item.category] || {
        label: item.category,
        color: '#64748B',
        bg: '#F1F5F9',
       }

       return (
        <Grid key={item._id || item.slug} size={{ xs: 12, sm: 6, md: 4 }}>
         <Card
          onClick={() => setSelectedArticle(item)}
          sx={{
           height: '100%',
           display: 'flex',
           flexDirection: 'column',
           borderRadius: '16px',
           border: '1px solid',
           borderColor: 'divider',
           bgcolor: 'background.paper',
           cursor: 'pointer',
           transition: 'all 0.2s ease',
           '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            borderColor: '#0D9488',
           },
          }}
         >
          {item.coverImage && (
           <CardMedia
            component='img'
            height='170'
            image={item.coverImage}
            alt={item.title}
            sx={{ objectFit: 'cover' }}
           />
          )}

          <CardContent
           sx={{
            p: 2.5,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
           }}
          >
           <Box
            sx={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             mb: 1.5,
            }}
           >
            <Chip
             size='small'
             label={catConfig.label}
             sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 22,
              bgcolor: catConfig.bg,
              color: catConfig.color,
             }}
            />
            <Box
             sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'text.secondary',
              fontSize: '0.75rem',
             }}
            >
             <VisibilityRoundedIcon sx={{ fontSize: 14 }} />
             <span>{item.viewCount}</span>
            </Box>
           </Box>

           <Typography
            variant='subtitle1'
            sx={{
             fontWeight: 800,
             lineHeight: 1.35,
             mb: 1,
             color: 'text.primary',
             display: '-webkit-box',
             WebkitLineClamp: 2,
             WebkitBoxOrient: 'vertical',
             overflow: 'hidden',
            }}
           >
            {item.title}
           </Typography>

           <Typography
            variant='body2'
            sx={{
             color: 'text.secondary',
             fontSize: '0.85rem',
             lineHeight: 1.5,
             mb: 2,
             display: '-webkit-box',
             WebkitLineClamp: 3,
             WebkitBoxOrient: 'vertical',
             overflow: 'hidden',
            }}
           >
            {item.summary || item.content}
           </Typography>

           <Box
            sx={{
             mt: 'auto',
             pt: 1.5,
             borderTop: '1px solid',
             borderColor: 'divider',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
            }}
           >
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
             {item.author}
            </Typography>
            <Typography
             variant='caption'
             sx={{ color: '#0D9488', fontWeight: 700 }}
            >
             อ่านต่อ &rarr;
            </Typography>
           </Box>
          </CardContent>
         </Card>
        </Grid>
       )
      })}
     </Grid>
    )}
   </Container>

   {/* Reader Dialog: แสดงเนื้อหาฉบับเต็มเมื่อคลิก */}
   <Dialog
    open={Boolean(selectedArticle)}
    onClose={() => setSelectedArticle(null)}
    maxWidth='md'
    fullWidth
    slotProps={{
     paper: {
      sx: { borderRadius: '20px', overflow: 'hidden' },
     },
    }}
   >
    {selectedArticle && (
     <>
      {selectedArticle.coverImage && (
       <CardMedia
        component='img'
        height='240'
        image={selectedArticle.coverImage}
        alt={selectedArticle.title}
        sx={{ objectFit: 'cover' }}
       />
      )}

      <DialogTitle sx={{ p: 3, pb: 1.5 }}>
       <Box
        sx={{
         display: 'flex',
         justifyContent: 'space-between',
         alignItems: 'flex-start',
         gap: 2,
        }}
       >
        <Box>
         <Chip
          size='small'
          label={
           CATEGORY_MAP[selectedArticle.category]?.label ||
           selectedArticle.category
          }
          sx={{
           bgcolor: CATEGORY_MAP[selectedArticle.category]?.bg || '#F1F5F9',
           color: CATEGORY_MAP[selectedArticle.category]?.color || '#475569',
           fontWeight: 700,
           fontSize: '0.75rem',
           mb: 1.5,
          }}
         />
         <Typography variant='h5' sx={{ fontWeight: 800, lineHeight: 1.3 }}>
          {selectedArticle.title}
         </Typography>
         <Typography
          variant='caption'
          sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
         >
          โดย {selectedArticle.author} | ยอดเข้าชม {selectedArticle.viewCount}{' '}
          ครั้ง
         </Typography>
        </Box>

        <IconButton size='small' onClick={() => setSelectedArticle(null)}>
         <CloseRoundedIcon />
        </IconButton>
       </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
       <Typography
        variant='body1'
        sx={{
         color: 'text.primary',
         fontSize: '0.98rem',
         lineHeight: 1.8,
         whiteSpace: 'pre-line',
        }}
       >
        {selectedArticle.content}
       </Typography>

       {selectedArticle.tags && selectedArticle.tags.length > 0 && (
        <Box
         sx={{
          mt: 3,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
         }}
        >
         {selectedArticle.tags.map((t) => (
          <Chip
           key={t}
           label={`#${t}`}
           size='small'
           variant='outlined'
           sx={{ fontSize: '0.72rem' }}
          />
         ))}
        </Box>
       )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, px: 3, justifyContent: 'flex-end' }}>
       <Button
        onClick={() => setSelectedArticle(null)}
        sx={{ textTransform: 'none', fontWeight: 700 }}
       >
        ปิดหน้าต่าง
       </Button>
      </DialogActions>
     </>
    )}
   </Dialog>
  </Box>
 )
}
