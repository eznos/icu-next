import type {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {AppProviders} from '@/components/providers/app-providers';
import {routing} from '@/i18n/routing';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({children, params}: LocaleLayoutProps) {
  const {locale} = await params;

  if (!routing.locales.includes(locale as 'en' | 'th')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppProviders>{children}</AppProviders>
    </NextIntlClientProvider>
  );
}
