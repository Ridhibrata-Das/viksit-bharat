export interface VideoFrame {
  id: string;
  sceneType: 'INTRO' | 'METRICS_DELTA' | 'MILESTONE' | 'OUTRO_CTA';
  title: string;
  durationMs: number;
  svgMarkup: string;
}

export interface VideoSequence {
  durationSeconds: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  fps: number;
  frames: VideoFrame[];
}

export function generateTeaserVideoSequence(
  delta: any = {},
  options: { durationSeconds?: number; isVertical?: boolean } = {}
): VideoSequence {
  const duration = options.durationSeconds || 15;
  const isVertical = options.isVertical || false;
  const width = isVertical ? 1080 : 1920;
  const height = isVertical ? 1920 : 1080;

  const dateStr = delta.date || new Date().toISOString().split('T')[0];
  const outlay = delta.todayOutlayDeltaCr || 0;
  const verified = delta.todayVerifiedItemsCount || 0;
  const milestone =
    delta.topMilestone ||
    'State Industrial & Economic Corridors Expansion on Track';

  const frames: VideoFrame[] = [
    {
      id: 'frame-1-intro',
      sceneType: 'INTRO',
      title: 'State Policy Pulse & Emblem Reveal',
      durationMs: 3000,
      svgMarkup: `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0A5C36" />
        <circle cx="${width / 2}" cy="${height / 2 - 80}" r="140" fill="#FACC15" />
        <text x="${width / 2}" y="${height / 2 + 130}" font-family="system-ui" font-size="56" font-weight="900" fill="#FFFFFF" text-anchor="middle">VIKSIT BENGAL</text>
        <text x="${width / 2}" y="${height / 2 + 190}" font-family="system-ui" font-size="28" font-weight="600" fill="#FACC15" text-anchor="middle">DAILY ECONOMIC DELTA · ${dateStr}</text>
      </svg>`,
    },
    {
      id: 'frame-2-metrics',
      sceneType: 'METRICS_DELTA',
      title: '24-Hour Capital Outlay & Evidence Ingestion',
      durationMs: 5000,
      svgMarkup: `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#07472A" />
        <text x="${width / 2}" y="${height * 0.3}" font-family="system-ui" font-size="36" font-weight="700" fill="#FACC15" text-anchor="middle">NEW SANCTIONED OUTLAY TODAY</text>
        <text x="${width / 2}" y="${height * 0.52}" font-family="system-ui" font-size="96" font-weight="900" fill="#FFFFFF" text-anchor="middle">+₹${outlay} Cr</text>
        <text x="${width / 2}" y="${height * 0.7}" font-family="system-ui" font-size="32" font-weight="600" fill="#6EE7B7" text-anchor="middle">+${verified} Official Gazette Orders Verified</text>
      </svg>`,
    },
    {
      id: 'frame-3-milestone',
      sceneType: 'MILESTONE',
      title: 'Key Policy Milestone Transition',
      durationMs: 4000,
      svgMarkup: `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0A5C36" />
        <rect x="100" y="${height * 0.25}" width="${width - 200}" height="${height * 0.5}" rx="30" fill="#000000" fill-opacity="0.3" stroke="#FACC15" stroke-width="4" />
        <text x="${width / 2}" y="${height * 0.4}" font-family="system-ui" font-size="28" font-weight="800" fill="#FACC15" text-anchor="middle">★ KEY MILESTONE DELIVERY ★</text>
        <text x="${width / 2}" y="${height * 0.55}" font-family="system-ui" font-size="44" font-weight="700" fill="#FFFFFF" text-anchor="middle">${milestone.slice(0, 50)}</text>
      </svg>`,
    },
    {
      id: 'frame-4-cta',
      sceneType: 'OUTRO_CTA',
      title: 'Trajectory toward $1 Trillion & Call to Action',
      durationMs: 3000,
      svgMarkup: `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#032616" />
        <text x="${width / 2}" y="${height * 0.38}" font-family="system-ui" font-size="48" font-weight="900" fill="#FFFFFF" text-anchor="middle">TOWARD A $1 TRILLION ECONOMY</text>
        <text x="${width / 2}" y="${height * 0.52}" font-family="system-ui" font-size="36" font-weight="700" fill="#FACC15" text-anchor="middle">141 Commitments · 23 Districts</text>
        <text x="${width / 2}" y="${height * 0.72}" font-family="system-ui" font-size="32" font-weight="600" fill="#FFFFFF" text-anchor="middle">🌐 viksitbengal.gov.in</text>
      </svg>`,
    },
  ];

  return {
    durationSeconds: duration,
    aspectRatio: isVertical ? '9:16' : '16:9',
    fps: 30,
    frames,
  };
}
