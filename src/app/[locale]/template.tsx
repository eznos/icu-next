// app/[locale]/template.tsx
import Box from '@mui/material/Box'
import React from 'react'

export default function Template({ children }: { children: React.ReactNode }) {
 return (
  <Box
   sx={
    {
     // 🌟 สร้างแอนิเมชัน Fade-in ด้วย CSS ล้วนๆ
     // animation: 'fadeIn 0.9s ease-in-out',
     // '@keyframes fadeIn': {
     //  '0%': {
     //   opacity: 0,
     //   transform: 'translateY(1px)', // เลื่อนขึ้นมานิดนึงให้ดูมีมิติ
     //   transition: 'background-color 1s ease-in-out, color 1s ease-in-out',
     //  },
     //  '100%': {
     //   opacity: 1,
     //   transform: 'translateY(0)',
     //   transition: 'background-color 1s ease-in-out, color 1s ease-in-out',
     //  },
     // },
    }
   }
  >
   {children}
  </Box>
 )
}
