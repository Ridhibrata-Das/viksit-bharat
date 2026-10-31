/**
 * Tier 1: Social Media Poster, Teaser Video & Multi-Platform Publishing (TDD)
 */
import assert from 'assert';
import {
  generateSocialPoster,
  POSTER_FORMATS
} from '../../apps/web/lib/social-media/poster-generator.js';
import {
  generatePlatformCaptions
} from '../../apps/web/lib/social-media/copywriter.js';
import {
  generateTeaserVideoSequence
} from '../../apps/web/lib/social-media/teaser-video-generator.js';
import {
  MixpostBridgeService
} from '../../apps/web/lib/social-media/mixpost-bridge.js';
import {
  SocialDispatcherService
} from '../../apps/web/lib/social-media/platform-adapters.js';

export async function run(ctx) {
  const results = [];

  const mockDailyDelta = {
    date: '2026-10-21',
    todayVerifiedItemsCount: 5,
    todayPromisesMovedCount: 2,
    todayOutlayDeltaCr: 750,
    velocityBps: 18,
    topMilestone: 'Kolkata-Siliguri High-Speed Logistics Corridor Phase 2 Approved',
    topMilestoneBn: 'কলকাতা-শিলিগুড়ি দ্রুতগতির লজিস্টিক করিডোর দ্বিতীয় পর্যায় অনুমোদিত',
    cagrTarget: '13.0%',
    realizedGsdpUsd: '$249.4B'
  };

  // Test 1: Poster Generator creates valid SVG markup across 3 standard aspect ratios
  try {
    const landscape = generateSocialPoster(mockDailyDelta, POSTER_FORMATS.LANDSCAPE_1200x630);
    assert.ok(typeof landscape.svg === 'string', 'Landscape poster must return SVG string');
    assert.strictEqual(landscape.width, 1200);
    assert.strictEqual(landscape.height, 630);
    assert.ok(landscape.svg.includes('#0A5C36'), 'Must use primary emerald #0A5C36');
    assert.ok(landscape.svg.includes('750'), 'Must render today outlay delta');

    const square = generateSocialPoster(mockDailyDelta, POSTER_FORMATS.SQUARE_1080x1080);
    assert.strictEqual(square.width, 1080);
    assert.strictEqual(square.height, 1080);

    const story = generateSocialPoster(mockDailyDelta, POSTER_FORMATS.STORY_1080x1920);
    assert.strictEqual(story.width, 1080);
    assert.strictEqual(story.height, 1920);

    results.push({ name: 'Poster generator creates valid SVG artwork for 1200x630, 1080x1080, and 1080x1920', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Poster generator creates valid SVG artwork for 1200x630, 1080x1080, and 1080x1920', status: 'FAIL', error: err.message });
  }

  // Test 2: AI Copywriter generates length-compliant, platform-specific captions
  try {
    const captionsEn = generatePlatformCaptions(mockDailyDelta, 'en');
    assert.ok(captionsEn.x, 'Must generate X copy');
    assert.ok(captionsEn.x.length <= 280, `X copy must be <= 280 characters, got ${captionsEn.x.length}`);
    assert.ok(captionsEn.x.includes('#ViksitBengal'), 'X copy must include #ViksitBengal');

    assert.ok(captionsEn.facebook, 'Must generate Facebook copy');
    assert.ok(captionsEn.facebook.includes('₹750 Cr') || captionsEn.facebook.includes('750 Cr'), 'FB must cite outlay');

    assert.ok(captionsEn.linkedin, 'Must generate LinkedIn copy');
    assert.ok(captionsEn.instagram, 'Must generate Instagram caption');
    assert.ok(captionsEn.youtube, 'Must generate YouTube title and description');
    assert.ok(captionsEn.youtube.title.length <= 100, 'YouTube title must be <= 100 characters');

    // Test Bengali parity
    const captionsBn = generatePlatformCaptions(mockDailyDelta, 'bn');
    assert.ok(captionsBn.x.includes('বিকাশশীল বাংলা') || captionsBn.x.includes('পশ্চিমবঙ্গ'), 'Bengali X copy must use Bengali text');
    results.push({ name: 'AI Copywriter generates length-compliant captions for X, FB, LinkedIn, IG, and YouTube', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'AI Copywriter generates length-compliant captions for X, FB, LinkedIn, IG, and YouTube', status: 'FAIL', error: err.message });
  }

  // Test 3: Teaser Video Generator produces multi-frame animated storyboard sequence
  try {
    const videoSequence = generateTeaserVideoSequence(mockDailyDelta, { durationSeconds: 15 });
    assert.ok(Array.isArray(videoSequence.frames), 'Video sequence must contain frames');
    assert.ok(videoSequence.frames.length >= 4, `Expected at least 4 scene frames, got ${videoSequence.frames.length}`);
    assert.strictEqual(videoSequence.durationSeconds, 15);
    
    // Check required scenes: Intro, Metrics, Milestone, CTA
    const sceneTypes = videoSequence.frames.map(f => f.sceneType);
    assert.ok(sceneTypes.includes('INTRO'), 'Sequence must contain INTRO frame');
    assert.ok(sceneTypes.includes('METRICS_DELTA'), 'Sequence must contain METRICS_DELTA frame');
    assert.ok(sceneTypes.includes('MILESTONE'), 'Sequence must contain MILESTONE frame');
    assert.ok(sceneTypes.includes('OUTRO_CTA'), 'Sequence must contain OUTRO_CTA frame');
    results.push({ name: 'Teaser video generator produces 15s multi-frame animated storyboard sequence', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Teaser video generator produces 15s multi-frame animated storyboard sequence', status: 'FAIL', error: err.message });
  }

  // Test 4: Mixpost Bridge formats payloads compatible with inovector/mixpost API
  try {
    const bridge = new MixpostBridgeService({
      apiUrl: 'https://mixpost.example.com',
      apiToken: 'mock-mixpost-bearer-token'
    });

    const payload = bridge.formatMixpostPayload({
      content: 'West Bengal Daily Economic Delta: +₹750 Cr capital outlay sanctioned today.',
      mediaUrls: ['https://viksitbengal.gov.in/api/social/posters/landscape'],
      channels: ['twitter', 'facebook', 'mastodon'],
      scheduledAt: '2026-10-21 12:00'
    });

    assert.ok(payload.post, 'Payload must contain post definition');
    assert.ok(Array.isArray(payload.accounts) || Array.isArray(payload.channels), 'Payload must route target channels');
    assert.ok(payload.versions, 'Payload must support Mixpost per-network versions');
    assert.strictEqual(payload.scheduled_at, '2026-10-21 12:00');

    // Test offline simulation dispatch
    const syncRes = await bridge.dispatchPost(payload, { simulate: true });
    assert.ok(syncRes.success, 'Simulated bridge dispatch must succeed');
    assert.ok(syncRes.mixpostId, 'Must return generated mixpost record identifier');
    results.push({ name: 'Mixpost bridge formats payloads matching inovector/mixpost Post schema', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Mixpost bridge formats payloads matching inovector/mixpost Post schema', status: 'FAIL', error: err.message });
  }

  // Test 5: Native Social Dispatcher executes multi-channel syndication
  try {
    const dispatcher = new SocialDispatcherService();
    const dispatchResult = await dispatcher.publishToAllChannels({
      delta: mockDailyDelta,
      channels: ['X', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE'],
      simulate: true
    });

    assert.ok(dispatchResult.success, 'Multi-channel dispatch must succeed');
    assert.strictEqual(dispatchResult.results.length, 5, 'Must report results for all 5 selected channels');
    
    for (const ch of dispatchResult.results) {
      assert.ok(['X', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'YOUTUBE'].includes(ch.channel));
      assert.strictEqual(ch.status, 'PUBLISHED');
      assert.ok(ch.publishedId, 'Must return published message ID');
    }
    results.push({ name: 'Social Dispatcher successfully syndicates content across 5 platforms', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Social Dispatcher successfully syndicates content across 5 platforms', status: 'FAIL', error: err.message });
  }

  // Test 6: API endpoint POST /api/social/generate returns complete creative bundle
  try {
    ctx.setToken('mock.header.eyJyb2xlIjoiQURNSU4ifQ.signature');
    const genRes = await ctx.post('/api/social/generate', {
      format: 'LANDSCAPE_1200x630',
      locale: 'en'
    });

    assert.ok(genRes.ok || genRes.status === 200, 'POST /api/social/generate must respond with 200');
    assert.ok(genRes.data.posterSvg, 'Response must include poster SVG');
    assert.ok(genRes.data.captions, 'Response must include platform captions');
    assert.ok(genRes.data.teaserVideo, 'Response must include video storyboard sequence');
    results.push({ name: 'POST /api/social/generate delivers integrated poster, video, and copy bundle', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /api/social/generate delivers integrated poster, video, and copy bundle', status: 'FAIL', error: err.message });
  }

  return results;
}
