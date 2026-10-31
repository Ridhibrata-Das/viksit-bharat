import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/lib/auth-guard';
import { SocialDispatcherService, SupportedPlatform } from '@/lib/social-media/platform-adapters';
import { MixpostBridgeService } from '@/lib/social-media/mixpost-bridge';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Enforce ADMIN role verification
  const authResult = authenticateApiRequest(req, ['ADMIN']);
  if (!authResult.authorized) {
    return NextResponse.json(
      { ok: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { delta, channels = ['X', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE'], simulate = true, sendToMixpost = true, scheduledAt } = body;

    if (!delta) {
      return NextResponse.json(
        { ok: false, error: 'Daily delta payload is required for publishing' },
        { status: 400 }
      );
    }

    const dispatcher = new SocialDispatcherService({ simulate });
    const directResults = await dispatcher.publishToAllChannels({
      delta,
      channels: channels as SupportedPlatform[],
      simulate
    });

    let mixpostResult = null;
    if (sendToMixpost) {
      const bridge = new MixpostBridgeService();
      const payload = bridge.formatMixpostPayload({
        content: `West Bengal Daily Economic Delta: +₹${delta.todayOutlayDeltaCr || 0} Cr outlay sanctioned. +${delta.todayVerifiedItemsCount || 0} verified gazette orders. ${delta.topMilestone || ''}`,
        mediaUrls: ['https://viksitbengal.gov.in/api/social/posters/landscape'],
        channels: ['twitter', 'facebook', 'mastodon'],
        scheduledAt: scheduledAt || null
      });
      mixpostResult = await bridge.dispatchPost(payload, { simulate });
    }

    return NextResponse.json({
      ok: true,
      data: {
        dispatchedDirect: directResults,
        mixpostQueue: mixpostResult,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Publishing syndication failed' },
      { status: 500 }
    );
  }
}
