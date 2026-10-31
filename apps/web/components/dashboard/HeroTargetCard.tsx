'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Calendar, ArrowUpRight, ShieldCheck, IndianRupee, Layers } from 'lucide-react';
import { toBengaliNumerals } from '@viksit/shared';

interface ScenarioInfo {
  key: 'conservative' | 'base_case' | 'ambitious';
  targetInr2033: number; // in Lakh Crore
  targetInr2047: number; // in Lakh Crore
  cagr2033: number;
  cagr2047: number;
  labelEn: string;
  labelBn: string;
  color: string;
  descEn: string;
  descBn: string;
}

const SCENARIOS: ScenarioInfo[] = [
  {
    key: 'conservative',
    targetInr2033: 66,
    targetInr2047: 330,
    cagr2033: 10.5,
    cagr2047: 11.4,
    labelEn: 'Conservative',
    labelBn: 'রক্ষণশীল',
    color: 'border-amber-400 bg-amber-50 text-amber-950',
    descEn: 'Assumes steady base growth in Rupee terms with moderate export inflows and resilient agri-output.',
    descBn: 'মাঝারি রফতানি এবং কৃষির স্বাভাবিক প্রবৃদ্ধির ওপর ভিত্তি করে নির্ধারিত টাকার অঙ্কে লক্ষ্যমাত্রা।',
  },
  {
    key: 'base_case',
    targetInr2033: 85,
    targetInr2047: 425,
    cagr2033: 13.0,
    cagr2047: 14.2,
    labelEn: 'Base Case (₹85L Cr / ₹425L Cr)',
    labelBn: 'ভিত্তিরেখা (₹৮৫ লক্ষ কোটি / ₹৪২৫ লক্ষ কোটি)',
    color: 'border-primary bg-emerald-50 text-emerald-950',
    descEn: 'Consensus two-phase roadmap: ₹85 Lakh Crore by 2033 and ₹425 Lakh Crore by 2047 via Tajpur deep seaport, freight corridors, and IT exports.',
    descBn: 'দ্বি-পর্যায়ের প্রধান লক্ষ্যমাত্রা: ২০৩৩ সালের মধ্যে ₹৮৫ লক্ষ কোটি এবং ২০৪৭ সালের মধ্যে ₹৪২৫ লক্ষ কোটি জিএসডিপি অর্জন।',
  },
  {
    key: 'ambitious',
    targetInr2033: 102.5,
    targetInr2047: 512.5,
    cagr2033: 15.5,
    cagr2047: 16.0,
    labelEn: 'Ambitious',
    labelBn: 'উচ্চাকাঙ্ক্ষী',
    color: 'border-blue-500 bg-blue-50 text-blue-950',
    descEn: 'Accelerated capital investment, global semiconductor fabrication, green hydrogen, and high-value manufacturing supply chains.',
    descBn: 'ব্যাপক মূলধনী বিনিয়োগ, সেমিকন্ডাক্টর ও গ্লোবাল সাপ্লাই চেইন সম্প্রসারণের মাধ্যমে দ্রুততর প্রবৃদ্ধি।',
  },
];

