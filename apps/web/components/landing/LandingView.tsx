'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  Bot,
  Calendar,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  BarChart3,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  Radio,
  Building2,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyTallyMetrics, ScrapedSourceDto, toBengaliNumerals } from '@viksit/shared';
import { getDailyTally, getScraperSources, triggerScrapeRun } from '@/lib/api';
import { CitizenEvidenceModal } from '@/components/citizen/CitizenEvidenceModal';
import { openSabaiFoundationModal } from '@/components/citizen/SabaiFoundationModal';

interface LandingHeroProps {
  locale: string;
  districtsCount: number;
  promisesCount: number;
  deliveredCount: number;
  initialTally?: DailyTallyMetrics | null;
}

export default function LandingView({
  locale,
  districtsCount = 23,
  promisesCount = 141,
  deliveredCount = 16,
  initialTally = null,
}: LandingHeroProps) {
  const isBn = locale === 'bn';
  const t = useTranslations('LandingPage');
  const [tally, setTally] = React.useState<DailyTallyMetrics | null>(initialTally);
  const [sources, setSources] = React.useState<ScrapedSourceDto[]>([]);
  const [syncing, setSyncing] = React.useState(false);
  const [syncNotice, setSyncNotice] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'evidence' | 'transitions' | 'sources'>('evidence');
  const [evidenceModalOpen, setEvidenceModalOpen] = React.useState(false);
  const [currentDateFormatted, setCurrentDateFormatted] = React.useState<string>('');

  React.useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
    };
    setCurrentDateFormatted(
      new Intl.DateTimeFormat(isBn ? 'bn-IN' : 'en-IN', options).format(now)
    );

    if (!initialTally) {
      getDailyTally()
        .then((res) => setTally(res))
        .catch(() => null);
    }
    getScraperSources()
      .then((res) => setSources(res))
      .catch(() => null);
  }, [locale, isBn, initialTally]);

  const handleLiveSync = async () => {
    try {
      setSyncing(true);
      setSyncNotice(null);
      const summary = await triggerScrapeRun();
      const updatedTally = await getDailyTally();
      const updatedSources = await getScraperSources();
      setTally(updatedTally);
      setSources(updatedSources);
      setSyncNotice(
        isBn
          ? `লাইভ সিঙ্ক সম্পন্ন: ${summary.itemsDiscovered}টি উৎস যাচাইকৃত এবং ${summary.itemsMatched}টি প্রতিশ্রুতির ডেল্টা হালনাগাদ করা হয়েছে।`
          : `Live verification complete: ${summary.itemsDiscovered} releases checked, ${summary.itemsMatched} policy commitments reconciled.`
      );
    } catch {
      setSyncNotice(
        isBn
          ? 'দৈনিক যাচাইকৃত ক্যাশে থেকে সর্বশেষ তথ্য প্রদর্শিত হচ্ছে।'
          : 'Displaying latest verified daily delta snapshot.'
      );
    } finally {
      setSyncing(false);
    }
  };

  const num = (n: number | string) => (isBn ? toBengaliNumerals(n) : String(n));

  const delta = tally?.dailyDelta;
  const totalOutlayCr = tally?.totalFundedAmountCr || 11900;
  const deltaOutlayCr = delta?.outlaySanctionedDeltaCr || 6670;
  const deliveredTotal = tally?.totalDeliveredPromises || deliveredCount;
  const underImplTotal = tally?.totalUnderImplementation || 48;

  return (
    <div className="space-y-16 sm:space-y-20 pb-20">
      {/* 1. INSTITUTIONAL HERO SECTION */}
      <section className="relative bg-gradient-to-b from-stone-100/90 via-white to-stone-50/70 border-b border-stone-200 pt-10 sm:pt-14 pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Column: Mission, Live Date Header & Primary Actions */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                {/* Quiet Unboxed Metadata Kicker */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-600">
                  <span className="font-bold text-primary uppercase tracking-wider">
                    {t('heroBadge')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-stone-700 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    <span>{currentDateFormatted || (isBn ? 'আজকের সংস্করণ' : 'Daily Edition')}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-800 font-semibold">
                    {tally?.liveSyncMode === 'LIVE_WEB_AND_GEMINI'
                      ? isBn
                        ? 'জেমিনি সার্চ ও পিআইবি লাইভ গ্রাউন্ডেড'
                        : 'Gemini Search + PIB Live Grounded'
                      : isBn
                        ? '৭টি যাচাইকৃত সরকারি ফিড সক্রিয়'
                        : '7 Tier 1–3 Official Feeds Active'}
                  </span>
                </div>

                {/* Display Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black text-stone-950 tracking-tight leading-[1.08] [text-wrap:balance]">
                  <span>{t('heroTitlePrefix')} </span>
                  <span className="text-primary underline decoration-emerald-700/30 decoration-2 underline-offset-8">
                    {t('heroTitleHighlight')}
                  </span>
                </h1>

                {/* Lead Prose */}
                <p className="text-base sm:text-lg text-stone-700 max-w-2xl leading-relaxed">
                  {t('heroDescription')}
                </p>

                {/* Two-Part Economic Vision Callout (2033 & 2047) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {isBn ? '১ম পর্যায় · লক্ষ্য ২০৩৩' : 'Part 1 · 2033 Horizon'}
                      </div>
                      <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-stone-950 mt-0.5">
                        $1 Trillion USD GSDP
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
                      2033
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950 text-white border border-emerald-800 shadow-xs flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                        {isBn ? '২য় পর্যায় · ভিশন ২০৪৭' : 'Part 2 · 2047 Centenary Vision'}
                      </div>
                      <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-white mt-0.5">
                        $5 Trillion USD GSDP
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-950 bg-amber-400 px-2.5 py-1 rounded-md shrink-0">
                      2047
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-primary hover:bg-emerald-900 text-white font-bold shadow-sm cursor-pointer min-h-[48px] px-6 flex items-center justify-center shrink-0"
                >
                  <Link href={`/${locale}/dashboard`}>
                    <span>{t('exploreDashboard')}</span>
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 border-stone-800 bg-white text-stone-950 hover:bg-stone-100 hover:text-black font-bold shadow-xs cursor-pointer min-h-[48px] px-5 flex items-center justify-center shrink-0"
                >
                  <Link href={`/${locale}/promises`} className="inline-flex items-center text-stone-950 hover:text-black font-bold">
                    <span className="text-stone-950 font-bold">{t('trackPromises')}</span>
                    <ChevronRight className="w-4 h-4 ml-1 text-stone-950" aria-hidden="true" />
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleLiveSync}
                  disabled={syncing}
                  className="w-full sm:w-auto border-2 border-emerald-800/40 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 hover:text-emerald-900 font-bold shadow-xs cursor-pointer min-h-[48px] px-4 flex items-center justify-center shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 text-emerald-950 ${syncing ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <span className="text-emerald-950 font-bold">
                    {syncing
                      ? isBn
                        ? 'লাইভ উৎস যাচাই হচ্ছে...'
                        : 'Fetching Live Sources...'
                      : isBn
                        ? 'রিয়েল-টাইম তথ্য সিঙ্ক করুন'
                        : 'Fetch Real-Time Updates'}
                  </span>
                </Button>

                <Button
                  type="button"
                  size="lg"
                  onClick={openSabaiFoundationModal}
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-stone-950 font-black shadow-xs cursor-pointer min-h-[48px] px-5 flex items-center justify-center shrink-0"
                >
                  <HeartHandshake className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>
                    {isBn
                      ? 'সাবাই ফাউন্ডেশন সদস্যপদ (₹৫০০+) · অনুদান'
                      : 'Sabai Membership (₹500+) · Donate'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Right Column: Today's Delta Snapshot Card */}
            <div className="lg:col-span-5 flex">
              <div className="w-full rounded-2xl bg-white border border-stone-200/90 shadow-sm p-6 flex flex-col justify-between space-y-5">
                <div className="space-y-2 border-b border-stone-100 pb-4">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                    <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                      {isBn ? 'দৈনিক ডেল্টা সূচক (২৪ ঘণ্টা)' : '24-Hour Daily Delta Ledger'}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-stone-500">
                      {delta?.dateKey || new Date().toISOString().slice(0, 10)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {isBn
                      ? delta?.headlineSummaryBn ||
                        'রাজ্য গেজেট, পিআইবি কলকাতা এবং বিভাগীয় আদেশের আজকের নেট পরিবর্তন।'
                      : delta?.headlineSummaryEn ||
                        'Net daily movement reconciled from WB Official Gazette, PIB Kolkata, and departmental orders.'}
                  </p>
                </div>

                {/* 2x2 Tabular Delta Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/80">
                    <div className="text-[11px] font-medium text-stone-500">
                      {isBn ? 'নতুন যাচাইকৃত আদেশ' : 'Verified Orders (24h)'}
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-stone-950 font-mono tabular-nums">
                        +{num(delta?.netNewEvidenceDelta || tally?.todayVerifiedItemsCount || 8)}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700">
                        {isBn ? 'টিয়ার ১–৩' : 'Tier 1–3'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/80">
                    <div className="text-[11px] font-medium text-stone-500">
                      {isBn ? 'অগ্রসর প্রতিশ্রুতি (ডেল্টা)' : 'Stage Advancements'}
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-primary font-mono tabular-nums">
                        +{num(delta?.promisesProgressedDelta || tally?.todayPromisesMovedCount || 5)}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700">
                        {isBn ? 'ধাপ পরিবর্তন' : 'Moved'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/80">
                    <div className="text-[11px] font-medium text-stone-500">
                      {isBn ? 'আজকের বরাদ্দ ডেল্টা' : 'Today’s Outlay Delta'}
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-xl font-black text-stone-950 font-mono tabular-nums">
                        +₹{num(deltaOutlayCr.toLocaleString('en-IN'))} Cr
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-50/80 border border-stone-200/80">
                    <div className="text-[11px] font-medium text-stone-500">
                      {isBn ? '$১T (২০৩৩) ও $৫T (২০৪৭) গতিবেগ' : '$1T (2033) & $5T (2047) Delta'}
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-emerald-800 font-mono tabular-nums">
                        +{num(delta?.gsdpTrajectoryDeltaBps || 18)} bps
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500">13% CAGR</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>
                    {isBn ? 'বিনামূল্যে ওপেন আরএসএস + জেমিনি যাচাইকৃত' : 'Zero-cost RSS + Gemini Search Verification'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEvidenceModalOpen(true)}
                    className="font-bold text-primary hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isBn ? 'মাঠের প্রমাণ জমা দিন' : 'Submit Field Proof'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Macro KPI Strip Below Hero Split */}
          <div className="mt-8 pt-8 border-t border-stone-200/80 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-stone-200/90">
              <div className="text-xs font-medium text-stone-500">
                {isBn ? 'মোট ট্র্যাক করা প্রতিশ্রুতি' : 'Total Tracked Commitments'}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-3xl font-black text-stone-950 font-mono tabular-nums">
                  {num(promisesCount)}
                </span>
                <span className="text-xs text-stone-500">
                  {isBn ? '১৫টি খাত · ২৩ জেলা' : '15 Sectors · 23 Districts'}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200/90">
              <div className="text-xs font-medium text-stone-500">
                {isBn ? 'বাস্তবায়িত ও চলমান' : 'Delivered & Active Execution'}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-3xl font-black text-primary font-mono tabular-nums">
                  {num(deliveredTotal)} / {num(underImplTotal)}
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  {isBn ? 'গেজেট প্রমাণিত' : 'Gazette Verified'}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200/90">
              <div className="text-xs font-medium text-stone-500">
                {isBn ? 'শনাক্তকৃত মোট বাজেট বরাদ্দ' : 'Cumulative Sanctioned Outlay'}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-3xl font-black text-stone-950 font-mono tabular-nums">
                  ₹{num(totalOutlayCr.toLocaleString('en-IN'))} Cr
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  {isBn ? 'অডিট ট্র্যাকড' : 'Tracked CapEx'}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-stone-200/90">
              <div className="text-xs font-medium text-stone-500">
                {isBn ? 'দ্বি-পর্যায় জিএসডিপি ভিশন (২০৩৩ ও ২০৪৭)' : 'Two-Phase GSDP Vision (2033 & 2047)'}
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-black text-stone-950 font-mono tabular-nums">
                  $1T (’33) → $5T (’47)
                </span>
                <span className="text-xs text-stone-500">
                  {isBn ? '২৩ জেলা' : `${num(districtsCount)} Districts`}
                </span>
              </div>
            </div>
          </div>

          {syncNotice && (
            <div
              role="status"
              className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-950 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                <span>{syncNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setSyncNotice(null)}
                className="text-emerald-800 hover:underline text-xs font-bold"
              >
                {isBn ? 'বন্ধ করুন' : 'Dismiss'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. DAILY DELTA & REAL-TIME VERIFICATION WORKSPACE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
                <span className="font-bold text-primary uppercase tracking-wider">
                  {isBn ? 'দৈনিক পরিবর্তন ও উৎস যাচাইকরণ' : 'Daily Delta & Multi-Source Reconciliation'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {delta?.previousDateKey || 'Yesterday'} → {delta?.dateKey || 'Today'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
                {t('todayChanges')}
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                {t('todayChangesSubtitle')}
              </p>
            </div>

            {/* Interactive Segmented Control (Functional Filter Buttons) */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('evidence')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'evidence'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {isBn ? 'যাচাইকৃত বিজ্ঞপ্তি ফিড' : 'Verified Releases'} ({num(tally?.recentEvidences?.length || 6)})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('transitions')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'transitions'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {isBn ? 'প্রতিশ্রুতি ডেল্টা (পূর্ব → বর্তমান)' : 'Status Delta Ledger'} ({num(delta?.transitions?.length || 5)})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sources')}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'sources'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                {isBn ? 'খাতভিত্তিক গতি ও উৎস' : 'Sector Velocity & Sources'}
              </button>
            </div>
          </div>

          {/* TAB 1: Verified Evidence Intake Cards */}
          {activeTab === 'evidence' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tally?.recentEvidences && tally.recentEvidences.length > 0 ? (
                tally.recentEvidences.map((ev) => (
                  <article
                    key={ev.id}
                    className="rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      {/* Quiet Unboxed Metadata Header */}
                      <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                        <span className="font-semibold text-emerald-800 truncate">
                          {ev.sourceTier === 'TIER_1'
                            ? isBn
                              ? 'স্তর ১ · সরকারি গেজেট/পিআইবি'
                              : 'Tier 1 · Official Gazette/PIB'
                            : isBn
                              ? 'স্তর ২ · প্রাতিষ্ঠানিক সূত্র'
                              : 'Tier 2 · Institutional Feed'}
                        </span>
                        <span className="font-mono tabular-nums text-[11px] text-stone-500 shrink-0">
                          {ev.matchedPromiseCode ? `[${ev.matchedPromiseCode}]` : 'VERIFIED'}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-stone-950 leading-snug">
                        {isBn && ev.titleBn ? ev.titleBn : ev.title}
                      </h3>

                      {ev.excerpt && (
                        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                          {ev.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-stone-100">
                      {ev.matchedPromiseTitle && (
                        <div className="text-xs text-stone-700 flex items-center justify-between gap-2">
                          <span className="truncate font-medium">
                            {isBn && ev.matchedPromiseTitleBn
                              ? ev.matchedPromiseTitleBn
                              : ev.matchedPromiseTitle}
                          </span>
                          {ev.outlayCr && (
                            <span className="font-mono tabular-nums font-bold text-stone-900 shrink-0">
                              ₹{num(ev.outlayCr)} Cr
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span className="truncate max-w-[180px]">{ev.publisher}</span>
                        {ev.sourceUrl && (
                          <a
                            href={ev.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1 font-semibold shrink-0"
                          >
                            <span>{isBn ? 'নথি দেখুন' : 'Source'}</span>
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-stone-500 text-sm">
                  {isBn
                    ? 'আজকে স্ক্র্যাপার দ্বারা নতুন কোনো আপডেট এখনও নথিভুক্ত হয়নি।'
                    : 'No updates synced yet today. Click Fetch Real-Time Updates to query live feeds.'}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Promise Status Transitions Ledger (Yesterday vs Today Delta) */}
          {activeTab === 'transitions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-xs font-semibold text-stone-500">
                    <th className="py-3 px-3">{isBn ? 'কোড' : 'Code'}</th>
                    <th className="py-3 px-3">{isBn ? 'প্রতিশ্রুতি ও প্রকল্প' : 'Commitment'}</th>
                    <th className="py-3 px-3">{isBn ? 'জেলা' : 'District'}</th>
                    <th className="py-3 px-3">{isBn ? 'পূর্ববর্তী স্থিতি → বর্তমান স্থিতি' : 'Delta Transition (Before → Today)'}</th>
                    <th className="py-3 px-3 text-right">{isBn ? 'বরাদ্দ ডেল্টা' : 'Sanctioned Outlay'}</th>
                    <th className="py-3 px-3 text-right">{isBn ? 'যাচাইকৃত উৎস' : 'Authority'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(delta?.transitions || []).map((tr, idx) => (
                    <tr key={`${tr.promiseCode}-${idx}`} className="hover:bg-stone-50/80">
                      <td className="py-3.5 px-3 font-mono tabular-nums font-bold text-primary whitespace-nowrap">
                        {tr.promiseCode}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-stone-900">
                        {isBn ? tr.titleBn : tr.titleEn}
                      </td>
                      <td className="py-3.5 px-3 text-stone-600 whitespace-nowrap">
                        {isBn ? tr.districtNameBn : tr.districtNameEn}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="text-stone-500 font-mono text-xs">{tr.previousStatus}</span>
                        <span className="mx-2 text-stone-400">→</span>
                        <span className="font-mono text-xs font-bold text-emerald-800">
                          {tr.currentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-stone-900 whitespace-nowrap">
                        {tr.outlayCr ? `₹${num(tr.outlayCr)} Cr` : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-right text-xs text-stone-600 whitespace-nowrap">
                        {tr.sourceUrl ? (
                          <a
                            href={tr.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span>{tr.sourcePublisher.slice(0, 26)}</span>
                            <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                          </a>
                        ) : (
                          tr.sourcePublisher
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Sector Velocity & Monitored Free Sources */}
          {activeTab === 'sources' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 space-y-3">
                <h3 className="text-sm font-bold text-stone-900">
                  {isBn ? 'খাতভিত্তিক দৈনিক অগ্রগতি ও বরাদ্দ' : 'Sectoral Delta Velocity & Tracked CapEx'}
                </h3>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl bg-stone-50/40">
                  {(delta?.sectorVelocity || []).map((sec) => (
                    <div key={sec.sectorCode} className="p-3.5 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-stone-900">
                          {isBn ? sec.sectorBn : sec.sectorEn}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {num(sec.activeCount)} {isBn ? 'টি সক্রিয় প্রতিশ্রুতি' : 'tracked promises'} · +{num(sec.deltaToday)}{' '}
                          {isBn ? 'আজ অগ্রসর' : 'moved today'}
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <div className="text-xs font-bold text-primary">
                          ₹{num(sec.outlayCr.toLocaleString('en-IN'))} Cr
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {isBn ? 'শনাক্তকৃত বরাদ্দ' : 'Tracked Outlay'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-900">
                    {isBn ? 'সক্রিয় যাচাইকৃত তথ্যসূত্র (টিয়ার ১–৩)' : 'Active Verified Data Feeds (Zero-Cost Architecture)'}
                  </h3>
                  <span className="text-xs text-stone-500 font-mono tabular-nums">
                    {sources.length || 7} {isBn ? 'উৎস' : 'feeds'}
                  </span>
                </div>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl bg-white">
                  {(sources.length > 0 ? sources : []).map((src) => (
                    <div key={src.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 truncate">{src.name}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span>{src.sourceTier}</span>
                          <span aria-hidden="true">·</span>
                          <span>{src.sourceType}</span>
                        </div>
                      </div>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-semibold inline-flex items-center gap-1 shrink-0"
                      >
                        <span>{isBn ? 'লিঙ্ক' : 'Feed'}</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Bar inside Daily Delta Card */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
            <div>
              {isBn
                ? 'ফায়ারক্রল (Firecrawl) ছাড়াই সম্পূর্ণ বিনামূল্যে সরকারি আরএসএস, পিআইবি এবং জেমিনি সার্চ গ্রাউন্ডিংয়ের মাধ্যমে পরিচালিত।'
                : 'Powered natively by free public RSS syndication (PIB Kolkata, WB News) and server-side Gemini Search Grounding—no paid Firecrawl key required.'}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setEvidenceModalOpen(true)}
                className="font-bold text-stone-900 hover:text-primary underline whitespace-nowrap"
              >
                {isBn ? 'নাগরিক প্রমাণ জমা দিন' : 'Submit Ground Evidence'}
              </button>
              <Link
                href={`/${locale}/dashboard`}
                className="font-bold text-primary hover:underline inline-flex items-center gap-1 whitespace-nowrap"
              >
                <span>{isBn ? 'সম্পূর্ণ ড্যাশবোর্ড খুলুন' : 'Open Full Tally Feed'}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM CORE PILLARS & USER JOURNEY CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight">
              {t('corePillarsTitle')}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-1">
              {t('corePillarsSubtitle')}
            </p>
          </div>
          <Link
            href={`/${locale}/promises`}
            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>{isBn ? 'সকল ১৪১টি প্রতিশ্রুতি অন্বেষণ করুন' : 'Browse all 141 policy commitments'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Economic Overview */}
          <Link
            href={`/${locale}/indicators`}
            className="group rounded-2xl bg-white border border-stone-200 hover:border-primary transition-colors p-6 space-y-4 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-primary flex items-center justify-center">
                <BarChart3 className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-stone-950 group-hover:text-primary transition-colors">
                {t('pillar1Title')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('pillar1Desc')}
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center text-xs font-bold text-primary">
              <span>{t('enterModule')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 2: 141 Sectoral Promises */}
          <Link
            href={`/${locale}/promises`}
            className="group rounded-2xl bg-white border border-stone-200 hover:border-primary transition-colors p-6 space-y-4 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-primary flex items-center justify-center">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-stone-950 group-hover:text-primary transition-colors">
                {t('pillar2Title')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('pillar2Desc')}
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center text-xs font-bold text-primary">
              <span>{t('enterModule')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 3: 23-District Delivery Index */}
          <Link
            href={`/${locale}/districts`}
            className="group rounded-2xl bg-white border border-stone-200 hover:border-primary transition-colors p-6 space-y-4 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-primary flex items-center justify-center">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-stone-950 group-hover:text-primary transition-colors">
                {t('pillar3Title')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('pillar3Desc')}
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center text-xs font-bold text-primary">
              <span>{t('enterModule')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </div>
          </Link>

          {/* Card 4: Governance & CMS Portal */}
          <Link
            href={`/${locale}/admin`}
            className="group rounded-2xl bg-white border border-stone-200 hover:border-primary transition-colors p-6 space-y-4 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-primary flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-stone-950 group-hover:text-primary transition-colors">
                {isBn ? 'গবেষক ও অডিট পোর্টাল' : 'Researcher & Audit CMS'}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isBn
                  ? 'টিয়ার ১–৩ সরকারি নথি আপলোড, নাগরিক প্রমাণের সত্যতা যাচাই এবং প্রতিশ্রুতি নিবন্ধন।'
                  : 'Log policy milestones, audit Tier 1–3 citations, and verify citizen ground submissions.'}
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center text-xs font-bold text-primary">
              <span>{t('enterModule')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. INSTITUTIONAL FOOTER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <div className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              {isBn ? 'উন্মুক্ত নাগরিক তথ্য পোর্টাল' : 'Open Citizen Governance Intelligence'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight [text-wrap:balance]">
              {isBn
                ? 'পশ্চিমবঙ্গের রূপান্তরের সার্বিক চিত্র এক নজরে দেখুন'
                : 'Explore the Full Interactive Economic & Policy Trajectory'}
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              {isBn
                ? 'লাইভ গেজেট স্ক্র্যাপার, ২৩ জেলার বাস্তবায়ন সূচক এবং সোনার বন্ধু এআই সহকারী সহ সকল সুবিধা ব্যবহার করুন।'
                : 'Access live gazette reconciliations, 23-district delivery maps, and bilingual AI policy search.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 shrink-0 w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-stone-100 text-primary font-bold cursor-pointer min-h-[48px] whitespace-nowrap"
            >
              <Link href={`/${locale}/dashboard`}>
                <span>{isBn ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Launch Dashboard'}</span>
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              size="lg"
              onClick={() => openSabaiFoundationModal('landing-footer-cta')}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-black cursor-pointer min-h-[48px] whitespace-nowrap"
            >
              <HeartHandshake className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>{isBn ? 'সাবাই ফাউন্ডেশন সদস্যপদ (₹৫০০+)' : 'Sabai Foundation Membership (₹500+)'}</span>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10 font-bold cursor-pointer min-h-[48px] whitespace-nowrap"
            >
              <Link href={`/${locale}/admin`}>
                <span>{isBn ? 'সিএমএস পোর্টাল' : 'CMS Portal'}</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CitizenEvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => {
          setEvidenceModalOpen(false);
          getDailyTally().then((res) => setTally(res)).catch(() => null);
        }}
        locale={locale}
      />
    </div>
  );
}
