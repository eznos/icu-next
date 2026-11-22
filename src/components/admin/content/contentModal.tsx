'use client'

import { ContentCategory, ContentItem, createContent, updateContent } from '@/apis/content'
import { useSnackBarNotification } from '@/hooks'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { FormContainer, SelectElement, SwitchElement, TextFieldElement, useForm } from 'react-hook-form-mui'

export interface ContentFormFields {
  title: string
  category: ContentCategory
  author: string
  ward: string
  summary: string
  content: string
  coverImage: string
  tags: string
  isPublished: boolean
  isPinned: boolean
}

const CATEGORY_OPTIONS = [
  { id: 'announcement', label: 'ประกาศ ICU (Announcement)' },
  { id: 'policy', label: 'ระเบียบและนโยบาย (Policy)' },
  { id: 'education', label: 'สุขศึกษาและคำแนะนำ (Education)' },
  { id: 'news', label: 'ข่าวสารกิจกรรม (News)' },
  { id: 'guideline', label: 'แนวทางปฏิบัติ (Guideline)' },
]

const DEFAULT_VALUES: ContentFormFields = {
  title: '',
  category: 'announcement',
  author: 'ศูนย์บริการผู้ป่วยวิกฤต (ICU)',
  ward: 'ALL',
  summary: '',
  content: '',
  coverImage: '',
  tags: 'ICU, ข้อมูลสำหรับญาติ, ความปลอดภัย',
  isPublished: true,
  isPinned: false,
}

interface ContentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  item?: ContentItem | null
}

export function ContentModal({ open, onClose, onSuccess, item }: ContentModalProps) {
  const { showSnackbar } = useSnackBarNotification()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContentFormFields>({
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          title: item.title,
          category: item.category,
          author: item.author || 'ศูนย์บริการผู้ป่วยวิกฤต (ICU)',
          ward: item.ward || 'ALL',
          summary: item.summary || '',
          content: item.content || '',
          coverImage: item.coverImage || '',
          tags: (item.tags || []).join(', '),
          isPublished: item.isPublished,
          isPinned: item.isPinned,
        })
      } else {
        form.reset(DEFAULT_VALUES)
      }
    }
  }, [open, item, form])

  const handleSubmit = async (values: ContentFormFields) => {
    if (!values.title.trim()) {
      showSnackbar('กรุณาระบุหัวข้อเนื้อหา', 'error')
      return
    }
    if (!values.content.trim()) {
      showSnackbar('กรุณากรอกรายละเอียดเนื้อหา', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const tagList = values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const payload = {
        title: values.title.trim(),
        category: values.category,
        author: values.author.trim(),
        ward: values.ward.trim() || 'ALL',
        summary: values.summary.trim(),
        content: values.content.trim(),
        coverImage: values.coverImage.trim(),
        tags: tagList,
        isPublished: values.isPublished,
        isPinned: values.isPinned,
      }

      const targetId = item?.objectUuId || item?._id
      if (targetId) {
        await updateContent(targetId, payload)
        showSnackbar('อัปเดตเนื้อหาเรียบร้อยแล้ว', 'success')
      } else {
        await createContent(payload)
        showSnackbar('สร้างเนื้อหาใหม่เรียบร้อยแล้ว', 'success')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      showSnackbar(err.message || 'เกิดข้อผิดพลาดในการบันทึกเนื้อหา', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: '18px', overflow: 'hidden' },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 2,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant='h6' sx={{ fontWeight: 800 }}>
          {item ? 'แก้ไขเนื้อหา (Edit Content)' : 'สร้างเนื้อหาใหม่ (Create Content)'}
        </Typography>
        <IconButton size='small' onClick={onClose}>
          <CloseRoundedIcon fontSize='small' />
        </IconButton>
      </DialogTitle>

      <FormContainer formContext={form} onSuccess={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <TextFieldElement
              name='title'
              required
              fullWidth
              label='หัวข้อข่าว / ประกาศ (Title)*'
              placeholder='เช่น ระเบียบการเข้าเยี่ยมผู้ป่วยวิกฤต ICU'
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectElement
                  name='category'
                  required
                  fullWidth
                  size='small'
                  label='หมวดหมู่เนื้อหา*'
                  options={CATEGORY_OPTIONS}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldElement
                  name='author'
                  fullWidth
                  size='small'
                  label='ผู้เขียน / หน่วยงานเจ้าของเรื่อง'
                />
              </Grid>
            </Grid>

            <TextFieldElement
              name='summary'
              fullWidth
              multiline
              rows={2}
              label='สรุปย่อ (Summary) สำหรับแสดงบนการ์ด'
              placeholder='เนื้อหาอย่างย่อเพื่อดึงดูดให้อ่านต่อ...'
            />

            <TextFieldElement
              name='content'
              required
              fullWidth
              multiline
              rows={8}
              label='รายละเอียดเนื้อหาฉบับเต็ม (Full Content)*'
              placeholder='กรอกเนื้อหา ข้อความ ประกาศ หรือคำแนะนำแบบละเอียด...'
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 7 }}>
                <TextFieldElement
                  name='coverImage'
                  fullWidth
                  size='small'
                  label='URL รูปภาพหน้าปก (Cover Image URL)'
                  placeholder='https://images.unsplash.com/photo-...'
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextFieldElement
                  name='tags'
                  fullWidth
                  size='small'
                  label='ป้ายกำกับ (Tags คั่นด้วยจุลภาค)'
                  placeholder='ICU, ความปลอดภัย, เยี่ยมไข้'
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <SwitchElement
                name='isPublished'
                label='เปิดเผยแพร่สาธารณะ (Publish immediately)'
                color='success'
              />

              <SwitchElement
                name='isPinned'
                label='ปักหมุดด้านบนสุด (Pin to Top)'
                color='warning'
              />
            </Box>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, px: 3, justifyContent: 'space-between' }}>
          <Button onClick={onClose} color='inherit' sx={{ textTransform: 'none' }}>
            ยกเลิก
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isSubmitting}
            sx={{
              bgcolor: '#0D9488',
              '&:hover': { bgcolor: '#0b8a64' },
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              borderRadius: '8px',
            }}
          >
            {isSubmitting ? <CircularProgress size={20} color='inherit' /> : 'บันทึกเนื้อหา'}
          </Button>
        </DialogActions>
      </FormContainer>
    </Dialog>
  )
}
