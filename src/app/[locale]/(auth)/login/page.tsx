'use client';

import {Box, Button, Card, CardContent, Stack, TextField, Typography} from '@mui/material';
import {useTranslations} from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('login');

  return (
    <Box sx={{minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2}}>
      <Card sx={{width: '100%', maxWidth: 420}}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={700}>
              {t('title')}
            </Typography>
            <TextField label={t('username')} fullWidth />
            <TextField label={t('password')} type="password" fullWidth />
            <Button variant="contained" size="large" fullWidth>
              {t('submit')}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
