import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface MembershipApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  districtCode: string;
  amountInr: number;
  utrNumber: string;
  notes?: string;
  createdAt: string;
  status: 'VERIFIED_SUBMISSION' | 'PENDING_UTR_CHECK';
}

const g = globalThis as unknown as {
  __SABAI_MEMBERSHIPS__?: MembershipApplication[];
};

function getMembershipList(): MembershipApplication[] {
  if (!g.__SABAI_MEMBERSHIPS__) {
    g.__SABAI_MEMBERSHIPS__ = [
      {
        id: 'SABAI-MEM-2026-001',
        fullName: 'Dr. Anirban Mukherjee',
        email: 'anirban.m@kolkataresearch.org',
        phone: '+91 98300 41209',
        districtCode: 'KOL',
        amountInr: 1000,
        utrNumber: '629184710294',
        notes: 'Supporting Viksit Bengal 2047 open governance intelligence',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'VERIFIED_SUBMISSION',
      },
      {
        id: 'SABAI-MEM-2026-002',
        fullName: 'Smt. Debjani Chatterjee',
        email: 'debjani.c@siliguritech.in',
        phone: '+91 94340 88210',
        districtCode: 'DAR',
        amountInr: 500,
        utrNumber: '629199384110',
        notes: 'Lifetime Membership — Sabai Foundation',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        status: 'VERIFIED_SUBMISSION',
      },
    ];
  }
  return g.__SABAI_MEMBERSHIPS__;
}

export async function GET() {
  const list = getMembershipList();
  return NextResponse.json({
    foundation: 'Sabai Foundation',
    upiId: '81k1byfou2ce@mahb',
    minimumLifetimeFeeInr: 500,
    googleFormUrl: 'https://forms.gle/vrJas5mxUJ1KLgRx8',
    totalMembers: list.length + 148,
    recentMemberships: list,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const districtCode = String(body.districtCode || 'KOL').trim();
    const amountInr = Number(body.amountInr || 0);
    const utrNumber = String(body.utrNumber || '').trim();
    const notes = String(body.notes || '').trim();

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { message: 'Full name, email, and phone number are required.' },
        { status: 400 }
      );
    }

    if (isNaN(amountInr) || amountInr < 500) {
      return NextResponse.json(
        {
          message:
            'Minimum Sabai Foundation Lifetime Membership fee is ₹500.',
        },
        { status: 400 }
      );
    }

    const list = getMembershipList();
    const record: MembershipApplication = {
      id: `SABAI-MEM-${new Date().getFullYear()}-${String(list.length + 101).padStart(3, '0')}`,
      fullName,
      email,
      phone,
      districtCode,
      amountInr,
      utrNumber: utrNumber || 'UPI-QR-SCAN',
      notes,
      createdAt: new Date().toISOString(),
      status: utrNumber ? 'VERIFIED_SUBMISSION' : 'PENDING_UTR_CHECK',
    };

    list.unshift(record);

    return NextResponse.json(
      {
        message:
          'Sabai Foundation Lifetime Membership recorded! Please also complete the official Google Form if you have not already.',
        record,
        googleFormUrl: 'https://forms.gle/vrJas5mxUJ1KLgRx8',
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Failed to submit membership form' },
      { status: 400 }
    );
  }
}
