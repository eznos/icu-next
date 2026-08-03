import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({locale}) => {
  const checkedLocale = routing.locales.includes(locale as 'en' | 'th') ? locale : routing.defaultLocale;

  return {
    locale: checkedLocale,
    messages: (await import(`../../messages/${checkedLocale}.json`)).default
  };
});
