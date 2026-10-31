'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Table as TableIcon, Users, Percent, Award, ChevronRight } from 'lucide-react';
import { toBengaliNumerals } from '@viksit/shared';

export interface DistrictData {
  id: string;
  code: string;
  nameEn: string;
  nameBn: string;
  population?: number;
  area?: number;
  gsdpShare?: number;
  promiseCount?: number;
  lat?: number;
  lng?: number;
}

const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  APD: { lat: 26.4919, lng: 89.5271 },
  BIR: { lat: 23.8402, lng: 87.6186 },
  BNK: { lat: 23.2324, lng: 87.0715 },
  COB: { lat: 26.3452, lng: 89.4482 },
  DAR: { lat: 27.0410, lng: 88.2663 },
  DDN: { lat: 25.2215, lng: 88.7653 },
  EBD: { lat: 23.2324, lng: 87.8615 },
  EMD: { lat: 21.9360, lng: 87.7788 },
  HOG: { lat: 22.8963, lng: 88.2461 },
  HOW: { lat: 22.5958, lng: 88.2636 },
  JAL: { lat: 26.5405, lng: 88.7196 },
  JHR: { lat: 22.4554, lng: 86.9972 },
  KAL: { lat: 27.0667, lng: 88.4667 },
  KOL: { lat: 22.5726, lng: 88.3639 },
  MLD: { lat: 25.0108, lng: 88.1411 },
  MSD: { lat: 24.1759, lng: 88.2802 },
  N24: { lat: 22.7210, lng: 88.4816 },
  NAD: { lat: 23.4710, lng: 88.5565 },
  PBD: { lat: 23.6889, lng: 86.9661 },
  PMD: { lat: 22.4257, lng: 87.3199 },
  PUR: { lat: 23.3321, lng: 86.3652 },
  S24: { lat: 22.1352, lng: 88.5414 },
  UDN: { lat: 25.6256, lng: 88.1256 },
};

interface DistrictMapProps {
  districts: DistrictData[];
  selectedDistrictCode?: string | null;
  onSelectDistrict?: (code: string | null) => void;
}

