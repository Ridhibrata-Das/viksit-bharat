import * as React from 'react';
import { setRequestLocale } from 'next-intl/server';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { getLiveStore, buildLiveAnalyticsSummary } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  const store = getLiveStore();
  const initialAnalytics = buildLiveAnalyticsSummary();

  return (
    <div className="min-h-screen bg-stone-50/60 pb-16">
      <DashboardClient
        locale={locale}
        districts={store.districts}
        promises={store.promises}
        indicators={store.indicators}
        initialAnalytics={initialAnalytics}
      />
    </div>
  );
}

