import { Box, Typography } from '@mui/material'

type TitlePageProps = {
 title: string | React.ReactNode
 actions?: React.ReactNode
}

export const TitlePage = ({ title, actions }: TitlePageProps) => {
 return (
  <Box
   sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: actions ? 'space-between' : 'flex-start',
    mb: 2,
   }}
  >
   {typeof title === 'string' ? (
    <Typography variant='h5' component='h1'>
     {title}
    </Typography>
   ) : (
    title
   )}

   {actions && <Box>{actions}</Box>}
  </Box>
 )
}
