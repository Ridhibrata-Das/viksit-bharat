import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@viksit/database';
import { getLiveStore } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

const START_TIME = Date.now();

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const store = getLiveStore();

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    environment: process.env.NODE_ENV || 'production',
    database: dbHealth,
    dataSummary: {
      promisesCount: store.promises.length,
      districtsCount: store.districts.length,
      evidenceCount: store.evidences.length,
      lastSyncedAt: store.lastSyncedAt,
      liveSyncMode: store.liveSyncMode,
    },
    version: '1.0.0',
  });
}
