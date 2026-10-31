import { NextRequest, NextResponse } from 'next/server';
import { getLiveStore } from '@/lib/live-store';
import { authenticateApiRequest } from '@/lib/auth-guard';
import { prisma } from '@viksit/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const store = getLiveStore();
  const { searchParams } = new URL(req.url);
  const promiseId = searchParams.get('promiseId') || searchParams.get('matchedPromiseCode');
  const reviewStatus = searchParams.get('reviewStatus');

  let results = store.evidences;
  if (promiseId) {
    results = results.filter(
      (e) =>
        e.matchedPromiseCode?.toUpperCase() === promiseId.toUpperCase() ||
        e.id === promiseId
    );
  }
  if (reviewStatus) {
    results = results.filter((e) => e.reviewStatus === reviewStatus.toUpperCase());
  }

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateApiRequest(req, ['ADMIN', 'RESEARCHER']);
    if (!auth.authorized) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const title = (body.title || '').trim();
    if (!title) {
      return NextResponse.json({ message: 'Evidence title is required' }, { status: 400 });
    }

    const isResearcher = auth.user?.role?.toUpperCase() === 'RESEARCHER';
    const reviewStatus = isResearcher ? 'PENDING' : 'APPROVED';

    const store = getLiveStore();
    const promiseCode = (body.promiseCode || 'INFRA-01').toUpperCase();
    const matchedPromise =
      store.promises.find((p) => p.code?.toUpperCase() === promiseCode) || store.promises[0];

    const created = {
      id: `ev-${isResearcher ? 'res' : 'admin'}-${Date.now()}`,
      title,
      titleBn: body.titleBn || title,
      url: body.url || body.sourceUrl || 'https://wb.gov.in/gazette',
      sourceUrl: body.url || body.sourceUrl || 'https://wb.gov.in/gazette',
      publisher: body.publisher || (isResearcher ? 'Policy Researcher Field Submission' : 'Official State Gazette / Audit Cell'),
      sourceType: body.sourceType || 'GAZETTE',
      sourceTier: (body.sourceTier || 'TIER_1') as 'TIER_1' | 'TIER_2' | 'TIER_3',
      extractedText: body.extractedText || title,
      extractedTextBn: body.extractedTextBn || title,
      publishedAt: new Date().toISOString(),
      matchedPromiseCode: matchedPromise?.code || promiseCode,
      matchedPromiseTitle: matchedPromise?.titleEn || 'State Infrastructure Commitment',
      matchedPromiseTitleBn: matchedPromise?.titleBn || 'রাজ্য পরিকাঠামো প্রতিশ্রুতি',
      previousStatus: matchedPromise?.status || 'ANNOUNCED',
      proposedStatus: body.proposedStatus || 'UNDER_IMPLEMENTATION',
      districtCode: body.districtCode || 'KOL',
      districtNameEn: 'Kolkata',
      districtNameBn: 'কলকাতা',
      outlayCr: Number(body.outlayCr) || 320,
      confidenceScore: isResearcher ? 0.88 : 0.97,
      reviewStatus: reviewStatus as 'PENDING' | 'APPROVED',
      isLiveWebFetched: false,
    };

    store.evidences.unshift(created);
    if (matchedPromise && reviewStatus === 'APPROVED') {
      matchedPromise.status = created.proposedStatus;
      matchedPromise.evidenceItems = [
        {
          id: created.id,
          title: created.title,
          sourceType: created.sourceType,
          sourceTier: created.sourceTier,
          url: created.sourceUrl,
          extractedText: created.extractedText,
          verifiedAt: new Date().toISOString().slice(0, 10),
        },
        ...(matchedPromise.evidenceItems || []),
      ];
      matchedPromise.statusHistory = [
        ...(matchedPromise.statusHistory || []),
        {
          id: `hist-${Date.now()}`,
          status: created.proposedStatus,
          reason: `Verified via ${created.sourceTier} (${created.sourceType}): ${created.title}`,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    // Persist into MySQL database if active
    try {
      await prisma.evidenceItem.create({
        data: {
          title: created.title,
          sourceUrl: created.sourceUrl,
          publisher: created.publisher,
          sourceType: created.sourceType as any,
          sourceTier: created.sourceTier as any,
          extractedText: created.extractedText,
        },
      });
    } catch {
      // Handled by in-memory live store
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to submit evidence' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = authenticateApiRequest(req, ['ADMIN']);
    if (!auth.authorized) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { id, reviewStatus } = body;
    const store = getLiveStore();
    const ev = store.evidences.find((e) => e.id === id);
    if (!ev) {
      return NextResponse.json({ message: 'Evidence item not found' }, { status: 404 });
    }

    ev.reviewStatus = reviewStatus === 'REJECTED' ? 'REJECTED' : 'APPROVED';
    return NextResponse.json(ev);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update review status' }, { status: 400 });
  }
}
