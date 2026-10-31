import * as React from 'react';
import { setRequestLocale } from 'next-intl/server';
import PromiseExplorer from '@/components/dashboard/PromiseExplorer';
import { getLiveStore } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export default async function PromisesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  const store = getLiveStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-3xl font-extrabold text-ink tracking-tight">
          {locale === 'bn' ? 'সকল নীতিগত প্রতিশ্রুতি ও অগ্রগতি' : 'State Policy Commitments & Progress'}
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          {locale === 'bn'
            ? 'পশ্চিমবঙ্গ সরকারের সকল নির্বাচনী ও নীতিগত প্রতিশ্রুতির সার্বক্ষণিক পর্যবেক্ষণ ও বাস্তবায়ন অগ্রগতি'
            : 'Comprehensive tracking of all 141 governmental commitments across 15 developmental sectors and 23 districts.'}
        </p>
      </div>
      <PromiseExplorer initialPromises={store.promises} />
    </div>
  );
}
