import { NextRequest, NextResponse } from 'next/server';
import { buildLiveAnalyticsSummary } from '@/lib/live-store';
import {
  generateDistrictCsvContent,
  generateDistrictPdfBytes,
} from '@/lib/district-report-exporter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get('format') || 'csv').toLowerCase();
  const zone = searchParams.get('zone') || 'ALL';
  const sortBy = (searchParams.get('sortBy') || 'deliveryScore') as
    | 'deliveryScore'
    | 'gsdpSharePct'
    | 'outlayCr'
    | 'perCapitaInr';

  const analytics = buildLiveAnalyticsSummary();
  const dateKey = new Date().toISOString().slice(0, 10);
  const zoneSlug =
    zone === 'ALL'
      ? 'all-23-districts'
      : zone.toLowerCase().replace(/\s+/g, '-');

  if (format === 'pdf') {
    const pdfBytes = generateDistrictPdfBytes(analytics, zone, sortBy);
    const filename = `viksit-bengal-${zoneSlug}-audit-report-${dateKey}.pdf`;
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  const csvContent = generateDistrictCsvContent(analytics, zone, sortBy);
  const filename = `viksit-bengal-${zoneSlug}-performance-${dateKey}.csv`;
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
