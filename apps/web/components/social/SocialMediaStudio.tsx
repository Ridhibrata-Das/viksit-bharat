'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Share2,
  Sparkles,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  RefreshCw,
  Send,
  Video,
  Image as ImageIcon,
  MessageSquare,
  Globe,
  Radio,
  ExternalLink,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toBengaliNumerals } from '@viksit/shared';

interface SocialMediaStudioProps {
  token?: string | null;
  userRole?: string;
}

export function SocialMediaStudio({ token, userRole = 'ADMIN' }: SocialMediaStudioProps) {
  const locale = useLocale();
  const isBn = locale === 'bn';

  const fmt = React.useCallback(
    (val: number | string) => (isBn ? toBengaliNumerals(val) : String(val)),
    [isBn]
  );

  const [loading, setLoading] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedFormat, setSelectedFormat] = React.useState<'LANDSCAPE_1200x630' | 'SQUARE_1080x1080' | 'STORY_1080x1920'>('LANDSCAPE_1200x630');
  const [activePlatformTab, setActivePlatformTab] = React.useState<'x' | 'facebook' | 'instagram' | 'linkedin' | 'youtube'>('x');
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  // Creative data state
  const [bundle, setBundle] = React.useState<{
    posterSvg: string;
    captions: Record<string, any>;
    teaserVideo: {
      durationSeconds: number;
      audioTrack: string;
      frames: Array<{
        frameNumber: number;
        timestampStart: string;
        timestampEnd: string;
        sceneType: string;
        headline: string;
        subheadline: string;
        keyMetric: string;
        visualAccent: string;
      }>;
    };
    delta: any;
  } | null>(null);

  // Video storyboard player state
  const [activeFrameIndex, setActiveFrameIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Multi-channel syndication selections
  const [selectedChannels, setSelectedChannels] = React.useState<Record<string, boolean>>({
    X: true,
    FACEBOOK: true,
    INSTAGRAM: true,
    LINKEDIN: true,
    YOUTUBE: true,
  });
  const [sendToMixpost, setSendToMixpost] = React.useState(true);
  const [simulateMode, setSimulateMode] = React.useState(true);
  const [publishHistory, setPublishHistory] = React.useState<any[]>([]);

  // Fetch creative assets from API
  const fetchCreativeBundle = React.useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/social/generate?format=${selectedFormat}&locale=${isBn ? 'bn' : 'en'}`);
      const data = await res.json();
      if (data.ok && data.data) {
        setBundle(data.data);
      } else {
        throw new Error(data.error || 'Failed to load social assets');
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedFormat, isBn]);

  React.useEffect(() => {
    fetchCreativeBundle();
  }, [fetchCreativeBundle]);

  // Video playback loop effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && bundle?.teaserVideo?.frames?.length) {
      interval = setInterval(() => {
        setActiveFrameIndex((prev) => (prev + 1) % bundle.teaserVideo.frames.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, bundle?.teaserVideo?.frames?.length]);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadSvg = () => {
    if (!bundle?.posterSvg) return;
    const blob = new Blob([bundle.posterSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viksit-bengal-poster-${selectedFormat.toLowerCase()}-${bundle.delta?.date || 'today'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePublishAll = async () => {
    if (userRole !== 'ADMIN') {
      setMessage({
        text: isBn ? 'শুধুমাত্র ADMIN ব্যবহারকারীরা সোশ্যাল মিডিয়ায় প্রকাশ করতে পারেন।' : 'Only ADMIN role can publish to social media channels.',
        type: 'error'
      });
      return;
    }

    const activeChannels = Object.keys(selectedChannels).filter((k) => selectedChannels[k]);
    if (activeChannels.length === 0) {
      setMessage({
        text: isBn ? 'অনুগ্রহ করে অন্তত একটি চ্যানেল নির্বাচন করুন।' : 'Please select at least one channel to publish.',
        type: 'error'
      });
      return;
    }

    setPublishing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'jwt-live-admin-session'}`
        },
        body: JSON.stringify({
          delta: bundle?.delta,
          channels: activeChannels,
          simulate: simulateMode,
          sendToMixpost
        })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Publishing failed');
      }

      setPublishHistory((prev) => [data.data, ...prev]);
      setMessage({
        text: isBn
          ? `সফলভাবে ${activeChannels.length}টি চ্যানেলে${sendToMixpost ? ' ও মিক্সপোস্ট কিউতে' : ''} প্রকাশিত হয়েছে!`
          : `Syndicated successfully to ${activeChannels.length} channel(s)${sendToMixpost ? ' & Mixpost Horizon Queue' : ''}!`,
        type: 'success'
      });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setPublishing(false);
    }
  };

  const activeCaptionText = React.useMemo(() => {
    if (!bundle?.captions) return '';
    if (activePlatformTab === 'youtube') {
      return `Title: ${bundle.captions.youtube?.title}\n\n${bundle.captions.youtube?.description}`;
    }
    return bundle.captions[activePlatformTab] || '';
  }, [bundle?.captions, activePlatformTab]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isBn ? 'স্বয়ংক্রিয় সোশ্যাল ও ভিডিও প্রচার স্টুডিও' : 'Automated Social Media & Video Studio'}</span>
            <span>·</span>
            <span className="text-emerald-300">Mixpost Bridge Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            {isBn ? 'দৈনিক ডেল্টা পোস্টার, টিজার ভিডিও এবং মাল্টি-প্ল্যাটফর্ম পাবলিশিং' : 'Daily Delta Posters, Teaser Videos & Multi-Platform Syndication'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
            {isBn
              ? 'পশ্চিমবঙ্গের ১ ট্রিলিয়ন অর্থনীতির লাইভ মেট্রিক্স স্বয়ংক্রিয়ভাবে গ্রাফিক্স পোস্টার ও ১৫ সেকেন্ডের শর্টস ভিডিওতে রূপান্তর করে X, Facebook, Instagram, LinkedIn ও YouTube-এ প্রচার করুন।'
              : 'Auto-synthesize real-time landing page telemetry into high-res SVG posters, 15s teaser videos, and auto-dispatch directly or queue via inovector/mixpost.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchCreativeBundle}
            disabled={loading}
            className="border-emerald-700 bg-emerald-900/60 hover:bg-emerald-800 text-white gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isBn ? 'পুনর্বার তৈরি করুন' : 'Regenerate Creatives'}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePublishAll}
            disabled={publishing || loading}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold gap-1.5 shadow-sm"
          >
            <Send className={`w-3.5 h-3.5 ${publishing ? 'animate-pulse' : ''}`} />
            <span>{publishing ? (isBn ? 'প্রচারিত হচ্ছে...' : 'Publishing...') : (isBn ? 'সব চ্যানেলে পোস্ট করুন' : 'Publish to All Channels')}</span>
          </Button>
        </div>
      </div>

      {/* Status banner */}
      {message && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between gap-2.5 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
              : 'bg-red-50 text-red-950 border-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs underline opacity-75 hover:opacity-100"
          >
            {isBn ? 'বন্ধ করুন' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Daily Telemetry Cards */}
      {bundle?.delta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
            <span className="text-[11px] font-bold text-stone-500 uppercase">{isBn ? 'আজকের মূলধন বরাদ্দ' : 'Today Outlay Delta'}</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
              +₹{fmt(bundle.delta.todayOutlayDeltaCr)} Cr
            </div>
            <span className="text-[10px] text-stone-500">{isBn ? 'গেজেট দ্বারা অনুমোদিত' : 'Sanctioned today'}</span>
          </div>
          <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
            <span className="text-[11px] font-bold text-stone-500 uppercase">{isBn ? 'যাচাইকৃত নথি' : 'Verified Evidence'}</span>
            <div className="text-xl sm:text-2xl font-black text-primary mt-1">
              +{fmt(bundle.delta.todayVerifiedItemsCount)}
            </div>
            <span className="text-[10px] text-stone-500">{isBn ? 'টিয়ার ১ গেজেট ও পিআইবি' : 'Tier-1 Orders today'}</span>
          </div>
          <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
            <span className="text-[11px] font-bold text-stone-500 uppercase">{isBn ? 'প্রতিশ্রুতি অগ্রগতি' : 'Promises Moved'}</span>
            <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
              +{fmt(bundle.delta.todayPromisesMovedCount)}
            </div>
            <span className="text-[10px] text-stone-500">{isBn ? 'পরবর্তী ধাপে উন্নীত' : 'Advanced to funded/active'}</span>
          </div>
          <div className="p-4 rounded-xl border border-stone-200 bg-white shadow-xs">
            <span className="text-[11px] font-bold text-stone-500 uppercase">{isBn ? 'জিএসডিপি বেগ' : 'Velocity Momentum'}</span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
              +{fmt(bundle.delta.velocityBps)} bps
            </div>
            <span className="text-[10px] text-stone-500">{isBn ? '১৩% সিএজিআর অভিমুখে' : 'Toward $1T target'}</span>
          </div>
        </div>
      )}

      {/* Main Studio 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Poster & Video Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Poster Studio Card */}
          <Card className="border border-stone-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-stone-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-base font-bold">
                    {isBn ? 'সোশ্যাল মিডিয়া পোস্টার প্রিভিউ' : 'Dynamic Social Media Poster'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn ? 'স্বয়ংক্রিয়ভাবে তৈরি ভেক্টর এসভিজি (SVG) গ্রাফিক্স' : 'Live generated vector artwork ready for posting'}
                  </CardDescription>
                </div>
              </div>

              {/* Aspect Ratio Switcher */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('LANDSCAPE_1200x630')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedFormat === 'LANDSCAPE_1200x630' ? 'bg-primary text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  1200×630
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat('SQUARE_1080x1080')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedFormat === 'SQUARE_1080x1080' ? 'bg-primary text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  1080×1080
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat('STORY_1080x1920')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedFormat === 'STORY_1080x1920' ? 'bg-primary text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Story
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* Poster Canvas Preview */}
              <div className="w-full rounded-xl bg-stone-950 p-2 flex items-center justify-center overflow-hidden border border-stone-800 max-h-[420px]">
                {bundle?.posterSvg ? (
                  <div
                    className="w-full h-auto max-h-[400px] flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[390px] [&>svg]:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: bundle.posterSvg }}
                  />
                ) : (
                  <div className="py-20 text-center text-stone-500 text-sm">
                    {isBn ? 'পোস্টার লোড হচ্ছে...' : 'Generating vector poster...'}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span className="font-mono">Format: {selectedFormat} · Vector SVG (Lossless)</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadSvg}
                  className="gap-1.5 h-8 text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'এসভিজি ডাউনলোড' : 'Download SVG'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Teaser Video Storyboard Card */}
          <Card className="border border-stone-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-stone-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-600" />
                <div>
                  <CardTitle className="text-base font-bold">
                    {isBn ? '১৫ সেকেন্ডের টিজার ভিডিও স্টোরিবোর্ড' : '15s Teaser Video Storyboard Sequence'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn ? 'ইউটিউব শর্টস ও ইনস্টাগ্রাম রিলসের জন্য সিকোয়েন্স' : 'Shorts / Reels storyboard with timed frames & visual cues'}
                  </CardDescription>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant={isPlaying ? 'destructive' : 'default'}
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-1.5 h-8 text-xs font-bold"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? (isBn ? 'থামান' : 'Pause') : (isBn ? 'প্লে করুন' : 'Play Timeline')}</span>
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Active Scene Frame Display */}
              {bundle?.teaserVideo?.frames?.[activeFrameIndex] && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-stone-900 to-emerald-950 text-white border border-emerald-800 space-y-3 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-amber-400 text-stone-950 font-bold uppercase text-[10px]">
                      {bundle.teaserVideo.frames[activeFrameIndex].sceneType}
                    </Badge>
                    <span className="font-mono text-xs text-stone-300">
                      {bundle.teaserVideo.frames[activeFrameIndex].timestampStart} – {bundle.teaserVideo.frames[activeFrameIndex].timestampEnd}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-amber-300">
                      {bundle.teaserVideo.frames[activeFrameIndex].headline}
                    </h4>
                    <p className="text-xs text-stone-200 mt-1">
                      {bundle.teaserVideo.frames[activeFrameIndex].subheadline}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-emerald-700/50 flex items-center justify-between">
                    <span className="text-xs text-emerald-300 font-bold">Key Focal Telemetry</span>
                    <span className="text-sm font-mono font-black text-amber-400">
                      {bundle.teaserVideo.frames[activeFrameIndex].keyMetric}
                    </span>
                  </div>
                </div>
              )}

              {/* Scrubber Frames Bar */}
              <div className="grid grid-cols-4 gap-2">
                {bundle?.teaserVideo?.frames?.map((frame, idx) => (
                  <button
                    key={frame.frameNumber}
                    type="button"
                    onClick={() => {
                      setActiveFrameIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      activeFrameIndex === idx
                        ? 'border-primary bg-emerald-50 text-emerald-950 ring-2 ring-primary/30'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase text-stone-500">
                      Frame {frame.frameNumber}
                    </div>
                    <div className="text-xs font-bold truncate mt-0.5">
                      {frame.sceneType}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                      {frame.timestampStart}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Multilingual Copywriter & Syndication Dispatcher (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Platform Captions Card */}
          <Card className="border border-stone-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-base font-bold">
                    {isBn ? 'এআই প্ল্যাটফর্ম ক্যাপশন' : 'AI Platform Captions'}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {isBn ? 'বাংলা সংস্করণ' : 'EN Version'}
                </Badge>
              </div>

              {/* Platform selector tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pt-3">
                {[
                  { id: 'x', label: 'X (Twitter)' },
                  { id: 'facebook', label: 'Facebook' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'linkedin', label: 'LinkedIn' },
                  { id: 'youtube', label: 'YouTube' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePlatformTab(p.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activePlatformTab === p.id
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <textarea
                  readOnly
                  rows={8}
                  value={activeCaptionText}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
                <button
                  type="button"
                  onClick={() => handleCopyText(activeCaptionText, activePlatformTab)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white border border-stone-200 shadow-xs hover:bg-stone-100 text-stone-700"
                  title="Copy caption"
                >
                  {copiedKey === activePlatformTab ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Length: {activeCaptionText.length} characters</span>
                {activePlatformTab === 'x' && (
                  <span className={activeCaptionText.length <= 280 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {activeCaptionText.length}/280 max
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Multi-Channel Publishing & Mixpost Configuration Card */}
          <Card className="border border-stone-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <CardTitle className="text-base font-bold">
                    {isBn ? 'মাল্টি-চ্যানেল প্রকাশনা ও মিক্সপোস্ট কনফিগ' : 'Syndication & Mixpost Dispatch'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isBn ? 'ইনোভেক্টর মিক্সপোস্ট ও নিজস্ব অ্যাডাপ্টারের মাধ্যমে প্রচার' : 'Route to inovector/mixpost queue or direct API clients'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Channel checkboxes */}
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-2">
                  {isBn ? 'সক্রিয় প্রচার চ্যানেলসমূহ:' : 'Target Syndication Channels:'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'X', label: 'X (Twitter)' },
                    { id: 'FACEBOOK', label: 'Facebook Page' },
                    { id: 'INSTAGRAM', label: 'Instagram Reel' },
                    { id: 'LINKEDIN', label: 'LinkedIn Post' },
                    { id: 'YOUTUBE', label: 'YouTube Shorts' },
                  ].map((ch) => (
                    <label
                      key={ch.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 text-xs font-semibold cursor-pointer hover:bg-stone-50"
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedChannels[ch.id]}
                        onChange={(e) =>
                          setSelectedChannels({ ...selectedChannels, [ch.id]: e.target.checked })
                        }
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                      <span>{ch.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mixpost & Execution switches */}
              <div className="pt-2 border-t border-stone-100 space-y-2 text-xs">
                <label className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-stone-900 block">Bridge to inovector/mixpost</span>
                    <span className="text-[11px] text-stone-500">Queue in Mixpost Horizon backend</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendToMixpost}
                    onChange={(e) => setSendToMixpost(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-stone-900 block">Simulation Mode (Offline Safe)</span>
                    <span className="text-[11px] text-stone-500">Mock responses without billing</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulateMode}
                    onChange={(e) => setSimulateMode(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                </label>
              </div>

              {/* Action Button */}
              <Button
                type="button"
                onClick={handlePublishAll}
                disabled={publishing || loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold gap-2 py-5 shadow-sm"
              >
                <Send className={`w-4 h-4 ${publishing ? 'animate-spin' : ''}`} />
                <span>
                  {publishing
                    ? (isBn ? 'সিন্ডিকেশন চলছে...' : 'Syndicating Across Networks...')
                    : (isBn ? 'এখনই প্রচার শুরু করুন' : 'Publish to Selected Channels Now')}
                </span>
              </Button>

              {/* Recent Dispatches */}
              {publishHistory.length > 0 && (
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <span className="text-xs font-bold text-stone-700 block">
                    {isBn ? 'সাম্প্রতিক প্রকাশনা ফলাফল:' : 'Recent Dispatch Records:'}
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {publishHistory[0]?.dispatchedDirect?.results?.map((res: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px]"
                      >
                        <span className="font-bold text-emerald-950">{res.channel}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-600 text-white text-[9px]">
                            {res.status}
                          </Badge>
                          {res.url && (
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
