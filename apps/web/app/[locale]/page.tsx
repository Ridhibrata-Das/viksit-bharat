import * as React from 'react';
import { setRequestLocale } from 'next-intl/server';
import LandingView from '@/components/landing/LandingView';
import { CitizenChatbot } from '@/components/chat/CitizenChatbot';
import { getLiveStore, buildDailyTallyMetrics } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export default async function LandingHomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  const store = getLiveStore();
  const dailyTally = buildDailyTallyMetrics();
  const deliveredCount = store.promises.filter((p: any) => p.status === 'DELIVERED').length || 16;

  return (
    <div className="min-h-screen bg-stone-50/60">
      <LandingView
        locale={locale}
        districtsCount={store.districts.length || 23}
        promisesCount={store.promises.length || 141}
        deliveredCount={deliveredCount}
        initialTally={dailyTally}
      />
      {/* Floating bilingual Sonar Bondhu AI Chatbot accessible across landing page */}
      <CitizenChatbot locale={locale} />
    </div>
  );
}
