import * as React from 'react';
import { setRequestLocale } from 'next-intl/server';
import DistrictMap from '@/components/dashboard/DistrictMap';
import { DistrictLeaderboard } from '@/components/dashboard/DistrictLeaderboard';
import { getLiveStore } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export default async function DistrictsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  const store = getLiveStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">
          {locale === 'bn' ? 'পশ্চিমবঙ্গের ২৩টি জেলার রূপরেখা' : 'West Bengal 23 Districts Performance'}
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          {locale === 'bn'
            ? 'প্রতিটি জেলার অর্থনৈতিক অবদান, প্রতিশ্রুতি বাস্তবায়ন এবং ভৌগোলিক সূচক'
            : 'Explore regional indicators, economic contributions, and active projects across all 23 districts.'}
        </p>
      </div>
      <DistrictMap districts={store.districts} />
      <DistrictLeaderboard locale={locale} />
    </div>
  );
}
