import { NextResponse } from 'next/server';
import { buildLiveAnalyticsSummary } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const analytics = buildLiveAnalyticsSummary();
  return NextResponse.json(analytics);
}