export default function DistrictMap({
  districts,
  selectedDistrictCode,
  onSelectDistrict,
}: DistrictMapProps) {
  const t = useTranslations('DistrictMap');
  const locale = useLocale();
  const [search, setSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'cards' | 'table'>('cards');

  const formatNum = (val: number | string | undefined) => {
    if (val === undefined || val === null) return '0';
    return locale === 'bn' ? toBengaliNumerals(val) : String(val);
  };

  const filteredDistricts = districts.filter((d) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      d.nameEn.toLowerCase().includes(q) ||
      d.nameBn.includes(q) ||
      d.code.toLowerCase().includes(q)
    );
  });

  const selectedDistrict = districts.find((d) => d.code === selectedDistrictCode);

  return (
    <Card className="border border-stone-200 shadow-md bg-white">
      <CardHeader className="border-b border-stone-100 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-primary uppercase tracking-wide">
                {locale === 'bn' ? '২৩টি জেলা' : '23 Districts'}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {locale === 'bn' ? 'ভৌগোলিক তথ্য' : 'West Bengal Geography'}
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-ink mt-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {t('title')}
            </CardTitle>
            <CardDescription className="text-sm text-stone-600">
              {t('subtitle')}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('searchDistrict')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-h-[44px] pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-stone-50 text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-60"
                aria-label={t('searchDistrict')}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="flex items-center gap-1.5 text-xs font-semibold"
              aria-label={viewMode === 'cards' ? 'Switch to accessible table view' : 'Switch to cards view'}
            >
              <TableIcon className="w-3.5 h-3.5" />
              {viewMode === 'cards' ? (locale === 'bn' ? 'তালিকা ভিউ' : 'Table View') : (locale === 'bn' ? 'কার্ড ভিউ' : 'Cards View')}
            </Button>
          </div>
        </div>

        {/* Selected District Highlight Banner */}
        {selectedDistrict && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-bold">
                {selectedDistrict.code}
              </Badge>
              <span className="font-bold text-emerald-950 text-sm">
                {locale === 'bn' ? selectedDistrict.nameBn : selectedDistrict.nameEn}
                <span className="font-normal text-xs text-emerald-800 ml-1.5">
                  ({locale === 'bn' ? selectedDistrict.nameEn : selectedDistrict.nameBn})
                </span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-emerald-900">
              <span>{t('population')}: {formatNum(((selectedDistrict.population || 4000000) / 100000).toFixed(1))} {locale === 'bn' ? 'লাখ' : 'Lakh'}</span>
              <span>{t('gsdpShare')}: {formatNum(selectedDistrict.gsdpShare || 5.5)}%</span>
              <span>{t('promisesCount')}: {formatNum(selectedDistrict.promiseCount || 6)}</span>
              <button
                onClick={() => onSelectDistrict && onSelectDistrict(null)}
                className="text-xs text-primary underline font-bold ml-2 focus-visible:outline-none"
              >
                {locale === 'bn' ? 'মুছুন' : 'Clear filter'}
              </button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredDistricts.map((d) => {
              const isSelected = selectedDistrictCode === d.code;
              return (
                <button
                  key={d.code}
                  onClick={() => onSelectDistrict && onSelectDistrict(isSelected ? null : d.code)}
                  className={`p-3 rounded-xl border text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? 'border-primary bg-emerald-50/80 shadow-md ring-1 ring-primary'
                      : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-stone-50'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${d.nameEn} (${d.nameBn}), ${d.promiseCount ?? 6} promises`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                      {d.code}
                    </span>
                    <span className="text-[11px] font-bold text-primary flex items-center gap-0.5">
                      <Award className="w-3 h-3" />
                      {formatNum(d.promiseCount ?? 6)}
                    </span>
                  </div>
                  <div className="mt-2 font-bold text-xs text-ink truncate">
                    {locale === 'bn' ? d.nameBn : d.nameEn}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {locale === 'bn' ? d.nameEn : d.nameBn}
                  </div>
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-600">
                    <span className="flex items-center gap-0.5">
                      <Percent className="w-2.5 h-2.5 text-stone-400" />
                      {formatNum(d.gsdpShare ?? 4.5)}% GSDP
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Accessible Table Fallback for Assistive Technologies & Screen Readers */
          <div className="overflow-x-auto max-h-[460px]">
            <table
              className="w-full text-left text-xs border-collapse"
              aria-label={t('tableFallbackTitle')}
            >
              <caption className="sr-only">{t('tableFallbackDescription')}</caption>
              <thead>
                <tr className="border-b-2 border-stone-300 bg-stone-100 text-stone-800 font-bold">
                  <th scope="col" className="p-2.5">{t('districtCode')}</th>
                  <th scope="col" className="p-2.5">{t('districtName')} (EN)</th>
                  <th scope="col" className="p-2.5">{t('districtName')} (BN)</th>
                  <th scope="col" className="p-2.5 text-right">{t('population')}</th>
                  <th scope="col" className="p-2.5 text-right">{t('gsdpShare')}</th>
                  <th scope="col" className="p-2.5 text-right">{t('promisesCount')}</th>
                  <th scope="col" className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistricts.map((d, i) => (
                  <tr
                    key={d.code}
                    className={`border-b border-stone-200 hover:bg-stone-50 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                    } ${selectedDistrictCode === d.code ? 'bg-emerald-50 font-bold' : ''}`}
                  >
                    <td className="p-2.5 font-mono font-bold text-primary">{d.code}</td>
                    <td className="p-2.5">{d.nameEn}</td>
                    <td className="p-2.5">{d.nameBn}</td>
                    <td className="p-2.5 text-right">{formatNum(((d.population || 4000000) / 100000).toFixed(1))} Lakh</td>
                    <td className="p-2.5 text-right">{formatNum(d.gsdpShare || 4.5)}%</td>
                    <td className="p-2.5 text-right font-bold text-primary">{formatNum(d.promiseCount ?? 6)}</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => onSelectDistrict && onSelectDistrict(d.code)}
                        className="px-2 py-1 rounded bg-stone-100 hover:bg-primary hover:text-white text-stone-800 font-semibold text-[11px] transition-colors"
                      >
                        {selectedDistrictCode === d.code ? 'Selected' : 'Filter'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
