const POSTER_FORMATS = {
  LANDSCAPE_1200x630: {
    width: 1200,
    height: 630,
    name: 'Landscape (X / FB / LinkedIn)',
    ratio: '1.91:1'
  },
  SQUARE_1080x1080: {
    width: 1080,
    height: 1080,
    name: 'Square (Instagram / Social Feed)',
    ratio: '1:1'
  },
  STORY_1080x1920: {
    width: 1080,
    height: 1920,
    name: 'Story / Reel / Shorts (9:16)',
    ratio: '9:16'
  }
};

function generateSocialPoster(data = {}, format = POSTER_FORMATS.LANDSCAPE_1200x630) {
  const width = format.width;
  const height = format.height;
  const dateStr = data.date || new Date().toISOString().split('T')[0];
  const outlay = data.todayOutlayDeltaCr || 0;
  const verified = data.todayVerifiedItemsCount || 0;
  const moved = data.todayPromisesMovedCount || 0;
  const milestone = data.topMilestone || 'State Industrial & Economic Corridors Expansion on Track';
  const milestoneBn = data.topMilestoneBn || 'রাজ্যের শিল্প ও অর্থনৈতিক করিডোর সম্প্রসারণ অগ্রগতিতে';
  const gsdp = data.realizedGsdpUsd || '$249.4B';

  const isStory = height > width;
  const isSquare = width === height;

  const headerY = isStory ? 180 : 90;
  const metricsY = isStory ? 600 : (isSquare ? 420 : 250);
  const milestoneY = isStory ? 1150 : (isSquare ? 720 : 430);
  const footerY = height - (isStory ? 120 : 60);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A5C36" />
      <stop offset="60%" stop-color="#07472A" />
      <stop offset="100%" stop-color="#032616" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FACC15" />
      <stop offset="100%" stop-color="#EAB308" />
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <circle cx="${width * 0.9}" cy="${height * 0.15}" r="${Math.min(width, height) * 0.4}" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.04" />
  <circle cx="${width * 0.9}" cy="${height * 0.15}" r="${Math.min(width, height) * 0.25}" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-dasharray="12 8" opacity="0.15" />
  <circle cx="${width * 0.1}" cy="${height * 0.85}" r="${Math.min(width, height) * 0.3}" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.04" />

  <g transform="translate(60, ${headerY})">
    <rect width="64" height="64" rx="16" fill="url(#goldGrad)" />
    <path d="M78 84 L92 110 L106 84" transform="translate(-60, -70)" fill="none" stroke="#0A5C36" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="32" cy="18" r="4" fill="#0A5C36" />
    <text x="84" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="1">VIKSIT BENGAL</text>
    <text x="84" y="54" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="url(#goldGrad)" letter-spacing="3">DAILY ECONOMIC DELTA · বিকাশশীল বাংলা</text>
  </g>

  <g transform="translate(${width - 240}, ${headerY - 10})">
    <rect width="180" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.12" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5" />
    <text x="90" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">📅 ${dateStr}</text>
  </g>

  <g transform="translate(60, ${metricsY})">
    <g filter="url(#cardShadow)">
      <rect width="${isStory ? width - 120 : (width - 180) / 3}" height="${isStory ? 130 : 140}" rx="16" fill="#FFFFFF" fill-opacity="0.08" stroke="url(#goldGrad)" stroke-width="1.5" />
      <text x="28" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="url(#goldGrad)">24H CAPITAL OUTLAY / মূলধন বরাদ্দ</text>
      <text x="28" y="96" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF">+₹${outlay} Cr</text>
    </g>

    <g transform="translate(${isStory ? 0 : (width - 180) / 3 + 30}, ${isStory ? 150 : 0})" filter="url(#cardShadow)">
      <rect width="${isStory ? width - 120 : (width - 180) / 3}" height="${isStory ? 130 : 140}" rx="16" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1.5" />
      <text x="28" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#6EE7B7">VERIFIED EVIDENCE / সরকারি বিজ্ঞপ্তি</text>
      <text x="28" y="96" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF">+${verified} Today</text>
    </g>

    <g transform="translate(${isStory ? 0 : ((width - 180) / 3) * 2 + 60}, ${isStory ? 300 : 0})" filter="url(#cardShadow)">
      <rect width="${isStory ? width - 120 : (width - 180) / 3}" height="${isStory ? 130 : 140}" rx="16" fill="#FFFFFF" fill-opacity="0.08" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="1.5" />
      <text x="28" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#93C5FD">REALIZED GSDP / $1T লক্ষ্যমাত্রা</text>
      <text x="28" y="96" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF">${gsdp}</text>
    </g>
  </g>

  <g transform="translate(60, ${milestoneY})" filter="url(#cardShadow)">
    <rect width="${width - 120}" height="${isStory ? 200 : 130}" rx="18" fill="#000000" fill-opacity="0.25" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
    <circle cx="40" cy="40" r="14" fill="url(#goldGrad)" />
    <text x="40" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" fill="#0A5C36" text-anchor="middle">★</text>
    <text x="68" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="url(#goldGrad)" letter-spacing="1">LATEST VERIFIED MILESTONE / সাম্প্রতিক নীতি মাইলফলক</text>
    <text x="40" y="${isStory ? 100 : 82}" font-family="system-ui, -apple-system, sans-serif" font-size="${isStory ? 22 : 20}" font-weight="700" fill="#FFFFFF">${milestone.length > 70 ? milestone.slice(0, 67) + '...' : milestone}</text>
    <text x="40" y="${isStory ? 145 : 110}" font-family="system-ui, -apple-system, sans-serif" font-size="${isStory ? 18 : 16}" font-weight="500" fill="#D1D5DB">${milestoneBn.length > 70 ? milestoneBn.slice(0, 67) + '...' : milestoneBn}</text>
  </g>

  <g transform="translate(60, ${footerY})">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="url(#goldGrad)">🌐 viksitbengal.gov.in</text>
    <text x="${width - 120}" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#9CA3AF" text-anchor="end">Open Governance · 141 Commitments · 23 Districts</text>
  </g>
</svg>`;

  return {
    svg,
    width,
    height,
    format: format.name,
    mimeType: 'image/svg+xml'
  };
}

module.exports = {
  POSTER_FORMATS,
  generateSocialPoster
};
