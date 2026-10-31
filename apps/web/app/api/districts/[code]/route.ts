import { NextRequest, NextResponse } from 'next/server';
import { getLiveStore } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = (params?.code || '').trim().toUpperCase();
  const store = getLiveStore();

  const district = store.districts.find((d: any) => d.code?.toUpperCase() === code);
  if (!district) {
    return NextResponse.json(
      { message: `District with code '${code}' not found` },
      { status: 404 }
    );
  }

  // Correlate district promises & evidences
  const associatedPromises = store.promises.filter((p: any) =>
    p.districts?.some((pd: any) => pd.districtCode?.toUpperCase() === code)
  );

  const associatedEvidences = store.evidences.filter(
    (e: any) => e.districtCode?.toUpperCase() === code
  );

  return NextResponse.json({
    ...district,
    promises: associatedPromises,
    evidences: associatedEvidences,
  });
}
