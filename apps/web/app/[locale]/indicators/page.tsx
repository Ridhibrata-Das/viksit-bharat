import * as React from 'react';
import { setRequestLocale } from 'next-intl/server';
import HeroTargetCard from '@/components/dashboard/HeroTargetCard';
import EconomicOverview from '@/components/dashboard/EconomicOverview';
import { RealtimeAnalyticsHub } from '@/components/dashboard/RealtimeAnalyticsHub';
import { buildLiveAnalyticsSummary } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export default async function IndicatorsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const initialAnalytics = buildLiveAnalyticsSummary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-3xl font-extrabold text-ink">
          {locale === 'bn'
            ? 'দ্বি-পর্যায়ের জিএসডিপি লক্ষ্যমাত্রা (২০৩৩: ₹৮৫ লক্ষ কোটি | ২০৪৭: ₹৪২৫ লক্ষ কোটি)'
            : 'Two-Phase GSDP Vision (2033: ₹85 Lakh Cr | 2047: ₹425 Lakh Cr) & Economic Indicators'}
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          {locale === 'bn'
            ? 'পশ্চিমবঙ্গের জিএসডিপি বৃদ্ধি, শিল্পায়ন, রফতানি ও কর্মসংস্থানের সার্বিক রূপরেখা ও রিয়েল-টাইম গ্রাফ (টাকার অঙ্কে)'
            : 'Real-time econometric models in Indian Rupee (₹) terms, two-phase GSDP milestones (2033 & 2047), sectoral capex outlays, and regional growth charts.'}
        </p>
      </div>

      <HeroTargetCard />
      <RealtimeAnalyticsHub locale={locale} initialAnalytics={initialAnalytics} variant="dashboard" />
      <EconomicOverview />
    </div>
  );
}
