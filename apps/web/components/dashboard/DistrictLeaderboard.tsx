'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Trophy, ArrowUpDown, Search, MapPin } from 'lucide-react';

interface DistrictItem {
  code: string;
  nameEn: string;
  nameBn: string;
  population?: number | null;
  gsdpContributionPercent?: number;
  deliveryScore?: number;
  activePromises?: number;
  zone?: string;
}

const DISTRICT_SEEDS: DistrictItem[] = [
  { code: 'KOL', nameEn: 'Kolkata', nameBn: 'কলকাতা', population: 4496694, gsdpContributionPercent: 18.4, deliveryScore: 42, activePromises: 18, zone: 'Greater Kolkata' },
  { code: 'N24', nameEn: 'North 24 Parganas', nameBn: 'উত্তর ২৪ পরগনা', population: 10009781, gsdpContributionPercent: 12.2, deliveryScore: 38, activePromises: 16, zone: 'Greater Kolkata' },
  { code: 'HWH', nameEn: 'Howrah', nameBn: 'হাওড়া', population: 4850029, gsdpContributionPercent: 8.6, deliveryScore: 35, activePromises: 14, zone: 'Greater Kolkata' },
  { code: 'HGY', nameEn: 'Hooghly', nameBn: 'হুগলি', population: 5519145, gsdpContributionPercent: 7.8, deliveryScore: 40, activePromises: 15, zone: 'Rarh Bengal' },
  { code: 'PMD', nameEn: 'Purba Medinipur', nameBn: 'পূর্ব মেদিনীপুর', population: 5095875, gsdpContributionPercent: 6.9, deliveryScore: 36, activePromises: 13, zone: 'Coastal' },
  { code: 'PBD', nameEn: 'Paschim Bardhaman', nameBn: 'পশ্চিম বর্ধমান', population: 2882031, gsdpContributionPercent: 6.5, deliveryScore: 39, activePromises: 12, zone: 'Rarh Bengal' },
  { code: 'DAR', nameEn: 'Darjeeling', nameBn: 'দার্জিলিং', population: 1846823, gsdpContributionPercent: 3.4, deliveryScore: 45, activePromises: 14, zone: 'North Bengal' },
  { code: 'JAL', nameEn: 'Jalpaiguri', nameBn: 'জলপাইগুড়ি', population: 2381596, gsdpContributionPercent: 3.2, deliveryScore: 33, activePromises: 10, zone: 'North Bengal' },
  { code: 'S24', nameEn: 'South 24 Parganas', nameBn: 'দক্ষিণ ২৪ পরগনা', population: 8161961, gsdpContributionPercent: 5.8, deliveryScore: 31, activePromises: 11, zone: 'Coastal' },
  { code: 'MUR', nameEn: 'Murshidabad', nameBn: 'মুর্শিদাবাদ', population: 7103808, gsdpContributionPercent: 4.5, deliveryScore: 28, activePromises: 10, zone: 'Central' },
  { code: 'NAD', nameEn: 'Nadia', nameBn: 'নদিয়া', population: 5167600, gsdpContributionPercent: 4.2, deliveryScore: 34, activePromises: 12, zone: 'Central' },
  { code: 'PUR', nameEn: 'Purulia', nameBn: 'পুরুলিয়া', population: 2930115, gsdpContributionPercent: 2.3, deliveryScore: 32, activePromises: 9, zone: 'Junglemahal' },
  { code: 'BNK', nameEn: 'Bankura', nameBn: 'বাঁকুড়া', population: 3596674, gsdpContributionPercent: 2.7, deliveryScore: 30, activePromises: 8, zone: 'Junglemahal' },
  { code: 'MAL', nameEn: 'Malda', nameBn: 'মালদা', population: 3988845, gsdpContributionPercent: 3.0, deliveryScore: 29, activePromises: 8, zone: 'North Bengal' },
  { code: 'ALB', nameEn: 'Alipurduar', nameBn: 'আলিপুরদুয়ার', population: 1491250, gsdpContributionPercent: 1.8, deliveryScore: 35, activePromises: 7, zone: 'North Bengal' },
  { code: 'COB', nameEn: 'Cooch Behar', nameBn: 'কোচবিহার', population: 2819086, gsdpContributionPercent: 2.1, deliveryScore: 27, activePromises: 6, zone: 'North Bengal' },
  { code: 'BIR', nameEn: 'Birbhum', nameBn: 'বীরভূম', population: 3502404, gsdpContributionPercent: 2.5, deliveryScore: 31, activePromises: 8, zone: 'Rarh Bengal' },
  { code: 'EBD', nameEn: 'Purba Bardhaman', nameBn: 'পূর্ব বর্ধমান', population: 4835532, gsdpContributionPercent: 5.1, deliveryScore: 37, activePromises: 11, zone: 'Rarh Bengal' },
  { code: 'PWM', nameEn: 'Paschim Medinipur', nameBn: 'পশ্চিম মেদিনীপুর', population: 5913457, gsdpContributionPercent: 4.0, deliveryScore: 32, activePromises: 9, zone: 'Junglemahal' },
  { code: 'JHG', nameEn: 'Jhargram', nameBn: 'ঝাড়গ্রাম', population: 1136548, gsdpContributionPercent: 1.2, deliveryScore: 34, activePromises: 6, zone: 'Junglemahal' },
  { code: 'KLP', nameEn: 'Kalimpong', nameBn: 'কালিম্পং', population: 251642, gsdpContributionPercent: 0.6, deliveryScore: 41, activePromises: 5, zone: 'North Bengal' },
  { code: 'UDI', nameEn: 'Uttar Dinajpur', nameBn: 'উত্তর দিনাজপুর', population: 3007134, gsdpContributionPercent: 1.9, deliveryScore: 26, activePromises: 5, zone: 'North Bengal' },
  { code: 'DDI', nameEn: 'Dakshin Dinajpur', nameBn: 'দক্ষিণ দিনাজপুর', population: 1676276, gsdpContributionPercent: 1.3, deliveryScore: 28, activePromises: 5, zone: 'North Bengal' },
];

