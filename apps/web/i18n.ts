import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'bn'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ locale, requestLocale }: any) => {
  const resolvedLocale = locale || (requestLocale ? await requestLocale : defaultLocale);
  if (!locales.includes(resolvedLocale as Locale)) {
    notFound();
  }

  return {
    locale: resolvedLocale,
    messages: (await import(`./i18n/messages/${resolvedLocale}.json`)).default,
  };
});

