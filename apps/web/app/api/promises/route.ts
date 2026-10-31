import { NextRequest, NextResponse } from 'next/server';
import { getLiveStore, getIstDateKey } from '@/lib/live-store';
import { authenticateApiRequest } from '@/lib/auth-guard';
import { prisma } from '@viksit/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const store = getLiveStore();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const district = searchParams.get('district');

  let results = store.promises;
  if (status) {
    results = results.filter((p) => p.status?.toUpperCase() === status.toUpperCase());
  }
  if (category) {
    results = results.filter((p) => p.category?.code === category);
  }
  if (district) {
    results = results.filter((p) =>
      p.districts?.some((d: any) => d.districtCode?.toUpperCase() === district.toUpperCase())
    );
  }

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateApiRequest(req, ['ADMIN']);
    if (!auth.authorized) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const code = (body.code || `INFRA-${Date.now().toString().slice(-2)}`).trim().toUpperCase();
    const titleEn = (body.titleEn || '').trim();
    const titleBn = (body.titleBn || titleEn).trim();

    if (!titleEn) {
      return NextResponse.json({ message: 'titleEn is required' }, { status: 400 });
    }

    const store = getLiveStore();
    const newPromise = {
      id: `promise-${code.toLowerCase()}-${Date.now()}`,
      code,
      titleEn,
      titleBn,
      descriptionEn: body.descriptionEn || titleEn,
      descriptionBn: body.descriptionBn || titleBn,
      status: (body.status || 'ANNOUNCED').toUpperCase(),
      confidence: 'A',
      isKeyPromise: true,
      category: {
        code: body.categoryCode || 'infrastructure',
        titleEn: 'Infrastructure & Connectivity',
        titleBn: 'পরিকাঠামো ও যোগাযোগ',
        icon: '🛣️',
      },
      responsibleDepartment: 'Public Works & Infrastructure Directorate, Govt of WB',
      districts: [{ districtCode: body.districtCode || 'KOL' }],
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          status: (body.status || 'ANNOUNCED').toUpperCase(),
          reason: 'Registered via Administrative CMS Governance Portal',
          timestamp: new Date().toISOString(),
        },
      ],
      evidenceItems: [
        {
          id: `ev-${Date.now()}`,
          title: `Cabinet Administrative Registration for ${code}: ${titleEn}`,
          sourceType: 'GAZETTE',
          sourceTier: 'TIER_1',
          url: 'https://wb.gov.in/gazette',
          extractedText: body.descriptionEn || titleEn,
          verifiedAt: getIstDateKey(0),
        },
      ],
    };

    store.promises.unshift(newPromise);
    store.evidences.unshift({
      id: `ev-cms-${Date.now()}`,
      title: `State Catalog Registration [${code}]: ${titleEn}`,
      titleBn: `রাজ্য প্রতিশ্রুতি তালিকায় নতুন নিবন্ধন [${code}]: ${titleBn}`,
      url: 'https://wb.gov.in/gazette',
      sourceUrl: 'https://wb.gov.in/gazette',
      publisher: 'State Cabinet Secretariat (CMS)',
      sourceType: 'GAZETTE',
      sourceTier: 'TIER_1',
      extractedText: body.descriptionEn || titleEn,
      extractedTextBn: body.descriptionBn || titleBn,
      publishedAt: new Date().toISOString(),
      matchedPromiseCode: code,
      matchedPromiseTitle: titleEn,
      matchedPromiseTitleBn: titleBn,
      previousStatus: 'NOT_STARTED',
      proposedStatus: newPromise.status,
      districtCode: body.districtCode || 'KOL',
      districtNameEn: 'Kolkata',
      districtNameBn: 'কলকাতা',
      outlayCr: Number(body.outlayCr) || 500,
      confidenceScore: 0.99,
      reviewStatus: 'APPROVED',
      isLiveWebFetched: false,
    });

    // Also persist into MySQL database when active
    try {
      await prisma.promise.create({
        data: {
          code: newPromise.code,
          titleEn: newPromise.titleEn,
          titleBn: newPromise.titleBn,
          descriptionEn: newPromise.descriptionEn,
          descriptionBn: newPromise.descriptionBn,
          status: newPromise.status as any,
          confidence: 'A',
          isKeyPromise: true,
          categoryId: 'cat-infra-01',
        },
      });
    } catch {
      // In-memory store already updated
    }

    return NextResponse.json(newPromise, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to create promise' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = authenticateApiRequest(req, ['ADMIN']);
    if (!auth.authorized) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const code = (body.code || '').trim().toUpperCase();
    const status = (body.status || '').trim().toUpperCase();
    const outlayCr = Number(body.outlayCr) || 0;
    const reason = (body.reason || `Status transitioned to ${status} via Administrative CMS Portal`).trim();

    if (!code || !status) {
      return NextResponse.json({ message: 'Both code and status are required' }, { status: 400 });
    }

    const store = getLiveStore();
    const target = store.promises.find((p) => p.code?.toUpperCase() === code);
    if (!target) {
      return NextResponse.json({ message: `Promise ${code} not found` }, { status: 404 });
    }

    const previousStatus = target.status || 'ANNOUNCED';
    target.status = status;
    target.statusHistory = [
      ...(target.statusHistory || []),
      {
        id: `hist-${Date.now()}`,
        status,
        reason,
        timestamp: new Date().toISOString(),
      },
    ];

    if (outlayCr > 0 || previousStatus !== status) {
      store.evidences.unshift({
        id: `ev-status-${Date.now()}`,
        title: `CMS Lifecycle Update [${code}]: ${target.titleEn} → ${status}`,
        titleBn: `সিএমএস স্ট্যাটাস আপডেট [${code}]: ${target.titleBn || target.titleEn} → ${status}`,
        url: 'https://wb.gov.in/orders',
        sourceUrl: 'https://wb.gov.in/orders',
        publisher: 'State Governance CMS Audit Cell',
        sourceType: 'GOVERNMENT_ORDER',
        sourceTier: 'TIER_1',
        extractedText: reason,
        extractedTextBn: reason,
        publishedAt: new Date().toISOString(),
        matchedPromiseCode: code,
        matchedPromiseTitle: target.titleEn,
        matchedPromiseTitleBn: target.titleBn || target.titleEn,
        previousStatus,
        proposedStatus: status,
        districtCode: target.districts?.[0]?.districtCode || 'KOL',
        districtNameEn: 'Kolkata',
        districtNameBn: 'কলকাতা',
        outlayCr: outlayCr > 0 ? outlayCr : 280,
        confidenceScore: 0.98,
        reviewStatus: 'APPROVED',
        isLiveWebFetched: false,
      });
    }

    return NextResponse.json(target);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update promise status' }, { status: 400 });
  }
}