export function DistrictLeaderboard({ locale }: { locale: string }) {
  const isBn = locale === 'bn';
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');

  const filtered = DISTRICT_SEEDS.filter((d) => {
    const matchSearch =
      d.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      d.nameBn.includes(search) ||
      d.code.toLowerCase().includes(search.toLowerCase());
    const matchZone = selectedZone === 'ALL' || d.zone === selectedZone;
    return matchSearch && matchZone;
  }).sort((a, b) => (b.deliveryScore || 0) - (a.deliveryScore || 0));

  const zones = ['ALL', 'North Bengal', 'Greater Kolkata', 'Rarh Bengal', 'Junglemahal', 'Coastal'];

  return (
    <Card className="w-full my-8 border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {isBn ? '২৩টি জেলার দায়বদ্ধতা ও বাস্তবায়ন সূচক' : '23-District Accountability & Delivery Index'}
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-slate-500 mt-1">
              {isBn
                ? 'প্রতিশ্রুতি বাস্তবায়ন হার, জনসংখ্যা এবং জিএসডিপি অবদানের ভিত্তিতে জেলার অবস্থান'
                : 'Comparative ranking of district delivery milestones, economic output, and governance responsiveness.'}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isBn ? 'জেলা খুঁজুন...' : 'Search district...'}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
              />
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z === 'ALL' ? (isBn ? 'সকল অঞ্চল' : 'All Zones') : z}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" aria-label="District Delivery Leaderboard">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">{isBn ? 'স্থান' : 'Rank'}</th>
                <th className="py-3 px-4">{isBn ? 'জেলা' : 'District'}</th>
                <th className="py-3 px-4">{isBn ? 'অঞ্চল' : 'Zone'}</th>
                <th className="py-3 px-4">{isBn ? 'বাস্তবায়ন স্কোর' : 'Delivery Rate'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'জিএসডিপি অবদান' : 'GSDP Share'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'সক্রিয় প্রতিশ্রুতি' : 'Active Promises'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200 text-xs md:text-sm">
              {filtered.map((d, idx) => (
                <tr key={d.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-center font-bold">
                    {idx < 3 ? (
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                          idx === 0 ? 'bg-amber-500 shadow-sm' : idx === 1 ? 'bg-slate-400' : 'bg-amber-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    ) : (
                      <span className="text-slate-500">#{idx + 1}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{isBn ? d.nameBn : d.nameEn}</span>
                      <span className="text-[11px] font-mono text-slate-400">({d.code})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                    {d.zone}
                  </td>
                  <td className="py-3 px-4 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{d.deliveryScore}%</span>
                        <span className="text-slate-400">{isBn ? 'অগ্রগতি' : 'track'}</span>
                      </div>
                      <Progress value={d.deliveryScore} className="h-1.5" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {d.gsdpContributionPercent}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant="outline" className="font-mono text-xs">
                      {d.activePromises} {isBn ? 'টি' : 'goals'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
