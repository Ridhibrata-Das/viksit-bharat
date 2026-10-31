import { NextRequest, NextResponse } from 'next/server';
import { generateSocialPoster, POSTER_FORMATS, PosterFormat } from '@/lib/social-media/poster-generator';
import { buildLiveAnalyticsSummary } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { format: string } }
) {
  const formatParam = (params?.format || '').toLowerCase();
  let format: PosterFormat = POSTER_FORMATS.LANDSCAPE_1200x630;

  if (formatParam === 'square' || formatParam === '1080x1080') {
    format = POSTER_FORMATS.SQUARE_1080x1080;
  } else if (formatParam === 'story' || formatParam === '1080x1920' || formatParam === 'vertical') {
    format = POSTER_FORMATS.STORY_1080x1920;
  }

  const summary = buildLiveAnalyticsSummary();
  const ov = summary.overview;
  const delta = {
    date: new Date().toISOString().split('T')[0],
    todayVerifiedItemsCount: ov?.approvedEvidences ? Math.min(ov.approvedEvidences, 10) : 6,
    todayPromisesMovedCount: ov?.underImplementationCount ? Math.min(ov.underImplementationCount, 5) : 3,
    todayOutlayDeltaCr: ov?.todayOutlayDeltaCr || 750,
    velocityBps: Math.round(ov?.currentRealizedCagrPct ? ov.currentRealizedCagrPct * 2 : 18),
    topMilestone: 'Kolkata-Siliguri High-Speed Logistics Corridor Phase 2 Approved',
    topMilestoneBn: 'কলকাতা-শিলিগুড়ি দ্রুতগতির লজিস্টিক করিডোর দ্বিতীয় পর্যায় অনুমোদিত',
    cagrTarget: `${ov?.requiredCagrBasePct || 13.0}%`,
    realizedGsdpUsd: `$${ov?.currentGsdpUsdB || 249.4}B`
  };

  const poster = generateSocialPoster(delta, format);

  return new NextResponse(poster.svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600'
    }
  });
}
