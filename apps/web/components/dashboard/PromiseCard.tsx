'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, FileText, ChevronRight, Building, Award } from 'lucide-react';
import { toBengaliNumerals } from '@viksit/shared';

export interface PromiseData {
  id: string;
  code: string;
  titleEn: string;
  titleBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  status: string;
  confidence?: string;
  category?: {
    code?: string;
    titleEn?: string;
    titleBn?: string;
    icon?: string;
  };
  responsibleDepartment?: string;
  statusHistory?: any[];
  evidenceItems?: any[];
}

interface PromiseCardProps {
  promise: PromiseData;
  onOpenTimeline?: (promise: PromiseData) => void;
}

const STATUS_CONFIG: Record<string, { labelEn: string; labelBn: string; variant: 'default' | 'success' | 'warning' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  DELIVERED: { labelEn: 'Delivered', labelBn: 'বাস্তবায়িত', variant: 'success', icon: CheckCircle2 },
  UNDER_IMPLEMENTATION: { labelEn: 'Under Implementation', labelBn: 'চলমান বাস্তবায়ন', variant: 'warning', icon: Clock },
  ANNOUNCED: { labelEn: 'Announced', labelBn: 'ঘোষিত', variant: 'secondary', icon: AlertCircle },
  FUNDED: { labelEn: 'Funded', labelBn: 'অর্থ বরাদ্দ', variant: 'default', icon: Award },
  NOT_STARTED: { labelEn: 'Not Started', labelBn: 'শুরু হয়নি', variant: 'outline', icon: Clock },
  DELAYED: { labelEn: 'Delayed', labelBn: 'বিলম্বিত', variant: 'destructive', icon: AlertCircle },
};

export default function PromiseCard({ promise, onOpenTimeline }: PromiseCardProps) {
  const locale = useLocale();

  const statusKey = (promise.status || 'NOT_STARTED').toUpperCase();
  const statusInfo = STATUS_CONFIG[statusKey] || {
    labelEn: promise.status || 'Not Started',
    labelBn: 'অজ্ঞাত',
    variant: 'secondary' as const,
    icon: Clock,
  };
  const StatusIcon = statusInfo.icon;

  const title = locale === 'bn' ? (promise.titleBn || promise.titleEn) : promise.titleEn;
  const description = locale === 'bn' ? (promise.descriptionBn || promise.descriptionEn) : promise.descriptionEn;
  const catTitle = promise.category
    ? (locale === 'bn' ? (promise.category.titleBn || promise.category.titleEn) : promise.category.titleEn)
    : (locale === 'bn' ? 'সাধারণ' : 'General');

  return (
    <Card className="h-full flex flex-col justify-between border border-stone-200 hover:border-emerald-300 transition-all hover:shadow-md bg-white">
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base" role="img" aria-label="category icon">
              {promise.category?.icon || '🏛️'}
            </span>
            <span className="text-xs font-bold text-stone-600 truncate max-w-[160px]">
              {catTitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-bold">
              {promise.code}
            </span>
            <Badge variant={statusInfo.variant} className="text-[10px] py-0.5 font-bold flex items-center gap-1">
              <StatusIcon className="w-2.5 h-2.5" />
              {locale === 'bn' ? statusInfo.labelBn : statusInfo.labelEn}
            </Badge>
          </div>
        </div>

        <h3 className="text-base font-bold text-ink leading-snug line-clamp-2">
          {title}
        </h3>
      </CardHeader>

      <CardContent className="p-4 pt-1 flex-1">
        {description && (
          <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
            {description}
          </p>
        )}

        {promise.responsibleDepartment && (
          <div className="mt-3 flex items-center gap-1 text-[11px] text-stone-500 font-medium">
            <Building className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">{promise.responsibleDepartment}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-2 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <span className="font-semibold text-[11px] text-stone-600">
            {locale === 'bn' ? 'বিশ্বাসযোগ্যতা:' : 'Confidence:'}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-primary border border-stone-200">
            Tier {promise.confidence || 'C'}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenTimeline && onOpenTimeline(promise)}
          className="text-xs font-semibold hover:bg-emerald-50 hover:text-primary flex items-center gap-1"
          aria-label={`View timeline and evidence for ${promise.code}`}
        >
          <FileText className="w-3 h-3" />
          {locale === 'bn' ? 'প্রমাণ ও টাইমলাইন' : 'Evidence & Trail'}
          <ChevronRight className="w-3 h-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
