import { NextResponse } from 'next/server';
import { getLiveStore } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getLiveStore();
  return NextResponse.json(store.indicators);
}
