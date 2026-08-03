'use client';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import {Box, List, ListItemButton, ListItemIcon, ListItemText, Typography} from '@mui/material';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

const navIcons = {
  dashboard: <DashboardRoundedIcon fontSize="small" />,
  personnel: <PeopleAltRoundedIcon fontSize="small" />,
  reports: <DescriptionRoundedIcon fontSize="small" />,
  settings: <SettingsRoundedIcon fontSize="small" />
};

type SidebarProps = {
  locale: string;
};

export function Sidebar({locale}: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const menuItems = [
    {key: 'dashboard', href: `/${locale}/dashboard`},
    {key: 'personnel', href: `/${locale}/personnel`},
    {key: 'reports', href: `/${locale}/reports`},
    {key: 'settings', href: `/${locale}/settings`}
  ];

  return (
    <Box
      sx={{
        width: 280,
        minHeight: '100vh',
        backgroundColor: '#1E2235',
        color: '#fff',
        px: 2,
        py: 3
      }}
    >
      <Box sx={{px: 1.5, pb: 3}}>
        <Typography variant="h6" fontWeight={700}>
          {t('brand')}
        </Typography>
      </Box>

      <List disablePadding>
        {menuItems.map((item) => {
          const active = pathname === item.href;
          return (
            <ListItemButton
              key={item.key}
              component={Link}
              href={item.href}
              sx={{
                borderRadius: 2,
                mb: 1,
                bgcolor: active ? '#14B8A6' : 'transparent',
                color: '#fff',
                '&:hover': {
                  bgcolor: active ? '#14B8A6' : 'rgba(255,255,255,0.08)'
                }
              }}
            >
              <ListItemIcon sx={{color: '#fff', minWidth: 36}}>{navIcons[item.key as keyof typeof navIcons]}</ListItemIcon>
              <ListItemText primary={t(`sidebar.${item.key}`)} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
