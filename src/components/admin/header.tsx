'use client';

import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import {Box, Stack, Typography} from '@mui/material';
import {useTranslations} from 'next-intl';
import {useEffect, useState} from 'react';
import {ThemeModeSwitch} from '@/components/theme/theme-mode-switch';

export function HeaderBar() {
  const t = useTranslations();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 3,
        py: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <CircleRoundedIcon sx={{color: '#22C55E', fontSize: 14}} />
        <Typography variant="body2" fontWeight={600}>
          {t('online')}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {now.toLocaleString()}
        </Typography>
        <ThemeModeSwitch />
      </Stack>
    </Box>
  );
}
