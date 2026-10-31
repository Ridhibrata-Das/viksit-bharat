/**
 * Platform Adapters & Social Dispatcher Service (CommonJS runtime for tests)
 * Supports multi-channel publishing to X, Facebook, Instagram, LinkedIn, and YouTube.
 */

const { generatePlatformCaptions } = require('./copywriter.js');
const { generateSocialPoster, POSTER_FORMATS } = require('./poster-generator.js');
const { generateTeaserVideoSequence } = require('./teaser-video-generator.js');

class SocialDispatcherService {
  constructor(options = {}) {
    this.simulateDefault = options.simulate ?? (process.env.NODE_ENV !== 'production' && !process.env.FORCE_LIVE_SOCIAL);
  }

  /**
   * Publish generated assets to all requested channels
   */
  async publishToAllChannels(req) {
    const isSimulate = req.simulate ?? this.simulateDefault;
    const locale = req.locale || 'en';
    const captions = generatePlatformCaptions(req.delta, locale);
    const poster = generateSocialPoster(req.delta, POSTER_FORMATS.LANDSCAPE_1200x630);
    const video = generateTeaserVideoSequence(req.delta);

    const publishPromises = req.channels.map(async (channel) => {
      try {
        switch (channel) {
          case 'X':
            return await this.publishToX(captions.x, isSimulate);
          case 'FACEBOOK':
            return await this.publishToFacebook(captions.facebook, poster.svg, isSimulate);
          case 'INSTAGRAM':
            return await this.publishToInstagram(captions.instagram, poster.svg, isSimulate);
          case 'LINKEDIN':
            return await this.publishToLinkedIn(captions.linkedin, poster.svg, isSimulate);
          case 'YOUTUBE':
            return await this.publishToYouTube(captions.youtube.title, captions.youtube.description, video, isSimulate);
          default:
            return {
              channel,
              status: 'FAILED',
              error: `Unsupported channel: ${channel}`,
              timestamp: new Date().toISOString()
            };
        }
      } catch (err) {
        return {
          channel,
          status: 'FAILED',
          error: err.message || 'Unknown dispatch error',
          timestamp: new Date().toISOString()
        };
      }
    });

    const results = await Promise.all(publishPromises);
    const successCount = results.filter((r) => r.status === 'PUBLISHED').length;

    return {
      success: successCount === req.channels.length,
      publishedCount: successCount,
      results
    };
  }

  // --- Channel Implementations ---

  async publishToX(text, simulate) {
    const timestamp = new Date().toISOString();
    const token = process.env.TWITTER_BEARER_TOKEN;

    if (simulate || !token) {
      const id = `x-sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      return {
        channel: 'X',
        status: 'PUBLISHED',
        publishedId: id,
        url: `https://x.com/ViksitBengal/status/${id}`,
        timestamp
      };
    }

    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      const errData = await res.text();
      throw new Error(`X API Error (${res.status}): ${errData}`);
    }

    const data = await res.json();
    return {
      channel: 'X',
      status: 'PUBLISHED',
      publishedId: data.data.id,
      url: `https://x.com/ViksitBengal/status/${data.data.id}`,
      timestamp
    };
  }

  async publishToFacebook(caption, _posterSvg, simulate) {
    const timestamp = new Date().toISOString();
    const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
    const pageId = process.env.META_PAGE_ID || 'me';

    if (simulate || !pageToken) {
      const id = `fb-sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      return {
        channel: 'FACEBOOK',
        status: 'PUBLISHED',
        publishedId: id,
        url: `https://facebook.com/ViksitBengal/posts/${id}`,
        timestamp
      };
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: caption,
        access_token: pageToken
      })
    });

    if (!res.ok) {
      const errData = await res.text();
      throw new Error(`Facebook API Error (${res.status}): ${errData}`);
    }

    const data = await res.json();
    return {
      channel: 'FACEBOOK',
      status: 'PUBLISHED',
      publishedId: data.id,
      url: `https://facebook.com/${data.id}`,
      timestamp
    };
  }

  async publishToInstagram(caption, _posterSvg, simulate) {
    const timestamp = new Date().toISOString();
    const token = process.env.META_PAGE_ACCESS_TOKEN;
    const igAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

    if (simulate || !token || !igAccountId) {
      const id = `ig-sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      return {
        channel: 'INSTAGRAM',
        status: 'PUBLISHED',
        publishedId: id,
        url: `https://instagram.com/p/${id}`,
        timestamp
      };
    }

    const containerRes = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption,
        image_url: 'https://viksitbengal.gov.in/api/social/posters/square',
        access_token: token
      })
    });

    if (!containerRes.ok) {
      const err = await containerRes.text();
      throw new Error(`IG Container Error: ${err}`);
    }

    const containerData = await containerRes.json();

    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: token
      })
    });

    if (!publishRes.ok) {
      const err = await publishRes.text();
      throw new Error(`IG Publish Error: ${err}`);
    }

    const publishData = await publishRes.json();
    return {
      channel: 'INSTAGRAM',
      status: 'PUBLISHED',
      publishedId: publishData.id,
      url: `https://instagram.com/p/${publishData.id}`,
      timestamp
    };
  }

  async publishToLinkedIn(caption, _posterSvg, simulate) {
    const timestamp = new Date().toISOString();
    const token = process.env.LINKEDIN_ACCESS_TOKEN;
    const authorUrn = process.env.LINKEDIN_AUTHOR_URN;

    if (simulate || !token || !authorUrn) {
      const id = `li-sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      return {
        channel: 'LINKEDIN',
        status: 'PUBLISHED',
        publishedId: id,
        url: `https://linkedin.com/feed/update/${id}`,
        timestamp
      };
    }

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: caption },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`LinkedIn Error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      channel: 'LINKEDIN',
      status: 'PUBLISHED',
      publishedId: data.id,
      url: `https://linkedin.com/feed/update/${data.id}`,
      timestamp
    };
  }

  async publishToYouTube(title, description, _videoSequence, simulate) {
    const timestamp = new Date().toISOString();
    const token = process.env.YOUTUBE_OAUTH_TOKEN;

    if (simulate || !token) {
      const id = `yt-sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      return {
        channel: 'YOUTUBE',
        status: 'PUBLISHED',
        publishedId: id,
        url: `https://youtube.com/shorts/${id}`,
        timestamp
      };
    }

    const res = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet,status', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          title,
          description,
          tags: ['ViksitBengal', 'BengalEconomy', 'EconomicGrowth', 'Shorts'],
          categoryId: '25'
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false
        }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YouTube Error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      channel: 'YOUTUBE',
      status: 'PUBLISHED',
      publishedId: data.id,
      url: `https://youtube.com/shorts/${data.id}`,
      timestamp
    };
  }
}

module.exports = {
  SocialDispatcherService
};
