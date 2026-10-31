'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Factory, Briefcase, Wheat, Ship, Zap } from 'lucide-react';

export default function EconomicOverview() {
  const t = useTranslations('EconomicOverview');
  const locale = useLocale();

  const pillars = [
    {
      id: 'gsdp',
      title: t('gsdpGrowth'),
      current: '₹17.85L Cr',
      target2033: '₹85.0L Cr',
      target2047: '₹425.0L Cr',
      trend: '+11.8% YoY',
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-emerald-50',
      descEn: 'Two-phase GSDP expansion led by capital expenditure, port infrastructure, and industrial corridors.',
      descBn: 'মূলধনী ব্যয়, বন্দর পরিকাঠামো ও শিল্প করিডোরের দ্বারা পরিচালিত দ্বি-পর্যায়ের জিএসডিপি প্রবৃদ্ধি।',
    },
    {
      id: 'manufacturing',
      title: t('manufacturing'),
      current: '₹4.2L Cr',
      target2033: '₹22.0L Cr',
      target2047: '₹115.0L Cr',
      trend: '+14.2% YoY',
      icon: Factory,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      descEn: 'Dankuni-Amritsar freight corridor, Haldia petrochemical clusters, and defense-industrial parks.',
      descBn: 'ডানকুনি-অমৃতসর ফ্রেট করিডোর এবং হলদিয়া পেট্রোকেমিক্যাল ক্লাস্টার।',
    },
    {
      id: 'services',
      title: t('services'),
      current: '₹9.8L Cr',
      target2033: '₹44.0L Cr',
      target2047: '₹210.0L Cr',
      trend: '+15.8% YoY',
      icon: Briefcase,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      descEn: 'Silicon Valley New Town, BFSI fintech hubs, AI/GCC centers, and Siliguri IT hub.',
      descBn: 'সিলিকন ভ্যালি নিউ টাউন, বিএফএসআই ফিনটেক হাব এবং শিলিগুড়ি আইটি হাব।',
    },
    {
      id: 'maritime',
      title: locale === 'bn' ? 'সামুদ্রিক ও বন্দর অর্থনীতি' : 'Deep Sea Ports & Logistics',
      current: '₹1.1L Cr',
      target2033: '₹7.5L Cr',
      target2047: '₹42.0L Cr',
      trend: '+22.5% YoY',
      icon: Ship,
      color: 'text-cyan-700',
      bgColor: 'bg-cyan-50',
      descEn: 'Tajpur greenfield deep-sea port and Kulpi riverine expansion connecting ASEAN & East Asia.',
      descBn: 'তাজপুর গ্রিনফিল্ড বন্দর এবং আসিয়ান সংযুক্তকারী কুলপি নদীর বন্দর সম্প্রসারণ।',
    },
    {
      id: 'agriculture',
      title: t('agriculture'),
      current: '₹3.4L Cr',
      target2033: '₹8.5L Cr',
      target2047: '₹36.0L Cr',
      trend: '+8.6% YoY',
      icon: Wheat,
      color: 'text-amber-800',
      bgColor: 'bg-amber-50',
      descEn: 'Food processing parks, cold chain network, and Darjeeling organic tea value chain.',
      descBn: 'খাদ্য প্রক্রিয়াকরণ পার্ক, কোল্ড চেইন নেটওয়ার্ক এবং দার্জিলিং অর্গানিক চা ভ্যালু চেইন।',
    },
    {
      id: 'energy',
      title: locale === 'bn' ? 'বিদ্যুৎ ও গ্রিন এনার্জি মূলধন' : 'Clean Energy & Power Outlay',
      current: '₹0.85L Cr',
      target2033: '₹3.0L Cr',
      target2047: '₹22.0L Cr',
      trend: '+16.0% YoY',
      icon: Zap,
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
      descEn: 'Turga pumped storage, solar rooftop mission, and Haldia green hydrogen corridor.',
      descBn: 'তুর্গা পাম্পড স্টোরেজ, সোলার রুফটপ মিশন এবং গ্রিন হাইড্রোজেন করিডোর।',
    },
  ];

  return (
    <Card className="border border-stone-200 shadow-md bg-white">
      <CardHeader className="border-b border-stone-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900 uppercase tracking-wide">
                {locale === 'bn' ? 'ম্যাক্রোইকোনমিক সূচক (₹)' : 'Macro Indicators (₹ INR)'}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {locale === 'bn' ? 'অর্থনৈতিক স্তম্ভ' : '6 Economic Pillars'}
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-ink mt-1 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {t('title')}
            </CardTitle>
            <CardDescription className="text-sm text-stone-600">
              {t('subtitle')}
            </CardDescription>
          </div>

          <Badge variant="outline" className="self-start sm:self-auto font-semibold text-stone-700">
            {locale === 'bn' ? 'লক্ষ্যমাত্রা: ২০৩৩ ও ২০৪৭ (₹ লক্ষ কোটি)' : 'Targets: 2033 & 2047 (₹ Lakh Cr)'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">{item.title}</span>
                    <div className={`p-2 rounded-lg ${item.bgColor} ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
                    <div>
                      <div className="text-[10px] text-stone-500 font-semibold uppercase">
                        {locale === 'bn' ? 'বর্তমান' : 'Current'}
                      </div>
                      <div className="text-base font-black text-ink tabular-nums mt-0.5">{item.current}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-800 font-bold uppercase">
                        {locale === 'bn' ? '২০৩৩ লক্ষ্য' : '2033 Target'}
                      </div>
                      <div className="text-base font-extrabold text-primary tabular-nums mt-0.5">{item.target2033}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-amber-800 font-bold uppercase">
                        {locale === 'bn' ? '২০৪৭ লক্ষ্য' : '2047 Target'}
                      </div>
                      <div className="text-base font-extrabold text-amber-900 tabular-nums mt-0.5">{item.target2047}</div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px]">
                      {item.trend}
                    </span>
                    <span className="text-[11px] text-stone-500 font-normal">
                      {locale === 'bn' ? 'বার্ষিক বৃদ্ধি (₹)' : 'Annual Rupee Run Rate'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-600 leading-relaxed">
                  {locale === 'bn' ? item.descBn : item.descEn}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
