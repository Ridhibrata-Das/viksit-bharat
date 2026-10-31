import { NextResponse } from 'next/server';
import { buildDailyTallyMetrics } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tally = buildDailyTallyMetrics();
  return NextResponse.json(tally);
}
