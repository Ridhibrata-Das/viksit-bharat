'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Database,
  DollarSign,
  FileCheck2,
  Layers,
  MapPin,
  PieChart as PieChartIcon,
  Radio,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { LiveAnalyticsSummary, toBengaliNumerals } from '@viksit/shared';
import { getLiveAnalytics, triggerScrapeRun } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RealtimeAnalyticsHubProps {
  locale?: string;
  initialAnalytics?: LiveAnalyticsSummary | null;
  variant?: 'dashboard' | 'cms';
  onDataRefreshed?: (analytics: LiveAnalyticsSummary) => void;
}

const CHART_COLORS = {
  primary: '#0A5C36',
  emerald: '#10B981',
  teal: '#0D9488',
  blue: '#2563EB',
  amber: '#D97706',
  purple: '#7C3AED',
  rose: '#E11D48',
  slate: '#64748B',
};

const TIER_COLORS = ['#0A5C36', '#2563EB', '#D97706', '#7C3AED', '#0D9488'];

export function RealtimeAnalyticsHub({
  locale = 'en',
  initialAnalytics = null,
  variant = 'dashboard',
  onDataRefreshed,
}: RealtimeAnalyticsHubProps) {
  const isBn = locale === 'bn';
  const [analytics, setAnalytics] = React.useState<LiveAnalyticsSummary | null>(initialAnalytics);
  const [loading, setLoading] = React.useState(!initialAnalytics);
  const [syncing, setSyncing] = React.useState(false);
  const [autoPoll, setAutoPoll] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<
    'all' | 'macro' | 'sectors' | 'verification' | 'regional'
  >('all');

  const fmt = React.useCallback(
    (val: number | string) => (isBn ? toBengaliNumerals(val) : String(val)),
    [isBn]
  );

  const fmtInr = React.useCallback(
    (val: number) => {
      const formatted = val.toLocaleString('en-IN');
      return isBn ? toBengaliNumerals(formatted) : formatted;
    },
    [isBn]
  );

  const fetchLatestAnalytics = React.useCallback(async () => {
    try {
      const data = await getLiveAnalytics();
      setAnalytics(data);
      onDataRefreshed?.(data);
    } catch (err) {
      console.error('Failed to load live analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [onDataRefreshed]);

  React.useEffect(() => {
    fetchLatestAnalytics();
  }, [fetchLatestAnalytics]);

  React.useEffect(() => {
    if (!autoPoll) return;
    const timer = setInterval(() => {
      fetchLatestAnalytics();
    }, 15000);
    return () => clearInterval(timer);
  }, [autoPoll, fetchLatestAnalytics]);

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      await triggerScrapeRun();
      await fetchLatestAnalytics();
    } catch {
      await fetchLatestAnalytics();
    } finally {
      setSyncing(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="p-8 rounded-2xl border border-stone-200 bg-white shadow-xs animate-pulse space-y-4">
        <div className="h-6 w-72 bg-stone-200 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-stone-100 rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-stone-100 rounded-xl" />
      </div>
    );
  }

  if (!analytics) return null;

  const {
    overview,
    gsdpTrajectorySeries,
    sectorAnalytics,
    dailyIngestionSeries,
    evidenceTierBreakdown,
    regionalZoneAnalytics,
    districtMatrix,
  } = analytics;

  const topSectorsForChart = sectorAnalytics.slice(0, 10).map((s) => ({
    ...s,
    label: isBn ? s.shortBn : s.shortEn,
  }));

  const statusPieData = evidenceTierBreakdown.byStatus.map((st) => ({
    name: isBn ? st.labelBn : st.labelEn,
    value: st.count,
    sharePct: st.sharePct,
  }));

  const tierPieData = evidenceTierBreakdown.byTier.map((t) => ({
    name: isBn ? t.labelBn : t.labelEn,
    value: t.count,
    outlayCr: t.outlayCr,
    avgConfidencePct: t.avgConfidencePct,
    sharePct: t.sharePct,
  }));

  return (
    <section
      aria-label={
        isBn
          ? 'রিয়েল-টাইম ডেটা বিশ্লেষণ, চার্ট এবং পরিসংখ্যান কেন্দ্র'
          : 'Real-Time Governance Telemetry, Charts & Statistical Analysis'
      }
      className="space-y-6"
    >
      {/* Top Command & Telemetry Header Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isBn ? 'লাইভ ইকোনমেট্রিক ও গভর্ন্যান্স ইঞ্জিন' : 'LIVE TELEMETRY & ECONOMETRIC ENGINE'}
              </span>
              <Badge variant="outline" className="text-[11px] font-mono border-stone-300 text-stone-700">
                {analytics.liveSyncMode}
              </Badge>
              <span className="text-xs text-stone-500 font-mono">
                {isBn ? 'সর্বশেষ সিঙ্ক:' : 'Synced:'}{' '}
                {new Date(analytics.lastSyncedAt).toLocaleTimeString(isBn ? 'bn-IN' : 'en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-primary shrink-0" />
              {variant === 'cms'
                ? isBn
                  ? 'সিএমএস রিয়েল-টাইম ডেটা অ্যানালিটিক্স, গ্রাফ ও আর্থিক সূচক'
                  : 'CMS Real-Time Data Analytics, Visual Charts & Financial Figures'
                : isBn
                  ? 'রিয়েল-টাইম সামষ্টিক অর্থনীতি ও প্রতিশ্রুতি বিশ্লেষণ ড্যাশবোর্ড'
                  : 'Real-Time Macroeconomic & Policy Execution Visual Intelligence'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl">
              {isBn
                ? '১৪১টি সরকারি প্রতিশ্রুতি, ১৫টি খাত, ২৩টি জেলা এবং যাচাইকৃত গেজেট/পিআইবি নথির তাৎক্ষণিক সংখ্যাগত ও গ্রাফিক্যাল বিশ্লেষণ।'
                : 'Live quantitative synthesis across 141 policy commitments, 15 developmental sectors, 23 districts, and verified Gazette/PIB financial sanctions.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setAutoPoll((prev) => !prev)}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                autoPoll
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-stone-100 border-stone-300 text-stone-600'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoPoll ? 'text-primary animate-pulse' : 'text-stone-400'}`} />
              <span>
                {isBn
                  ? `অটো-পোলিং: ${autoPoll ? 'চালু (১৫ সে.)' : 'বন্ধ'}`
                  : `Live Stream: ${autoPoll ? 'ON (15s)' : 'PAUSED'}`}
              </span>
            </button>

            <Button
              type="button"
              size="sm"
              onClick={handleManualSync}
              disabled={syncing}
              className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>
                {syncing
                  ? isBn
                    ? 'সিঙ্ক হচ্ছে...'
                    : 'Syncing Live Feeds...'
                  : isBn
                    ? 'লাইভ ডেটা রিফ্রেশ'
                    : 'Sync Live Sources & Recalculate'}
              </span>
            </Button>
          </div>
        </div>

        {/* 8-Card High-Density Numerical Figures Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 pt-5">
          {/* KPI 1: Realized GSDP in Rupee terms */}
          <div className="p-3.5 rounded-xl bg-emerald-950 text-white border border-emerald-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
              <span>{isBn ? 'জিএসডিপি (₹ লক্ষ কোটি)' : 'LIVE GSDP (₹ INR)'}</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-white">
                ₹{fmt(overview.currentGsdpInrLakhCr)}L Cr
              </div>
              <div className="text-[11px] font-mono text-emerald-200">
                {isBn ? '২০৩৩: ₹৮৫L Cr | ২০৪৭: ₹৪২৫L Cr' : '2033: ₹85L Cr | 2047: ₹425L Cr'}
              </div>
            </div>
            <div className="text-[10px] font-semibold text-emerald-300 flex items-center justify-between border-t border-emerald-800/80 pt-1.5">
              <span>{fmt(overview.gsdpProgressPct)}% of 2033</span>
              <span>+{fmt(overview.currentRealizedCagrPct)}% CAGR</span>
            </div>
          </div>

          {/* KPI 2: Total Sanctioned Outlay */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              <span>{isBn ? 'মোট অনুমোদিত ব্যয়' : 'SANCTIONED OUTLAY'}</span>
              <Database className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-ink">
                ₹{fmtInr(overview.totalTrackedOutlayCr)}
              </div>
              <div className="text-[11px] font-semibold text-stone-500">
                {isBn ? 'কোটি টাকা (১৫ খাত)' : 'Crore INR (15 Sectors)'}
              </div>
            </div>
            <div className="text-[10px] font-semibold text-emerald-800 flex items-center justify-between border-t border-stone-200 pt-1.5">
              <span>{isBn ? 'ছাড়:' : 'Disb:'} ₹{fmtInr(overview.totalDisbursedOutlayCr)} Cr</span>
              <span>{fmt(overview.outlayUtilizationPct)}%</span>
            </div>
          </div>

          {/* KPI 3: 24h Outlay Delta */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-emerald-900 font-bold">
              <span>{isBn ? '২৪ ঘণ্টার বরাদ্দ ডেল্টা' : '24H OUTLAY DELTA'}</span>
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-primary">
                +₹{fmtInr(overview.todayOutlayDeltaCr)}
              </div>
              <div className="text-[11px] font-semibold text-emerald-900">
                {isBn ? 'কোটি টাকা আজ যাচাইকৃত' : 'Crore Verified Today'}
              </div>
            </div>
            <div className="text-[10px] font-semibold text-emerald-800 flex items-center justify-between border-t border-emerald-200 pt-1.5">
              <span>+{fmt(overview.totalEvidences)} {isBn ? 'নথি' : 'Releases'}</span>
              <span>+18 bps GSDP</span>
            </div>
          </div>

          {/* KPI 4: Weighted Execution Rate */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              <span>{isBn ? 'বাস্তবায়ন সূচক' : 'EXECUTION INDEX'}</span>
              <Activity className="w-3.5 h-3.5 text-blue-700" />
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-blue-900">
                {fmt(overview.activeExecutionRate)}%
              </div>
              <div className="text-[11px] font-semibold text-stone-500">
                {isBn ? 'সক্রিয় ও সম্পন্ন প্রকল্প' : 'Active + Delivered Share'}
              </div>
            </div>
            <div className="text-[10px] font-semibold text-stone-700 flex items-center justify-between border-t border-stone-200 pt-1.5">
              <span>{isBn ? 'ওজনযুক্ত:' : 'Weighted:'} {fmt(overview.weightedProgressScore)}%</span>
              <span>{fmt(overview.totalPromises)} Total</span>
            </div>
          </div>

          {/* KPI 5: Promises Lifecycle Breakdown */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              <span>{isBn ? 'সম্পন্ন ও চলমান' : 'DELIVERED / ACTIVE'}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-ink">
                {fmt(overview.deliveredCount)}{' '}
                <span className="text-stone-400 font-normal">/</span>{' '}
                <span className="text-amber-700">{fmt(overview.underImplementationCount)}</span>
              </div>
              <div className="text-[11px] font-semibold text-stone-500">
                {isBn ? 'সম্পন্ন / বাস্তবায়নাধীন' : 'Delivered / In Progress'}
              </div>
            </div>
            <div className="text-[10px] font-semibold text-stone-600 flex items-center justify-between border-t border-stone-200 pt-1.5">
              <span>{isBn ? 'ঘোষিত:' : 'Announced:'} {fmt(overview.announcedCount)}</span>
              <span>{fmt(overview.deliveryCompletionRate)}% Done</span>
            </div>
          </div>

          {/* KPI 6: Evidence Confidence & Audit */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              <span>{isBn ? 'প্রমাণ আস্থা হার' : 'AUDIT CONFIDENCE'}</span>
              <FileCheck2 className="w-3.5 h-3.5 text-purple-700" />
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-purple-900">
                {fmt(overview.avgConfidenceScorePct)}%
              </div>
              <div className="text-[11px] font-semibold text-stone-500">
                {fmt(overview.approvedEvidences)} {isBn ? 'অনুমোদিত প্রমাণ' : 'Approved Citations'}
              </div>
            </div>
            <div className="text-[10px] font-semibold text-stone-600 flex items-center justify-between border-t border-stone-200 pt-1.5">
              <span>{fmt(overview.activeSourcesCount)} {isBn ? 'উৎস' : 'Sources'}</span>
              <span>{fmt(overview.pendingEvidences)} {isBn ? 'অপেক্ষমাণ' : 'Pending'}</span>
            </div>
          </div>

          {/* KPI 7: Per-Capita GSDP */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              <span>{isBn ? 'মাথাপিছু আয়' : 'PER-CAPITA INCOME'}</span>
              <Zap className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-ink">
                ₹{fmtInr(overview.perCapitaInr)}
              </div>
              <div className="text-[11px] font-semibold text-stone-500">
                {isBn ? '২০৩৩: ₹৬.২০L | ২০৪৭: ₹২৮.৫L' : '2033: ₹6.20L | 2047: ₹28.5L'}
              </div>
            </div>
            <div className="text-[10px] font-semibold text-amber-800 flex items-center justify-between border-t border-stone-200 pt-1.5">
              <span>+11.4% YoY</span>
              <span>₹ INR Basis</span>
            </div>
          </div>

          {/* KPI 8: Employment & District Score */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              <span>{isBn ? 'কর্মসংস্থান ও জেলা স্কোর' : 'JOBS & DISTRICT AVG'}</span>
              <Users className="w-3.5 h-3.5 text-teal-700" />
            </div>
            <div className="my-1.5">
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-teal-900">
                {fmt(overview.projectedJobsLakhs)}L
              </div>
              <div className="text-[11px] font-semibold text-stone-500">
                {isBn ? 'প্রাক্কলিত কর্মসংস্থান (লক্ষ)' : 'Projected Jobs (Lakhs)'}
              </div>
            </div>
            <div className="text-[10px] font-semibold text-stone-600 flex items-center justify-between border-t border-stone-200 pt-1.5">
              <span>{fmt(overview.districtsCovered)} {isBn ? 'জেলা' : 'Districts'}</span>
              <span>Avg: {fmt(overview.avgDistrictDeliveryScore)}/100</span>
            </div>
          </div>
        </div>

        {/* View Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-5 mt-5 border-t border-stone-100">
          {[
            {
              id: 'all',
              labelEn: 'All Visual Charts & Figures (Full View)',
              labelBn: 'সকল চার্ট ও পরিসংখ্যান (সম্পূর্ণ ভিউ)',
            },
            {
              id: 'macro',
              labelEn: '1. 2033 & 2047 GSDP (₹ Lakh Cr) & Capex Trajectory',
              labelBn: '১. ২০৩৩ ও ২০৪৭ জিএসডিপি (₹ লক্ষ কোটি) ও মূলধনী ব্যয়',
            },
            {
              id: 'sectors',
              labelEn: '2. 15-Sector Outlay & Execution',
              labelBn: '২. ১৫টি খাতের বরাদ্দ ও বাস্তবায়ন',
            },
            {
              id: 'verification',
              labelEn: '3. 14-Day Scraper Velocity & Audit Tiers',
              labelBn: '৩. ১৪ দিনের স্ক্র্যাপার গতিবেগ ও অডিট স্তর',
            },
            {
              id: 'regional',
              labelEn: '4. 6-Zone & 23-District Spatial Matrix',
              labelBn: '৪. ৬ অঞ্চল ও ২৩ জেলার অর্থনৈতিক ম্যাট্রিক্স',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {isBn ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: 2024-2033-2047 Two-Phase GSDP (₹ Lakh Cr) Multi-Scenario & Annual Capex Charts */}
      {(activeTab === 'all' || activeTab === 'macro') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1A: Multi-Scenario GSDP AreaChart in Rupee Terms (₹ Lakh Crore) */}
          <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {isBn
                    ? 'দ্বি-পর্যায়ের সামষ্টিক অর্থনৈতিক প্রবৃদ্ধি মডেল (২০২৪–২০৩৩–২০৪৭)'
                    : 'TWO-PHASE ECONOMETRIC FORECAST (2024–2033–2047)'}
                </span>
                <h3 className="text-lg font-extrabold text-ink">
                  {isBn
                    ? 'জিএসডিপি ট্র্যাজেক্টরি (২০৩৩: ₹৮৫ লক্ষ কোটি | ২০৪৭: ₹৪২৫ লক্ষ কোটি)'
                    : 'GSDP Trajectory Scenarios in Rupee Terms (₹ Lakh Crore)'}
                </h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs self-start sm:self-auto">
                CAGR: {fmt(overview.currentRealizedCagrPct)}% Live
              </Badge>
            </div>

            <div className="h-[320px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={gsdpTrajectorySeries}
                  margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradAmbitious" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.22} />
                      <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="gradLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#57534E' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#57534E' }}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => [`₹${value} Lakh Cr`, name]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D6D3D1',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="ambitiousInrLakhCr"
                    name={
                      isBn
                        ? 'উচ্চাকাঙ্ক্ষী (২০৩৩: ₹১০২.৫L | ২০৪৭: ₹৫১২.৫L Cr)'
                        : 'Ambitious (2033: ₹102.5L | 2047: ₹512.5L Cr)'
                    }
                    stroke={CHART_COLORS.blue}
                    strokeWidth={2}
                    fill="url(#gradAmbitious)"
                  />
                  <Area
                    type="monotone"
                    dataKey="baseCaseInrLakhCr"
                    name={
                      isBn
                        ? 'ভিত্তিরেখা (২০৩৩: ₹৮৫L | ২০৪৭: ₹৪২৫L Cr)'
                        : 'Base Case Target (2033: ₹85L | 2047: ₹425L Cr)'
                    }
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2.5}
                    fill="url(#gradBase)"
                  />
                  <Area
                    type="monotone"
                    dataKey="liveImpulseInrLakhCr"
                    name={isBn ? 'লাইভ পলিসি ইমপালস (₹ লক্ষ কোটি)' : 'Live Policy Impulse (₹ Lakh Cr)'}
                    stroke={CHART_COLORS.amber}
                    strokeWidth={2.5}
                    strokeDasharray="5 3"
                    fill="url(#gradLive)"
                  />
                  <Area
                    type="monotone"
                    dataKey="conservativeInrLakhCr"
                    name={
                      isBn
                        ? 'রক্ষণশীল (২০৩৩: ₹৬৬L | ২০৪৭: ₹৩৩০L Cr)'
                        : 'Conservative (2033: ₹66L | 2047: ₹330L Cr)'
                    }
                    stroke={CHART_COLORS.slate}
                    strokeWidth={1.5}
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sub-Chart Numerical Trajectory Table in Rupee Terms */}
            <div className="mt-4 pt-3 border-t border-stone-100 overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase">
                    <th className="py-1.5 pr-2">{isBn ? 'বছর' : 'Year'}</th>
                    <th className="py-1.5 px-2 text-right">{isBn ? 'রক্ষণশীল (₹)' : 'Conserv. (₹)'}</th>
                    <th className="py-1.5 px-2 text-right font-bold text-primary">
                      {isBn ? 'ভিত্তিরেখা (₹ লক্ষ কোটি)' : 'Base Target (₹)'}
                    </th>
                    <th className="py-1.5 px-2 text-right font-bold text-amber-800">
                      {isBn ? 'লাইভ ইমপালস (₹)' : 'Live Impulse (₹)'}
                    </th>
                    <th className="py-1.5 px-2 text-right">{isBn ? 'উচ্চাকাঙ্ক্ষী (₹)' : 'Ambitious (₹)'}</th>
                    <th className="py-1.5 pl-2 text-right">{isBn ? 'বার্ষিক ক্যাপেক্স' : 'Annual Capex'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono tabular-nums">
                  {gsdpTrajectorySeries
                    .filter((row) => ['2024', '2026', '2030', '2033', '2038', '2042', '2047'].includes(row.year))
                    .map((row) => (
                      <tr
                        key={row.year}
                        className={`hover:bg-stone-50 ${
                          row.year === '2033' || row.year === '2047' ? 'bg-emerald-50/50 font-bold' : ''
                        }`}
                      >
                        <td className="py-1.5 pr-2 font-bold text-ink">{fmt(row.year)}</td>
                        <td className="py-1.5 px-2 text-right text-stone-600">
                          ₹{fmt(row.conservativeInrLakhCr)}L Cr
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-primary">
                          ₹{fmt(row.baseCaseInrLakhCr)}L Cr
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-amber-800">
                          ₹{fmt(row.liveImpulseInrLakhCr)}L Cr
                        </td>
                        <td className="py-1.5 px-2 text-right text-blue-700">
                          ₹{fmt(row.ambitiousInrLakhCr)}L Cr
                        </td>
                        <td className="py-1.5 pl-2 text-right text-stone-800">
                          ₹{fmtInr(row.capexOutlayCr)} Cr
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart 1B: Annual Capex Outlay (₹ Cr) vs INR GSDP (₹ Lakh Cr) ComposedChart */}
          <div className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="pb-4 border-b border-stone-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                {isBn ? 'মূলধনী বিনিয়োগ ও জিএসডিপি (INR)' : 'CAPITAL EXPENDITURE & INR GSDP'}
              </span>
              <h3 className="text-lg font-extrabold text-ink">
                {isBn
                  ? 'বার্ষিক পরিকাঠামো ক্যাপেক্স (₹ কোটি) বনাম জিএসডিপি (₹ লক্ষ কোটি)'
                  : 'Annual Infrastructure Capex (₹ Cr) vs. GSDP (₹ Lakh Cr)'}
              </h3>
            </div>

            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={gsdpTrajectorySeries}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#57534E' }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#57534E' }}
                    tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#0A5C36' }}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D6D3D1',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar
                    yAxisId="left"
                    dataKey="capexOutlayCr"
                    name={isBn ? 'বার্ষিক ক্যাপেক্স (₹ কোটি)' : 'Annual Capex Outlay (₹ Cr)'}
                    fill={CHART_COLORS.blue}
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="baseCaseInrLakhCr"
                    name={isBn ? 'জিএসডিপি (₹ লক্ষ কোটি)' : 'Nominal GSDP (₹ Lakh Cr)'}
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ r: 3.5, fill: CHART_COLORS.primary }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Key Macroeconomic Multiplier Callouts */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-stone-100">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-[11px] font-semibold text-stone-500">
                  {isBn ? '১ম পর্যায় লক্ষ্যমাত্রা (২০৩৩)' : 'Phase I Target (2033)'}
                </div>
                <div className="text-lg font-black font-mono text-primary mt-0.5">
                  ₹{fmt('85.0')} {isBn ? 'লক্ষ কোটি' : 'Lakh Cr'}
                </div>
                <div className="text-[10px] text-emerald-800 font-medium">
                  {isBn ? 'বন্দর ও শিল্প করিডোর চালিত' : 'Driven by Tajpur & Freight Corridors'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="text-[11px] font-semibold text-amber-900">
                  {isBn ? '২য় পর্যায় লক্ষ্যমাত্রা (২০৪৭)' : 'Phase II Target (2047)'}
                </div>
                <div className="text-lg font-black font-mono text-amber-900 mt-0.5">
                  ₹{fmt('425.0')} {isBn ? 'লক্ষ কোটি' : 'Lakh Cr'}
                </div>
                <div className="text-[10px] text-amber-800 font-medium">
                  {isBn ? 'বিকশিত বাংলা শতবর্ষ ভিশন' : 'Centennial Viksit Bengal Vision'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: 15-Sector Policy Execution & Outlay Breakdown (Charts + Granular Financial Table) */}
      {(activeTab === 'all' || activeTab === 'sectors') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 2A: Sectoral Sanctioned vs Disbursed Outlay & Execution Rate */}
            <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    {isBn ? 'খাতওয়ারী আর্থিক বরাদ্দ বিশ্লেষণ' : 'SECTORAL FINANCIAL ALLOCATION'}
                  </span>
                  <h3 className="text-lg font-extrabold text-ink">
                    {isBn
                      ? 'প্রধান ১০টি খাতে অনুমোদিত বনাম ছাড়কৃত অর্থ (₹ কোটি) ও বাস্তবায়ন হার (%)'
                      : 'Sanctioned vs. Disbursed Outlay (₹ Cr) & Execution Rate Across Top 10 Sectors'}
                  </h3>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  ₹{fmtInr(overview.totalTrackedOutlayCr)} Cr Total
                </Badge>
              </div>

              <div className="h-[340px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={topSectorsForChart}
                    margin={{ top: 10, right: 12, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#44403C' }}
                      angle={-22}
                      textAnchor="end"
                      height={54}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: '#57534E' }}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#D97706' }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#D6D3D1',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                    <Bar
                      yAxisId="left"
                      dataKey="sanctionedOutlayCr"
                      name={isBn ? 'অনুমোদিত বরাদ্দ (₹ কোটি)' : 'Sanctioned Outlay (₹ Cr)'}
                      fill={CHART_COLORS.primary}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="disbursedOutlayCr"
                      name={isBn ? 'ছাড়কৃত অর্থ (₹ কোটি)' : 'Disbursed Outlay (₹ Cr)'}
                      fill={CHART_COLORS.emerald}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="executionRate"
                      name={isBn ? 'বাস্তবায়ন হার (%)' : 'Execution Velocity (%)'}
                      stroke={CHART_COLORS.amber}
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: CHART_COLORS.amber }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2B: Stacked Commitment Status Distribution by Sector */}
            <div className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
              <div className="pb-4 border-b border-stone-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  {isBn ? 'খাতওয়ারী প্রতিশ্রুতির পর্যায়' : 'COMMITMENT LIFECYCLE DISTRIBUTION'}
                </span>
                <h3 className="text-lg font-extrabold text-ink">
                  {isBn
                    ? 'সম্পন্ন, চলমান ও ঘোষিত প্রতিশ্রুতির খাতওয়ারী তুলনা'
                    : 'Delivered, In-Progress & Announced Commitments by Sector'}
                </h3>
              </div>

              <div className="h-[340px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSectorsForChart}
                    layout="vertical"
                    margin={{ top: 5, right: 16, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#57534E' }} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={95}
                      tick={{ fontSize: 11, fill: '#292524', fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#D6D3D1',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <Bar
                      dataKey="delivered"
                      stackId="a"
                      name={isBn ? 'সম্পন্ন' : 'Delivered'}
                      fill={CHART_COLORS.primary}
                    />
                    <Bar
                      dataKey="inProgress"
                      stackId="a"
                      name={isBn ? 'চলমান' : 'In Progress'}
                      fill={CHART_COLORS.amber}
                    />
                    <Bar
                      dataKey="announced"
                      stackId="a"
                      name={isBn ? 'ঘোষিত' : 'Announced'}
                      fill={CHART_COLORS.blue}
                    />
                    <Bar
                      dataKey="notStarted"
                      stackId="a"
                      name={isBn ? 'পাইপলাইন' : 'Pipeline'}
                      fill="#CBD5E1"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Complete 15-Sector Numerical & Financial Audit Matrix Table */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-ink flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  {isBn
                    ? '১৫টি উন্নয়ন খাতের পূর্ণাঙ্গ সংখ্যাগত ও আর্থিক খতিয়ান'
                    : 'Complete 15-Sector Quantitative & Financial Audit Matrix'}
                </h3>
                <p className="text-xs text-stone-500">
                  {isBn
                    ? 'প্রতিটি খাতের মোট প্রতিশ্রুতি, সম্পন্ন, চলমান, অনুমোদিত অর্থ, ছাড়কৃত অর্থ এবং কর্মসংস্থান লক্ষ্যমাত্রা'
                    : 'Live sector-by-sector breakdown of commitment counts, execution velocity, sanctioned vs. disbursed outlays, and job creation'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-stone-700">
                15 {isBn ? 'টি খাত' : 'Sectors'} · {fmt(overview.totalPromises)}{' '}
                {isBn ? 'টি প্রতিশ্রুতি' : 'Commitments'}
              </span>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase text-[11px] bg-stone-50/80">
                    <th className="py-2.5 px-3">{isBn ? 'উন্নয়ন খাত' : 'Sector'}</th>
                    <th className="py-2.5 px-2 text-right">{isBn ? 'মোট' : 'Total'}</th>
                    <th className="py-2.5 px-2 text-right text-emerald-800">
                      {isBn ? 'সম্পন্ন' : 'Delivered'}
                    </th>
                    <th className="py-2.5 px-2 text-right text-amber-800">
                      {isBn ? 'চলমান' : 'In Prog.'}
                    </th>
                    <th className="py-2.5 px-2 text-right text-blue-800">
                      {isBn ? 'ঘোষিত' : 'Announced'}
                    </th>
                    <th className="py-2.5 px-2 text-right">{isBn ? 'বাস্তবায়ন %' : 'Exec %'}</th>
                    <th className="py-2.5 px-3 text-right font-bold text-ink">
                      {isBn ? 'অনুমোদিত (₹ কোটি)' : 'Sanctioned (₹ Cr)'}
                    </th>
                    <th className="py-2.5 px-3 text-right text-emerald-800">
                      {isBn ? 'ছাড়কৃত (₹ কোটি)' : 'Disbursed (₹ Cr)'}
                    </th>
                    <th className="py-2.5 px-2 text-right">{isBn ? 'ব্যবহার %' : 'Util %'}</th>
                    <th className="py-2.5 px-3 text-right">{isBn ? 'কর্মসংস্থান (লক্ষ)' : 'Jobs (L)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono tabular-nums">
                  {sectorAnalytics.map((sec) => (
                    <tr key={sec.code} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-bold text-ink">
                        {isBn ? sec.nameBn : sec.nameEn}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-stone-800">
                        {fmt(sec.total)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-emerald-700">
                        {fmt(sec.delivered)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-semibold text-amber-700">
                        {fmt(sec.inProgress)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-blue-700">
                        {fmt(sec.announced)}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-primary font-bold">
                          {fmt(sec.executionRate)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-ink">
                        ₹{fmtInr(sec.sanctionedOutlayCr)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-800">
                        ₹{fmtInr(sec.disbursedOutlayCr)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-stone-700">
                        {fmt(sec.utilizationRate)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-teal-800">
                        {fmt(sec.jobsProjectedLakhs)}L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: 14-Day Scraper Velocity & Evidence Verification Tier Breakdown */}
      {(activeTab === 'all' || activeTab === 'verification') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 3A: 14-Day Rolling Ingestion & Capital Sanction Velocity */}
          <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {isBn ? '১৪ দিনের রিয়েল-টাইম যাচাইকরণ গতিবেগ' : '14-DAY REAL-TIME VERIFICATION VELOCITY'}
                </span>
                <h3 className="text-lg font-extrabold text-ink">
                  {isBn
                    ? 'দৈনিক অনুমোদিত অর্থ (₹ কোটি), ক্রমপুঞ্জিত বরাদ্দ এবং যাচাইকৃত সরকারি আদেশ'
                    : 'Daily Verified Outlay Sanctions (₹ Cr) & Cumulative Capital Tracked'}
                </h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                14-Day Rolling Window
              </Badge>
            </div>

            <div className="h-[310px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dailyIngestionSeries}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#57534E' }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#57534E' }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#0A5C36' }}
                    tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D6D3D1',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar
                    yAxisId="left"
                    dataKey="outlaySanctionedCr"
                    name={isBn ? 'দৈনিক অনুমোদিত অর্থ (₹ কোটি)' : 'Daily Sanctioned Outlay (₹ Cr)'}
                    fill={CHART_COLORS.emerald}
                    radius={[5, 5, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativeOutlayCr"
                    name={isBn ? 'ক্রমপুঞ্জিত বরাদ্দ (₹ কোটি)' : 'Cumulative Tracked Outlay (₹ Cr)'}
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ r: 3, fill: CHART_COLORS.primary }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3B: Evidence Tier Donut + Commitment Lifecycle Donut & Document Type Figures */}
          <div className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="pb-3 border-b border-stone-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                {isBn ? 'প্রমাণ স্তর ও প্রতিশ্রুতি অনুপাত' : 'EVIDENCE TIERS & LIFECYCLE SHARE'}
              </span>
              <h3 className="text-lg font-extrabold text-ink">
                {isBn
                  ? 'উৎস স্তর (Tier 1–3) এবং নথির ধরন অনুযায়ী বিভাজন'
                  : 'Verification Source Tiers & Commitment Status Distribution'}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center pt-2">
              <div className="h-[190px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {statusPieData.map((_, idx) => (
                        <Cell key={idx} fill={TIER_COLORS[idx % TIER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: string) => [`${val} Promises`, name]}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                {evidenceTierBreakdown.byStatus.map((st, idx) => (
                  <div
                    key={st.status}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-stone-50 border border-stone-200/80"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: TIER_COLORS[idx % TIER_COLORS.length] }}
                      />
                      <span className="font-semibold text-stone-800">
                        {isBn ? st.labelBn : st.labelEn}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-ink">
                      {fmt(st.count)} ({fmt(st.sharePct)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Tier & Document Type Numerical Breakdown */}
            <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                {isBn ? 'প্রমাণ স্তর অনুযায়ী অর্থ ও আস্থা হার' : 'Verified Source Tiers (Count · Outlay · Confidence)'}
              </div>
              {tierPieData.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-stone-50 border border-stone-200/70"
                >
                  <span className="font-semibold text-stone-800 truncate pr-2">{t.name}</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums shrink-0">
                    <span className="text-stone-600">{fmt(t.value)} docs</span>
                    <span className="font-bold text-primary">₹{fmtInr(t.outlayCr)} Cr</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                      {fmt(t.avgConfidencePct)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: 6-Zone & 23-District Spatial Econometric Analysis */}
      {(activeTab === 'all' || activeTab === 'regional') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 4A: Regional Zone GSDP Share, Delivery Score & Outlay */}
          <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {isBn ? 'আঞ্চলিক অর্থনৈতিক ভারসাম্য (৬টি অঞ্চল)' : 'REGIONAL ZONE ECONOMETRIC MATRIX'}
                </span>
                <h3 className="text-lg font-extrabold text-ink">
                  {isBn
                    ? 'অঞ্চলভিত্তিক অনুমোদিত অর্থ (₹ কোটি), জিএসডিপি অংশ (%) ও ডেলিভারি স্কোর'
                    : 'Regional Capital Outlay (₹ Cr), GSDP Share (%) & Mean Delivery Score'}
                </h3>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                23 Districts · 6 Zones
              </Badge>
            </div>

            <div className="h-[290px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={regionalZoneAnalytics.map((z) => ({
                    ...z,
                    label: isBn ? z.zoneBn : z.zone,
                  }))}
                  margin={{ top: 10, right: 12, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#44403C' }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#57534E' }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#0A5C36' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#D6D3D1',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar
                    yAxisId="left"
                    dataKey="sanctionedOutlayCr"
                    name={isBn ? 'অনুমোদিত বরাদ্দ (₹ কোটি)' : 'Sanctioned Outlay (₹ Cr)'}
                    fill={CHART_COLORS.teal}
                    radius={[5, 5, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgDeliveryScore"
                    name={isBn ? 'গড় ডেলিভারি স্কোর (%)' : 'Mean Delivery Score (%)'}
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ r: 4, fill: CHART_COLORS.primary }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="gsdpSharePct"
                    name={isBn ? 'জিএসডিপি অংশ (%)' : 'Regional GSDP Share (%)'}
                    stroke={CHART_COLORS.amber}
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Regional Zone Numerical Table */}
            <div className="mt-4 pt-3 border-t border-stone-100 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px]">
                    <th className="py-1.5 pr-2">{isBn ? 'অঞ্চল' : 'Zone'}</th>
                    <th className="py-1.5 px-2 text-right">{isBn ? 'জেলা' : 'Districts'}</th>
                    <th className="py-1.5 px-2 text-right">{isBn ? 'জনসংখ্যা' : 'Pop (M)'}</th>
                    <th className="py-1.5 px-2 text-right">{isBn ? 'জিএসডিপি %' : 'GSDP %'}</th>
                    <th className="py-1.5 px-2 text-right">{isBn ? 'ডেলিভারি স্কোর' : 'Score'}</th>
                    <th className="py-1.5 px-2 text-right font-bold text-ink">
                      {isBn ? 'বরাদ্দ (₹ কোটি)' : 'Outlay (₹ Cr)'}
                    </th>
                    <th className="py-1.5 pl-2 text-right">{isBn ? 'মাথাপিছু আয়' : 'Per Capita'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono tabular-nums">
                  {regionalZoneAnalytics.map((z) => (
                    <tr key={z.zone} className="hover:bg-stone-50">
                      <td className="py-1.5 pr-2 font-sans font-bold text-ink">
                        {isBn ? z.zoneBn : z.zone}
                      </td>
                      <td className="py-1.5 px-2 text-right">{fmt(z.districtsCount)}</td>
                      <td className="py-1.5 px-2 text-right">{fmt(z.populationM)}M</td>
                      <td className="py-1.5 px-2 text-right font-bold text-primary">
                        {fmt(z.gsdpSharePct)}%
                      </td>
                      <td className="py-1.5 px-2 text-right font-semibold text-amber-800">
                        {fmt(z.avgDeliveryScore)}/100
                      </td>
                      <td className="py-1.5 px-2 text-right font-bold text-ink">
                        ₹{fmtInr(z.sanctionedOutlayCr)}
                      </td>
                      <td className="py-1.5 pl-2 text-right text-stone-700">
                        ₹{fmtInr(z.perCapitaInr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart 4B: Regional Multi-Axis Radar + Top District Figures */}
          <div className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div className="pb-3 border-b border-stone-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                {isBn ? 'আঞ্চলিক সক্ষমতা রাডার ও শীর্ষ জেলা' : 'SPATIAL CAPABILITY RADAR & TOP DISTRICTS'}
              </span>
              <h3 className="text-lg font-extrabold text-ink">
                {isBn
                  ? '৬টি অঞ্চলের ডেলিভারি ও অর্থনৈতিক সক্ষমতা রাডার'
                  : 'Multi-Zone Delivery & Economic Capacity Radar'}
              </h3>
            </div>

            <div className="h-[220px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={regionalZoneAnalytics.map((z) => ({
                    zone: isBn ? z.zoneBn : z.zone,
                    deliveryScore: z.avgDeliveryScore,
                    activePromises: Math.min(100, z.activePromises * 2),
                  }))}
                >
                  <PolarGrid stroke="#D6D3D1" />
                  <PolarAngleAxis dataKey="zone" tick={{ fontSize: 10, fill: '#44403C' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    name={isBn ? 'ডেলিভারি স্কোর' : 'Delivery Score'}
                    dataKey="deliveryScore"
                    stroke={CHART_COLORS.primary}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.35}
                  />
                  <Radar
                    name={isBn ? 'প্রকল্প ঘনত্ব সূচক' : 'Project Density Index'}
                    dataKey="activePromises"
                    stroke={CHART_COLORS.blue}
                    fill={CHART_COLORS.blue}
                    fillOpacity={0.2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Top 6 Districts by Outlay & Delivery */}
            <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                {isBn ? 'শীর্ষ জেলা (জিএসডিপি ও বরাদ্দ)' : 'Top Districts by GSDP Share & Tracked Outlay'}
              </div>
              {districtMatrix.slice(0, 6).map((d) => (
                <div
                  key={d.code}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-stone-50 border border-stone-200/70"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-emerald-100 text-primary">
                      {d.code}
                    </span>
                    <span className="font-bold text-ink">{isBn ? d.nameBn : d.nameEn}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="text-stone-600">{fmt(d.gsdpSharePct)}% GSDP</span>
                    <span className="font-bold text-ink">₹{fmtInr(d.outlayCr)} Cr</span>
                    <span className="font-bold text-emerald-800">{fmt(d.deliveryScore)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
