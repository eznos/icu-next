import type {ReactNode} from 'react';
import {Box} from '@mui/material';
import {HeaderBar} from '@/components/admin/header';
import {Sidebar} from '@/components/admin/sidebar';

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export default async function AdminLayout({children, params}: AdminLayoutProps) {
  const {locale} = await params;

  return (
    <Box sx={{display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6'}}>
      <Sidebar locale={locale} />
      <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
        <HeaderBar />
        <Box component="main" sx={{p: 3, flexGrow: 1}}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
