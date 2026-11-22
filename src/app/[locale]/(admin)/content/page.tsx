'use client'

import {
  ContentItem,
  deleteContent,
  updateContent,
  useContentList,
  usePortalHeader,
} from '@/apis/content'
import {
  ContentCard,
  ContentFilter,
  ContentModal,
  PortalHeaderModal,
} from '@/components/admin/content'
import { TitlePage } from '@/components/utils/titlePage'
import { useSnackBarNotification } from '@/hooks'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { Box, Button, Card, CircularProgress, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

function ContentManagementContent() {
  const params = useParams()
  const locale = (params?.locale as string) || 'th'
  const { showSnackbar } = useSnackBarNotification()

  useEffect(() => {
    document.title = 'จัดการเนื้อหาและข่าวสาร | MICU3 System'
  }, [])

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  const queryParams = useMemo(() => {
    return {
      search: search.trim() || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      isPublished:
        statusFilter === 'published'
          ? true
          : statusFilter === 'draft'
            ? false
            : undefined,
    }
  }, [search, selectedCategory, statusFilter])

  const { data, isLoading, mutate } = useContentList(queryParams)
  const items: ContentItem[] = data?.data || []

  const { data: portalHeaderRes, mutate: mutateHeader } = usePortalHeader()
  const portalHeader = portalHeaderRes?.data

  const [headerModalOpen, setHeaderModalOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)

  const handleOpenCreate = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const handleTogglePublish = async (item: ContentItem) => {
    try {
      const targetId = item.objectUuId || item._id
      await updateContent(targetId, {
        isPublished: !item.isPublished,
      })
      showSnackbar(
        `เปลี่ยนสถานะเป็น ${!item.isPublished ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'} เรียบร้อย`,
        'success',
      )
      mutate()
    } catch (err: any) {
      showSnackbar(err.message || 'เปลี่ยนสถานะไม่สำเร็จ', 'error')
    }
  }

  const handleDelete = async (item: ContentItem) => {
    if (!confirm(`ยืนยันที่จะลบเนื้อหา "${item.title}" หรือไม่?`)) return
    try {
      const targetId = item.objectUuId || item._id
      await deleteContent(targetId)
      showSnackbar('ลบเนื้อหาสำเร็จ', 'success')
      mutate()
    } catch (err: any) {
      showSnackbar(err.message || 'ลบเนื้อหาไม่สำเร็จ', 'error')
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
      <TitlePage
        title='จัดการเนื้อหาและข่าวสาร (Content Management)'
        actions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href={`/${locale}/portal`}
              target='_blank'
              variant='outlined'
              startIcon={<OpenInNewRoundedIcon />}
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
                },
              }}
            >
              ดูหน้า Portal สาธารณะ
            </Button>

            <Button
              variant='outlined'
              startIcon={<EditNoteRoundedIcon />}
              onClick={() => setHeaderModalOpen(true)}
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
              แก้ไข Header พอร์ทัล
            </Button>

            <Button
              variant='contained'
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenCreate}
              sx={{
                bgcolor: '#0D9488',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0b8a64', boxShadow: 'none' },
              }}
            >
              + สร้างเนื้อหาใหม่
            </Button>
          </Box>
        }
      />

      <ContentFilter
        search={search}
        onSearchChange={setSearch}
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 4, justifyContent: 'center' }}>
          <CircularProgress size={24} sx={{ color: '#0D9488' }} />
          <Typography color='text.secondary'>กำลังโหลดรายการเนื้อหา...</Typography>
        </Box>
      ) : items.length === 0 ? (
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
          <Typography variant='h6' sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
            ยังไม่พบเนื้อหาในหมวดหมู่นี้
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2.5 }}>
            ท่านสามารถเริ่มสร้างข่าวสาร ประกาศ หรือข้อปฏิบัติสำหรับการแสดงผลบนหน้า Portal ได้ทันที
          </Typography>
          <Button
            variant='contained'
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{ bgcolor: '#0D9488', textTransform: 'none', fontWeight: 700 }}
          >
            สร้างเนื้อหาแรก
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {items.map((item) => (
            <ContentCard
              key={item._id || item.objectUuId}
              item={item}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </Grid>
      )}

      <ContentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={mutate}
        item={editingItem}
      />

      <PortalHeaderModal
        open={headerModalOpen}
        onClose={() => setHeaderModalOpen(false)}
        onSuccess={mutateHeader}
        initialData={portalHeader}
      />
    </Box>
  )
}

export default function ContentPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 4, justifyContent: 'center' }}>
          <CircularProgress size={24} sx={{ color: '#0D9488' }} />
          <Typography color='text.secondary'>กำลังโหลดระบบจัดการเนื้อหา...</Typography>
        </Box>
      }
    >
      <ContentManagementContent />
    </Suspense>
  )
}
