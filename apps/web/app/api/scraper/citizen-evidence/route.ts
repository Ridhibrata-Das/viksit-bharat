import { NextRequest, NextResponse } from 'next/server';
import { getLiveStore } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const promiseCode = (body.promiseCode || 'INFRA-01').trim().toUpperCase();
    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json({ message: 'Evidence title is required' }, { status: 400 });
    }

    const store = getLiveStore();
    const matchedPromise = store.promises.find(
      (p) => p.code?.toUpperCase() === promiseCode || p.id === promiseCode
    );

    const newEvidence = {
      id: `ev-citizen-${Date.now()}`,
      title,
      titleBn: title,
      url: body.sourceUrl || 'https://wb.gov.in/citizen-verification',
      sourceUrl: body.sourceUrl || 'https://wb.gov.in/citizen-verification',
      publisher: body.submitterEmail
        ? `Citizen Verification (${body.submitterEmail})`
        : 'Citizen Ground Observation Desk',
      sourceType: 'USER_SUBMITTED',
      sourceTier: 'TIER_3' as const,
      extractedText: body.excerpt || `Ground report submitted for [${promiseCode}]: ${title}`,
      extractedTextBn: body.excerpt || `মাঠ পর্যায়ের নাগরিক প্রতিবেদন [${promiseCode}]: ${title}`,
      publishedAt: new Date().toISOString(),
      matchedPromiseCode: matchedPromise ? matchedPromise.code : promiseCode,
      matchedPromiseTitle: matchedPromise ? matchedPromise.titleEn : `Policy Commitment ${promiseCode}`,
      matchedPromiseTitleBn: matchedPromise ? matchedPromise.titleBn : `নীতিগত প্রতিশ্রুতি ${promiseCode}`,
      previousStatus: matchedPromise ? matchedPromise.status : 'ANNOUNCED',
      proposedStatus: 'UNDER_IMPLEMENTATION',
      districtCode: body.districtCode || 'KOL',
      districtNameEn: 'West Bengal Field Desk',
      districtNameBn: 'পশ্চিমবঙ্গ মাঠ পর্যায়',
      outlayCr: 85,
      confidenceScore: 0.88,
      reviewStatus: 'PENDING' as const,
      isLiveWebFetched: false,
    };

    store.evidences.unshift(newEvidence);
    if (matchedPromise) {
      matchedPromise.evidenceItems = [
        {
          id: newEvidence.id,
          title: newEvidence.title,
          sourceType: newEvidence.sourceType,
          sourceTier: newEvidence.sourceTier,
          url: newEvidence.sourceUrl,
          extractedText: newEvidence.extractedText,
          verifiedAt: new Date().toISOString().slice(0, 10),
        },
        ...(matchedPromise.evidenceItems || []),
      ];
    }

    return NextResponse.json({
      success: true,
      evidenceId: newEvidence.id,
      message: 'Citizen ground evidence logged and added to live verification feed.',
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Invalid payload' }, { status: 400 });
  }
}
