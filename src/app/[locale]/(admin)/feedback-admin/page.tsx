'use client'

import {
  deleteFeedback,
  FeedbackItem,
  updateFeedbackStatus,
  useFeedbackList,
  useFeedbackStats,
} from '@/apis/feedback'
import { useCurrentUser } from '@/apis/auth/me'
import {
  FeedbackCard,
  FeedbackFilter,
  FeedbackPagination,
  FeedbackStats,
} from '@/components/admin/feedback'
import { TitlePage } from '@/components/utils/titlePage'
import { useSnackBarNotification } from '@/hooks'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded'
import { Box, Button, Card, CircularProgress, Stack, Typography } from '@mui/material'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

function FeedbackAdminContent() {
  const params = useParams()
  const locale = (params?.locale as string) || 'th'
  const { showSnackbar } = useSnackBarNotification()
  const { user } = useCurrentUser()
  const activeWard = user?.ward || 'MICU3'

  useEffect(() => {
    document.title = `ข้อเสนอแนะและประเมินผลการบริการ | ${activeWard} System`
  }, [activeWard])

  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleRatingChange = (val: string) => {
    setRatingFilter(val)
    setPage(1)
  }

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    setPage(1)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  const queryParams = useMemo(() => {
    return {
      search: search.trim() || undefined,
      rating: ratingFilter !== 'all' ? ratingFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page,
      limit,
    }
  }, [search, ratingFilter, statusFilter, page, limit])

  const { data: listRes, isLoading, mutate } = useFeedbackList(queryParams)
  const feedbacks: FeedbackItem[] = listRes?.data || []
  const pagination = listRes?.pagination

  const { data: statsRes, mutate: mutateStats } = useFeedbackStats()
  const stats = statsRes?.data

  const handleUpdateStatus = async (
    item: FeedbackItem,
    newStatus: 'new' | 'reviewed' | 'resolved',
  ) => {
    try {
      const targetId = item.objectUuId || item._id
      await updateFeedbackStatus(targetId, newStatus)
      showSnackbar('อัปเดตสถานะการตรวจสอบสำเร็จ', 'success')
      mutate()
      mutateStats()
    } catch (err: any) {
      showSnackbar(err.message || 'อัปเดตสถานะไม่สำเร็จ', 'error')
    }
  }

  const handleDelete = async (item: FeedbackItem) => {
    if (!confirm('ยืนยันที่จะลบรายการความคิดเห็นนี้หรือไม่?')) return
    try {
      const targetId = item.objectUuId || item._id
      await deleteFeedback(targetId)
      showSnackbar('ลบความคิดเห็นสำเร็จ', 'success')
      mutate()
      mutateStats()
    } catch (err: any) {
      showSnackbar(err.message || 'ลบความคิดเห็นไม่สำเร็จ', 'error')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        height: { xs: 'auto', md: 'calc(100vh - 64px - 48px)' },
        maxHeight: { xs: 'none', md: 'calc(100vh - 64px - 48px)' },
        overflow: { xs: 'visible', md: 'hidden' },
      }}
    >
      {/* Fixed Top Section: Title, Stats Summary & Filter */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        <TitlePage
          title='ข้อเสนอแนะและประเมินผลการบริการ (Feedback & Satisfaction)'
          actions={
            <Button
              component={Link}
              href={`/${locale}/feedback`}
              target='_blank'
              variant='outlined'
              startIcon={<OpenInNewRoundedIcon />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                borderColor: '#0D9488',
                color: '#0D9488',
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(13, 148, 136, 0.1)' : '#F0FDFA',
                  borderColor: '#0D9488',
                },
              }}
            >
              เปิดหน้าแบบประเมินผู้รับบริการ
            </Button>
          }
        />

        <FeedbackStats stats={stats} />

        <FeedbackFilter
          search={search}
          onSearchChange={handleSearchChange}
          rating={ratingFilter}
          onRatingChange={handleRatingChange}
          status={statusFilter}
          onStatusChange={handleStatusChange}
        />
      </Box>

      {/* Scrollable Middle Section: Feedback Cards */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: { xs: 'visible', md: 'auto' },
          pr: { xs: 0, md: 0.5 },
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.15)',
            borderRadius: 3,
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 4, justifyContent: 'center' }}>
            <CircularProgress size={24} sx={{ color: '#0D9488' }} />
            <Typography color='text.secondary'>กำลังโหลดรายการความคิดเห็น...</Typography>
          </Box>
        ) : feedbacks.length === 0 ? (
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
            <SentimentSatisfiedAltRoundedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant='h6' sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
              ยังไม่พบข้อมูลความคิดเห็นที่ตรงกับเงื่อนไข
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              ท่านสามารถแชร์ลิงก์ /{locale}/feedback ให้แก่ญาติผู้ป่วยเพื่อประเมินการบริการได้ตลอดเวลา
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2} sx={{ pb: 0.5 }}>
            {feedbacks.map((item) => (
              <FeedbackCard
                key={item.objectUuId || item._id}
                item={item}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Fixed Bottom Section: Pagination */}
      <Box sx={{ flexShrink: 0 }}>
        <FeedbackPagination
          page={page}
          totalPages={pagination?.totalPages || 1}
          totalItems={pagination?.totalItems || feedbacks.length}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
        />
      </Box>
    </Box>
  )
}

export default function FeedbackAdminPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 4, justifyContent: 'center' }}>
          <CircularProgress size={24} sx={{ color: '#0D9488' }} />
          <Typography color='text.secondary'>กำลังโหลดระบบข้อเสนอแนะ...</Typography>
        </Box>
      }
    >
      <FeedbackAdminContent />
    </Suspense>
  )
}
