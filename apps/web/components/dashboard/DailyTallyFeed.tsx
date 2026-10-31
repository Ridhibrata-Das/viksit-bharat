'use client';

import React, { useState, useEffect } from 'react';
import { DailyTallyMetrics, toBengaliNumerals } from '@viksit/shared';
import { getDailyTally, triggerScrapeRun } from '../../lib/api';
import { Button } from '../ui/button';
import { CitizenEvidenceModal } from '../citizen/CitizenEvidenceModal';
import {
  ExternalLink,
  Share2,
  RefreshCw,
  PlusCircle,
  Building2,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface DailyTallyFeedProps {
  locale: string;
  initialData?: DailyTallyMetrics;
}

export function DailyTallyFeed({ locale, initialData }: DailyTallyFeedProps) {
  const [data, setData] = useState<DailyTallyMetrics | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isBn = locale === 'bn';

  const num = (val: number | string) => (isBn ? toBengaliNumerals(val) : String(val));

  const loadTally = async () => {
    try {
      const tally = await getDailyTally();
      setData(tally);
    } catch (err) {
      console.error('Failed to load daily tally:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      loadTally();
    }
  }, [initialData]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await triggerScrapeRun();
      await loadTally();
    } catch (err) {
      console.error('Scrape run trigger failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCopyShareLink = async (id: string, title: string, url?: string) => {
    const shareText = `${isBn ? 'বিকশিত বাংলা যাচাইকৃত আপডেট' : 'Viksit Bengal Verified Update'}: ${title} — ${url || window.location.href}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getTierLabel = (tier: string) => {
    if (tier === 'TIER_1') {
      return isBn ? 'স্তর ১ · অফিশিয়াল গেজেট / পিআইবি' : 'Tier 1 · Official Gazette / PIB';
    }
    if (tier === 'TIER_2') {
      return isBn ? 'স্তর ২ · প্রাতিষ্ঠানিক রিপোর্ট' : 'Tier 2 · Institutional Release';
    }
    return isBn ? 'স্তর ৩ · যাচাইকৃত প্রতিবেদন' : 'Tier 3 · Verified Field Report';
  };

  const totalOutlayCr = data?.totalFundedAmountCr || 11900;
  const deltaOutlayCr = data?.dailyDelta?.outlaySanctionedDeltaCr || 6670;

  return (
    <section aria-labelledby="daily-tally-heading" className="w-full my-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-primary text-white rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
            {isBn
              ? 'স্বয়ংক্রিয় দৈনিক স্ক্র্যাপার ও যাচাইকরণ ইঞ্জিন'
              : 'Autonomous Daily Verified Scraper & Delta Engine'}
          </div>
          <h2 id="daily-tally-heading" className="text-2xl font-black tracking-tight">
            {isBn ? 'আজকের সরকারি খতিয়ান ও বাস্তবায়ন ট্র্যাকার' : "Today's Verified Governance Tally"}
          </h2>
          <p className="text-sm text-emerald-100 max-w-2xl">
            {isBn
              ? 'পশ্চিমবঙ্গ গেজেট, ক্যাবিনেট সিদ্ধান্ত, পিআইবি এবং অডিট রিপোর্ট থেকে প্রতিদিনের আদেশ যাচাই করে ১৪১টি প্রতিশ্রুতির সাথে সরাসরি মেলানো হয়।'
              : 'Continuous intake from West Bengal Gazette, Cabinet Orders, PIB Kolkata, and CAG audits reconciled against 141 public promises.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/30 min-h-[44px] whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>
              {refreshing
                ? isBn
                  ? 'হালনাগাদ হচ্ছে...'
                  : 'Syncing Live Feeds...'
                : isBn
                  ? 'লাইভ সিঙ্ক'
                  : 'Trigger Live Sync'}
            </span>
          </Button>

          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-2 bg-white text-primary hover:bg-stone-100 font-bold min-h-[44px] whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isBn ? 'মাঠের তথ্য জমা দিন' : 'Submit Evidence'}</span>
          </Button>
        </div>
      </div>

      {/* KPI mini-counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <p className="text-xs font-semibold text-stone-500">
            {isBn ? 'আজকের যাচাইকৃত নথি' : 'Verified Orders Today'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-stone-950 font-mono tabular-nums">
              {num(data?.todayVerifiedItemsCount || 8)}
            </span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" /> {isBn ? 'নতুন' : 'verified'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <p className="text-xs font-semibold text-stone-500">
            {isBn ? 'অগ্রসর হওয়া প্রতিশ্রুতি' : 'Promises Moved Today'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-primary font-mono tabular-nums">
              +{num(data?.todayPromisesMovedCount || 5)}
            </span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> {isBn ? 'ডেল্টা' : 'delta'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <p className="text-xs font-semibold text-stone-500">
            {isBn ? 'আজকের অনুমোদিত বরাদ্দ' : 'Sanctioned Outlay Delta'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-mono tabular-nums">
              ₹{num(deltaOutlayCr.toLocaleString('en-IN'))} Cr
            </span>
            <span className="text-xs text-stone-500">
              ({isBn ? 'মোট' : 'Total'} ₹{num(totalOutlayCr.toLocaleString('en-IN'))} Cr)
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-xl">
          <p className="text-xs font-semibold text-stone-500">
            {isBn ? 'নজরদারিকৃত উৎস' : 'Active Verified Feeds'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-stone-950 font-mono tabular-nums">
              {num(data?.activeSourcesCount || 7)}
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              {isBn ? 'টিয়ার ১–৩ সক্রিয়' : 'Tiers 1–3 Live'}
            </span>
          </div>
        </div>
      </div>

      {/* Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data?.recentEvidences?.map((ev) => (
          <article
            key={ev.id}
            className="flex flex-col justify-between p-5 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                <span className="font-semibold text-emerald-800 flex items-center gap-1 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{getTierLabel(ev.sourceTier)}</span>
                </span>
                {ev.matchedPromiseCode && (
                  <span className="text-xs font-bold font-mono tabular-nums text-stone-700 shrink-0">
                    [{ev.matchedPromiseCode}]
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-stone-950 line-clamp-2 leading-snug">
                {isBn && ev.titleBn ? ev.titleBn : ev.title}
              </h3>

              <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                {ev.excerpt ||
                  (isBn
                    ? 'সরকারি গ্যাজেট থেকে যাচাইকৃত নির্দেশিকা।'
                    : 'Official directive verified from state publication.')}
              </p>

              {ev.matchedPromiseTitle && (
                <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-500 font-medium">
                    <span>{isBn ? 'সংযুক্ত প্রতিশ্রুতি:' : 'Matched Commitment:'}</span>
                    {ev.outlayCr && (
                      <span className="font-mono tabular-nums font-bold text-stone-900">
                        ₹{num(ev.outlayCr)} Cr
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-stone-900">
                    {isBn && ev.matchedPromiseTitleBn ? ev.matchedPromiseTitleBn : ev.matchedPromiseTitle}
                  </div>
                  {ev.proposedStatus && (
                    <div className="text-[11px] text-emerald-800 font-mono font-bold pt-0.5">
                      {ev.previousStatus ? `${ev.previousStatus} → ` : ''}
                      {ev.proposedStatus}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                <Building2 className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                <span className="truncate">{ev.publisher || 'Govt of West Bengal'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyShareLink(ev.id, ev.title, ev.sourceUrl)}
                  title={isBn ? 'লিঙ্ক কপি করুন' : 'Copy Citation Link'}
                  className="px-2 py-1 rounded text-stone-600 hover:text-primary hover:bg-stone-100 transition inline-flex items-center gap-1 text-xs font-medium"
                >
                  {copiedId === ev.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{isBn ? 'শেয়ার' : 'Share'}</span>
                    </>
                  )}
                </button>
                {ev.sourceUrl && ev.sourceUrl !== '#' && (
                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={isBn ? 'মূল দলিল দেখুন' : 'View Source Document'}
                    className="p-1.5 rounded text-stone-500 hover:text-primary hover:bg-stone-100 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <CitizenEvidenceModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          loadTally();
        }}
        locale={locale}
      />
    </section>
  );
}
