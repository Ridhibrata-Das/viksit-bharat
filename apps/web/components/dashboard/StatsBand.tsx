'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, MapPin, FileCheck2, ListTodo } from 'lucide-react';
import { toBengaliNumerals } from '@viksit/shared';

interface StatsBandProps {
  totalPromises?: number;
  deliveredCount?: number;
  inProgressCount?: number;
  districtsCount?: number;
  evidenceCount?: number;
}

export default function StatsBand({
  totalPromises = 141,
  deliveredCount = 12,
  inProgressCount = 48,
  districtsCount = 23,
  evidenceCount = 28,
}: StatsBandProps) {
  const t = useTranslations('StatsBand');
  const locale = useLocale();

  const formatNum = (val: number | string) => {
    return locale === 'bn' ? toBengaliNumerals(val) : String(val);
  };

  const stats = [
    {
      id: 'total',
      label: t('totalPromises'),
      value: formatNum(totalPromises),
      icon: ListTodo,
      color: 'text-stone-900',
      bgColor: 'bg-stone-100',
      borderColor: 'border-stone-300',
      badgeText: locale === 'bn' ? 'মোট ট্র্যাকড' : 'Monitored',
    },
    {
      id: 'delivered',
      label: t('completedPromises'),
      value: formatNum(deliveredCount),
      icon: CheckCircle2,
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      badgeText: locale === 'bn' ? 'সম্পন্ন' : 'Delivered',
    },
    {
      id: 'in-progress',
      label: t('inProgressPromises'),
      value: formatNum(inProgressCount),
      icon: Clock,
      color: 'text-amber-800',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      badgeText: locale === 'bn' ? 'চলমান' : 'In Progress',
    },
    {
      id: 'districts',
      label: t('districtsCovered'),
      value: formatNum(districtsCount),
      icon: MapPin,
      color: 'text-primary',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      badgeText: locale === 'bn' ? '২৩টি জেলা' : '23 Districts',
    },
    {
      id: 'evidence',
      label: locale === 'bn' ? 'যাচাইকৃত নথি ও প্রমাণ' : 'Verified Evidence',
      value: formatNum(evidenceCount),
      icon: FileCheck2,
      color: 'text-blue-900',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      badgeText: locale === 'bn' ? 'গেজেট ও অডিট' : 'CAG / Gazette',
    },
  ];

  return (
    <section aria-label={t('title')} className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              className={`p-4 transition-all duration-200 border ${item.borderColor} hover:shadow-md bg-white flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  {item.badgeText}
                </span>
                <div className={`p-2 rounded-lg ${item.bgColor} ${item.color}`}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-3xl font-black tracking-tight ${item.color}`}>
                  {item.value}
                </div>
                <div className="text-xs font-semibold text-stone-700 mt-1 leading-snug">
                  {item.label}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