export default function HeroTargetCard() {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const [activeScenario, setActiveScenario] = React.useState<'conservative' | 'base_case' | 'ambitious'>('base_case');
  const [activePhase, setActivePhase] = React.useState<'2033' | '2047'>('2047');

  const scenario = SCENARIOS.find((s) => s.key === activeScenario) || SCENARIOS[1];
  const currentGsdpInrLakhCr = 17.85;
  const activeTargetInr = activePhase === '2033' ? scenario.targetInr2033 : scenario.targetInr2047;
  const activeCagr = activePhase === '2033' ? scenario.cagr2033 : scenario.cagr2047;
  const progressPercent = Math.min(Number(((currentGsdpInrLakhCr / activeTargetInr) * 100).toFixed(1)), 100);
  const yearsRemaining = activePhase === '2033' ? 7 : 21;

  const formatNum = (val: number | string) => {
    return locale === 'bn' ? toBengaliNumerals(val) : String(val);
  };

  return (
    <Card className="overflow-hidden border-2 border-emerald-900/10 shadow-xl bg-gradient-to-br from-white via-emerald-50/20 to-white">
      <CardHeader className="pb-4 border-b border-stone-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-primary border border-emerald-300">
                {locale === 'bn' ? 'রূপকল্প ২০৪৭ (২০৩৩ ও ২০৪৭)' : 'Vision 2047 (2033 & 2047)'}
              </span>
              <Badge variant="outline" className="font-semibold text-stone-700">
                {locale === 'bn' ? 'পশ্চিমবঙ্গ জিএসডিপি (₹ লক্ষ কোটি)' : 'West Bengal GSDP (₹ Lakh Crore)'}
              </Badge>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink flex items-center gap-2 pt-1">
              <Target className="w-7 h-7 text-primary" aria-hidden="true" />
              {t('targetCardTitle')}
            </CardTitle>
            <CardDescription className="text-base text-stone-600 max-w-2xl">
              {t('targetCardDescription')}
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Phase Toggle (Phase I: 2033 vs Phase II: 2047) */}
            <div className="flex items-center gap-1 p-1 bg-emerald-950/5 rounded-xl border border-emerald-900/15">
              <button
                type="button"
                onClick={() => setActivePhase('2033')}
                className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePhase === '2033'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                {locale === 'bn' ? '১ম পর্যায়: ২০৩৩' : 'Phase I: 2033'}
              </button>
              <button
                type="button"
                onClick={() => setActivePhase('2047')}
                className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePhase === '2047'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                {locale === 'bn' ? '২য় পর্যায়: ২০৪৭' : 'Phase II: 2047'}
              </button>
            </div>

            {/* Scenario Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-100 rounded-xl border border-stone-200">
              {SCENARIOS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveScenario(s.key)}
                  className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    activeScenario === s.key
                      ? 'bg-primary text-white shadow-md'
                      : 'text-stone-700 hover:bg-stone-200'
                  }`}
                  aria-pressed={activeScenario === s.key}
                >
                  {locale === 'bn' ? s.labelBn : s.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Two-Part Vision Summary Strip in Rupee Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div
            onClick={() => setActivePhase('2033')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activePhase === '2033'
                ? 'border-primary bg-emerald-50/70 ring-2 ring-primary/15'
                : 'border-stone-200 bg-stone-50/70 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {locale === 'bn' ? 'প্রথম পর্যায় মাইলফলক • ২০৩৩' : 'Phase I Milestone • Target 2033'}
              </span>
              <Badge variant="outline" className="text-[10px] font-bold bg-white text-emerald-900 border-emerald-300">
                {formatNum(scenario.cagr2033)}% CAGR
              </Badge>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-ink tracking-tight tabular-nums">
                ₹{formatNum(scenario.targetInr2033)} {locale === 'bn' ? 'লক্ষ কোটি' : 'Lakh Cr'}
              </div>
              <span className="text-xs font-semibold text-stone-600">
                {locale === 'bn' ? 'বর্তমান অর্জন:' : 'Achieved:'}{' '}
                {formatNum(((currentGsdpInrLakhCr / scenario.targetInr2033) * 100).toFixed(1))}%
              </span>
            </div>
          </div>

          <div
            onClick={() => setActivePhase('2047')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activePhase === '2047'
                ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/15'
                : 'border-stone-200 bg-stone-50/70 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-700" />
                {locale === 'bn' ? 'দ্বিতীয় পর্যায় মাইলফলক • ২০৪৭' : 'Phase II Centennial Milestone • Target 2047'}
              </span>
              <Badge variant="outline" className="text-[10px] font-bold bg-white text-amber-900 border-amber-300">
                {formatNum(scenario.cagr2047)}% CAGR
              </Badge>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-ink tracking-tight tabular-nums">
                ₹{formatNum(scenario.targetInr2047)} {locale === 'bn' ? 'লক্ষ কোটি' : 'Lakh Cr'}
              </div>
              <span className="text-xs font-semibold text-stone-600">
                {locale === 'bn' ? 'বর্তমান অর্জন:' : 'Achieved:'}{' '}
                {formatNum(((currentGsdpInrLakhCr / scenario.targetInr2047) * 100).toFixed(1))}%
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid (All in Rupee terms) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-600 text-xs font-medium">
              <span>{t('currentGsdp')}</span>
              <IndianRupee className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-ink tracking-tight tabular-nums">
                ₹{formatNum('17.85')} {locale === 'bn' ? 'লক্ষ কোটি' : 'Lakh Cr'}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-stone-500 font-medium">
              {locale === 'bn' ? 'ভিত্তি অর্থবছর: ২০২৫-২৬ (₹১,৭৮৫ হাজার কোটি)' : 'Base FY: 2025-26 (₹17,85,000 Cr)'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
              <span>
                {activePhase === '2033'
                  ? locale === 'bn'
                    ? 'লক্ষ্যমাত্রা জিএসডিপি (২০৩৩)'
                    : 'Target GSDP (2033)'
                  : locale === 'bn'
                  ? 'লক্ষ্যমাত্রা জিএসডিপি (২০৪৭)'
                  : 'Target GSDP (2047)'}
              </span>
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight tabular-nums">
                ₹{formatNum(activeTargetInr)} {locale === 'bn' ? 'লক্ষ কোটি' : 'Lakh Cr'}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 font-medium">
              {activePhase === '2033'
                ? locale === 'bn'
                  ? '১ম পর্যায় লক্ষ্য বছর: ২০৩৩'
                  : 'Phase I Target Year: 2033'
                : locale === 'bn'
                ? '২য় পর্যায় লক্ষ্য বছর: ২০৪৭'
                : 'Phase II Target Year: 2047'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-600 text-xs font-medium">
              <span>{t('requiredCagr')}</span>
              <TrendingUp className="w-4 h-4 text-amber-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-amber-800 tracking-tight tabular-nums">
                {formatNum(activeCagr)}%
              </span>
              <span className="text-xs text-stone-500 font-medium">CAGR</span>
            </div>
            <div className="mt-2 text-[11px] text-stone-500 font-medium">
              {locale === 'bn' ? 'বার্ষিক গড় মূলধনী প্রবৃদ্ধির হার (₹)' : 'Annualized Rupee GSDP Growth'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-600 text-xs font-medium">
              <span>{t('yearsRemaining')}</span>
              <Calendar className="w-4 h-4 text-stone-700" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-ink tracking-tight tabular-nums">
                {formatNum(yearsRemaining)}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {locale === 'bn' ? 'বছর' : 'Years'}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-stone-500 font-medium">
              {locale === 'bn' ? 'মেয়াদ: ২০২৬ - ২০৩৩ - ২০৪৭' : 'Horizon: 2026 → 2033 → 2047'}
            </div>
          </div>
        </div>

        {/* Progress Towards Target */}
        <div className="space-y-2 p-4 bg-white rounded-xl border border-stone-200">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-ink flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              {locale === 'bn'
                ? `বর্তমান অর্জনের অনুপাত (${activePhase === '2033' ? '২০৩৩' : '২০৪৭'} লক্ষ্যমাত্রা)`
                : `Progress Towards ${activePhase} Target (₹ Lakh Crore)`}
            </span>
            <span className="text-primary font-bold">{formatNum(progressPercent)}%</span>
          </div>
          <Progress
            value={progressPercent}
            className="h-3.5 bg-stone-100"
            indicatorClassName="bg-gradient-to-r from-emerald-600 to-primary"
            aria-label={`Current GSDP is ${progressPercent}% of the ${scenario.labelEn} target`}
          />
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium pt-1">
            <span>₹0 {locale === 'bn' ? 'লক্ষ কোটি' : 'Lakh Cr'}</span>
            <span className="font-semibold text-stone-700">
              ₹{formatNum('17.85')} {locale === 'bn' ? 'লক্ষ কোটি (বর্তমান)' : 'Lakh Cr (Current)'}
            </span>
            <span>
              ₹{formatNum(activeTargetInr)} {locale === 'bn' ? `লক্ষ কোটি (${activePhase === '2033' ? '২০৩৩' : '২০৪৭'} লক্ষ্যমাত্রা)` : `Lakh Cr (${activePhase} Target)`}
            </span>
          </div>
        </div>

        {/* Contextual notes */}
        <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
          <ArrowUpRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-ink font-bold">
              {locale === 'bn' ? scenario.labelBn : scenario.labelEn}:{' '}
            </strong>
            {locale === 'bn' ? scenario.descBn : scenario.descEn}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
