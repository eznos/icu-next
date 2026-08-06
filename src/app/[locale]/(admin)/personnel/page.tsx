'use client' // 🌟 แก้ไขบรรทัดนี้ให้ถูกต้อง

import { fetchMovieListList } from '@/lib/movies/api'
import { Typography } from '@mui/material'
import useSWR from 'swr'

export default function PersonnelPage() {
 const { data } = useSWR('movies', fetchMovieListList, {})
 console.log(data)

 return <Typography variant='h5'>Personnel</Typography>
}
