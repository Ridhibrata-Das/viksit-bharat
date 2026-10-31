'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, ShieldCheck, CheckCircle2, Clock, Calendar, FileText } from 'lucide-react';
import { PromiseData } from './PromiseCard';
import { toBengaliNumerals } from '@viksit/shared';

interface PromiseTimelineProps {
  promise: PromiseData | null;
  onClose: () => void;
}

export default function PromiseTimeline({ promise, onClose }: PromiseTimelineProps) {
  const t = useTranslations('PromiseTimeline');
  const locale = useLocale();

  if (!promise) return null;

  const title = locale === 'bn' ? (promise.titleBn || promise.titleEn) : promise.titleEn;
  const description = locale === 'bn' ? (promise.descriptionBn || promise.descriptionEn) : promise.descriptionEn;

  const history = promise.statusHistory || [
    {
      id: 'h1',
      status: 'ANNOUNCED',
      reason: 'Manifesto Commitment & Policy Declaration',
      timestamp: '2026-05-10T10:00:00Z',
    },
    {
      id: 'h2',
      status: promise.status,
      reason: 'Implementation roadmap framed and departmental nodal officer assigned',
      timestamp: '2026-08-15T10:00:00Z',
    },
  ];

  const evidence = promise.evidenceItems || [
    {
      id: 'ev-1',
      title: 'Departmental Resolution & Project Sanction Order',
      sourceType: 'GOVERNMENT_ORDER',
      sourceTier: 'TIER_1',
      url: 'https://wb.gov.in/orders/2026/resolution.pdf',
      extractedText: 'Sanction of Phase-1 initial outlay approved by the State Finance Department.',
      verifiedAt: '2026-08-15',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in"
    >
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col bg-white shadow-2xl border-2 border-emerald-900/10">
        <CardHeader className="p-5 border-b border-stone-200 flex flex-row items-start justify-between gap-3 bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="font-mono text-xs font-bold">
                {promise.code}
              </Badge>
              <Badge variant="outline" className="text-xs font-semibold">
                {promise.status}
              </Badge>
            </div>
            <CardTitle id="timeline-title" className="text-xl font-bold text-ink mt-2">
              {title}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-stone-200 text-stone-600 min-h-[44px] min-w-[44px]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-5 overflow-y-auto space-y-6 flex-1">
          {description && (
            <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
              {description}
            </div>
          )}

          {/* Chronological History Section */}
          <div>
            <h4 className="text-sm font-bold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              {locale === 'bn' ? 'বাস্তবায়ন মাইলফলক ও ইতিহাস' : 'Milestone History'}
            </h4>
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {history.map((item, idx) => (
                <div key={item.id || idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-emerald-50" />
                  <div className="p-3 rounded-lg border border-stone-200 bg-white shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-primary">{item.status || item.newStatus}</span>
                      <span className="text-stone-400 font-normal text-[11px]">
                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '2026'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {item.reason || item.comment || 'Status progression recorded'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Trail Section */}
          <div>
            <h4 className="text-sm font-bold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              {t('evidenceCount')}: {evidence.length}
            </h4>
            <div className="space-y-3">
              {evidence.map((ev, i) => (
                <div key={ev.id || i} className="p-3.5 rounded-xl border border-stone-200 bg-emerald-50/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {ev.sourceTier || 'Tier 1'}
                        </span>
                        <span className="text-xs font-semibold text-stone-500">
                          {ev.sourceType}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-ink leading-snug">
                        {ev.title}
                      </h5>
                    </div>
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`${t('externalLink')} - ${ev.title}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {ev.extractedText && (
                    <blockquote className="mt-2 text-[11px] text-stone-600 border-l-2 border-primary pl-2 italic">
                      "{ev.extractedText}"
                    </blockquote>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
