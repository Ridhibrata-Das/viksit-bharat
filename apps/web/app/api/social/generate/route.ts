import { NextRequest, NextResponse } from 'next/server';
import { generateSocialPoster, POSTER_FORMATS, PosterFormat } from '@/lib/social-media/poster-generator';
import { generatePlatformCaptions, DailyDeltaPayload } from '@/lib/social-media/copywriter';
import { generateTeaserVideoSequence } from '@/lib/social-media/teaser-video-generator';
import { buildLiveAnalyticsSummary } from '@/lib/live-store';

export const dynamic = 'force-dynamic';

function getFallbackDailyDelta(): DailyDeltaPayload {
  const summary = buildLiveAnalyticsSummary();
  const ov = summary.overview;

  return {
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
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const locale: 'en' | 'bn' = body.locale === 'bn' ? 'bn' : 'en';
    const formatKey = (body.format || 'LANDSCAPE_1200x630') as keyof typeof POSTER_FORMATS;
    const format: PosterFormat = POSTER_FORMATS[formatKey] || POSTER_FORMATS.LANDSCAPE_1200x630;

    const delta: DailyDeltaPayload = {
      ...getFallbackDailyDelta(),
      ...(body.delta || {})
    };

    const poster = generateSocialPoster(delta, format);
    const captions = generatePlatformCaptions(delta, locale);
    const teaserVideo = generateTeaserVideoSequence(delta);

    return NextResponse.json({
      ok: true,
      data: {
        format: formatKey,
        locale,
        dimensions: { width: poster.width, height: poster.height },
        posterSvg: poster.svg,
        captions,
        teaserVideo,
        delta
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Failed to generate social media assets' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const locale: 'en' | 'bn' = searchParams.get('locale') === 'bn' ? 'bn' : 'en';
  const formatKey = (searchParams.get('format') || 'LANDSCAPE_1200x630') as keyof typeof POSTER_FORMATS;
  const format: PosterFormat = POSTER_FORMATS[formatKey] || POSTER_FORMATS.LANDSCAPE_1200x630;

  const delta = getFallbackDailyDelta();
  const poster = generateSocialPoster(delta, format);
  const captions = generatePlatformCaptions(delta, locale);
  const teaserVideo = generateTeaserVideoSequence(delta);

  return NextResponse.json({
    ok: true,
    data: {
      format: formatKey,
      locale,
      dimensions: { width: poster.width, height: poster.height },
      posterSvg: poster.svg,
      captions,
      teaserVideo,
      delta
    }
  });
}
