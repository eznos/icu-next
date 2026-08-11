// app/[locale]/loading.tsx
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export default function Loading() {
 return (
  <Box
   sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // ให้ความสูงเต็มหน้าจอ
    width: '100%',
    backgroundColor: 'background.default', // อิงสีพื้นหลังตามธีม Light/Dark
   }}
  >
   {/* 🌟 วงกลมหมุนๆ ของ MUI */}
   <CircularProgress color='primary' size={60} thickness={4} />
  </Box>
 )
}
