import { NextResponse } from 'next/server';
import { syncRealTimeSources } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export async function POST() {
  const summary = await syncRealTimeSources();
  return NextResponse.json(summary);
}
