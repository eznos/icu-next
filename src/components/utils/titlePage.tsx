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
    alignItems: { xs: 'flex-start', sm: 'center' },
    justifyContent: actions ? 'space-between' : 'flex-start',
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 1.5,
    mb: 2,
    width: '100%',
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
