'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Layers, CheckCircle2, Clock, X, ChevronDown } from 'lucide-react';
import PromiseCard, { PromiseData } from './PromiseCard';
import PromiseTimeline from './PromiseTimeline';
import { toBengaliNumerals } from '@viksit/shared';

interface PromiseExplorerProps {
  initialPromises: PromiseData[];
  selectedDistrictCode?: string | null;
  onClearDistrictFilter?: () => void;
}

export default function PromiseExplorer({
  initialPromises,
  selectedDistrictCode,
  onClearDistrictFilter,
}: PromiseExplorerProps) {
  const t = useTranslations('PromiseExplorer');
  const locale = useLocale();

  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [activeTimelinePromise, setActiveTimelinePromise] = React.useState<PromiseData | null>(null);
  const [displayCount, setDisplayCount] = React.useState(12);

  const formatNum = (val: number | string) => {
    return locale === 'bn' ? toBengaliNumerals(val) : String(val);
  };

  // Extract unique categories
  const categories = React.useMemo(() => {
    const map = new Map<string, { code: string; title: string; icon: string }>();
    initialPromises.forEach((p) => {
      if (p.category?.code) {
        const title = locale === 'bn' ? (p.category.titleBn || p.category.titleEn || p.category.code) : (p.category.titleEn || p.category.code);
        map.set(p.category.code, {
          code: p.category.code,
          title,
          icon: p.category.icon || '🏛️',
        });
      }
    });
    return Array.from(map.values());
  }, [initialPromises, locale]);

  // Filter promises
  const filteredPromises = React.useMemo(() => {
    return initialPromises.filter((p) => {
      // District filter
      if (selectedDistrictCode) {
        const matchesDistrict = (p as any).districts?.some((d: any) =>
          d.district?.code?.toUpperCase() === selectedDistrictCode.toUpperCase() ||
          d.districtCode?.toUpperCase() === selectedDistrictCode.toUpperCase()
        );
        // If promise has district relation, enforce it; or if general state-wide promise
        if (!matchesDistrict && (p as any).districts?.length > 0) return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && p.category?.code !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        const s = (p.status || '').toUpperCase();
        if (selectedStatus === 'DELIVERED' && s !== 'DELIVERED') return false;
        if (selectedStatus === 'UNDER_IMPLEMENTATION' && s !== 'UNDER_IMPLEMENTATION') return false;
        if (selectedStatus === 'ANNOUNCED' && s !== 'ANNOUNCED') return false;
      }

      // Search keyword filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const enTitle = (p.titleEn || '').toLowerCase();
        const bnTitle = (p.titleBn || '').toLowerCase();
        const code = (p.code || '').toLowerCase();
        const desc = (p.descriptionEn || '').toLowerCase();
        return enTitle.includes(q) || bnTitle.includes(q) || code.includes(q) || desc.includes(q);
      }

      return true;
    });
  }, [initialPromises, selectedDistrictCode, selectedCategory, selectedStatus, search]);

  const displayedPromises = filteredPromises.slice(0, displayCount);

  return (
    <div className="space-y-6">
      {/* Explorer Filter Bar */}
      <Card className="border border-stone-200 bg-white shadow-sm p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {t('title')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-stone-600">
              {t('subtitle')}
            </CardDescription>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-10 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-stone-50 text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              aria-label={t('searchPlaceholder')}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 min-h-[32px] min-w-[32px] flex items-center justify-center"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`min-h-[36px] px-3 py-1 rounded text-xs font-bold transition-colors ${
                  selectedStatus === 'ALL'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-stone-600 hover:text-ink'
                }`}
              >
                {t('allStatuses')}
              </button>
              <button
                onClick={() => setSelectedStatus('DELIVERED')}
                className={`min-h-[36px] px-3 py-1 rounded text-xs font-bold transition-colors ${
                  selectedStatus === 'DELIVERED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-ink'
                }`}
              >
                {locale === 'bn' ? 'বাস্তবায়িত' : 'Delivered'}
              </button>
              <button
                onClick={() => setSelectedStatus('UNDER_IMPLEMENTATION')}
                className={`min-h-[36px] px-3 py-1 rounded text-xs font-bold transition-colors ${
                  selectedStatus === 'UNDER_IMPLEMENTATION'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-ink'
                }`}
              >
                {locale === 'bn' ? 'চলমান' : 'In Progress'}
              </button>
            </div>

            {/* Category Select */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="min-h-[44px] appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                aria-label="Filter by sector or category"
              >
                <option value="ALL">{t('allCategories')}</option>
                {categories.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.icon} {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* District Filter Pill if active */}
            {selectedDistrictCode && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold">
                <span>{locale === 'bn' ? 'জেলা:' : 'District:'} {selectedDistrictCode}</span>
                <button
                  onClick={onClearDistrictFilter}
                  className="hover:text-red-700 min-h-[24px] min-w-[24px] flex items-center justify-center focus-visible:outline-none"
                  aria-label="Remove district filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Result Count */}
          <div className="text-xs font-semibold text-stone-500">
            {locale === 'bn' ? 'প্রদর্শিত:' : 'Showing'}{' '}
            <strong className="text-ink font-bold">{formatNum(displayedPromises.length)}</strong>{' '}
            {locale === 'bn' ? 'টির মধ্যে' : 'of'}{' '}
            <strong className="text-ink font-bold">{formatNum(filteredPromises.length)}</strong>{' '}
            {locale === 'bn' ? 'প্রতিশ্রুতি' : 'promises'}
          </div>
        </div>
      </Card>

      {/* Grid of Promise Cards */}
      {displayedPromises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedPromises.map((p) => (
            <PromiseCard
              key={p.code || p.id}
              promise={p}
              onOpenTimeline={setActiveTimelinePromise}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-2 border-stone-300 bg-stone-50/50">
          <Layers className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-ink">
            {t('noPromises')}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {locale === 'bn'
              ? 'অনুগ্রহ করে ভিন্ন কীওয়ার্ড বা ফিল্টার ব্যবহার করে পুনরায় চেষ্টা করুন।'
              : 'Try adjusting your search criteria, category selection, or district filters.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
              if (onClearDistrictFilter) onClearDistrictFilter();
            }}
            className="mt-4"
          >
            {locale === 'bn' ? 'সকল ফিল্টার মুছুন' : 'Reset All Filters'}
          </Button>
        </Card>
      )}

      {/* Load More Button */}
      {filteredPromises.length > displayedPromises.length && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setDisplayCount((prev) => prev + 12)}
            className="font-bold border-stone-300 hover:border-primary hover:text-primary min-h-[44px]"
          >
            {locale === 'bn' ? 'আরও প্রতিশ্রুতি দেখুন' : 'Load More Promises'}{' '}
            ({formatNum(filteredPromises.length - displayedPromises.length)}{' '}
            {locale === 'bn' ? 'বাকি' : 'remaining'})
          </Button>
        </div>
      )}

      {/* Timeline Modal */}
      {activeTimelinePromise && (
        <PromiseTimeline
          promise={activeTimelinePromise}
          onClose={() => setActiveTimelinePromise(null)}
        />
      )}
    </div>
  );
}
