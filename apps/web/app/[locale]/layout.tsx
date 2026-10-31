import '@/globals.css';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SabaiFoundationModal } from '@/components/citizen/SabaiFoundationModal';
import { AuthProvider } from '@/components/auth/AuthContext';
import { locales, type Locale } from '@/i18n';
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A5C36',
};

export const metadata: Metadata = {
  title: 'Viksit Bengal Dashboard',
  description:
    'West Bengal Governance, Policy Commitments, and $1 Trillion Economic Progress Tracker across 23 districts.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Viksit Bengal',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Viksit Bengal Dashboard',
    description:
      'West Bengal Governance, Policy Commitments, and $1 Trillion Economic Progress Tracker across 23 districts.',
  },
};

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const skipText = locale === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to content';

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-lightBg text-ink flex flex-col min-h-screen antialiased"
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider locale={locale}>
            {/* High-visibility skip-to-content navigation link for keyboard accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary focus:font-bold focus:rounded-md focus:shadow-2xl focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {skipText}
            </a>
            <Header />
            <main
              id="main-content"
              role="main"
              tabIndex={-1}
              className="flex-1 outline-none"
            >
              {children}
            </main>
            <Footer />
            <SabaiFoundationModal locale={locale} enableGlobalTrigger={true} />
            <PwaInstallPrompt locale={locale} />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
