export interface DailyDeltaPayload {
  date?: string;
  todayVerifiedItemsCount?: number;
  todayPromisesMovedCount?: number;
  todayOutlayDeltaCr?: number;
  velocityBps?: number;
  topMilestone?: string;
  topMilestoneBn?: string;
  cagrTarget?: string;
  realizedGsdpUsd?: string;
}

export interface PlatformCaptions {
  x: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  youtube: {
    title: string;
    description: string;
  };
}

export function generatePlatformCaptions(
  delta: DailyDeltaPayload,
  locale: 'en' | 'bn' = 'en'
): PlatformCaptions {
  const dateStr = delta.date || new Date().toISOString().split('T')[0];
  const outlay = delta.todayOutlayDeltaCr || 0;
  const verified = delta.todayVerifiedItemsCount || 0;
  const milestone =
    locale === 'bn' && delta.topMilestoneBn
      ? delta.topMilestoneBn
      : delta.topMilestone ||
        'State Industrial & Economic Corridors Expansion on Track';

  if (locale === 'bn') {
    // Bengali Copy
    const xCopy = `📊 বিকাশশীল বাংলা দৈনিক অর্থনীতি ডেল্টা (${dateStr})
• মূলধন বরাদ্দ: +₹${outlay} কোটি
• যাচাইকৃত বিজ্ঞপ্তি: +${verified}টি
• সাম্প্রতিক মাইলফলক: ${milestone.slice(0, 75)}

লাইভ ড্যাশবোর্ড দেখুন: viksitbengal.gov.in
#ViksitBengal #বিকাশশীলবাংলা #পশ্চিমবঙ্গ`;

    const fbCopy = `📢 বিকাশশীল বাংলা — দৈনিক নীতি ও অর্থনীতি বুলেটিন (${dateStr})

পশ্চিমবঙ্গের ট্রিলিয়ন ডলার অর্থনীতির অগ্রযাত্রায় আজকের মূল তথ্য:
✅ আজকের নতুন মূলধন বরাদ্দ: +₹${outlay} কোটি
✅ সরকারি গেজেট ও পিআইবি কর্তৃক যাচাইকৃত প্রমাণ: +${verified}টি
⭐ প্রধান মাইলফলক: ${milestone}

২৩টি জেলা ও ১৫টি উন্নয়ন খাতের রিয়েল-টাইম হিসাব দেখুন:
🔗 https://viksitbengal.gov.in/bn/dashboard

#ViksitBengal #WestBengal #বিকাশশীলবাংলা #BengalEconomy #Governance`;

    const liCopy = `পশ্চিমবঙ্গ ট্রিলিয়ন ডলার অর্থনীতির অগ্রযাত্রা — দৈনিক অন্তর্দৃষ্টি (${dateStr})

রাজ্যের সার্বিক অর্থনৈতিক প্রবৃদ্ধি ও নীতি রূপায়ণে আজ গুরুত্বপূর্ণ অগ্রগতি লক্ষ্য করা গেছে:
- মূলধন ব্যয় সংযোজন: +₹${outlay} কোটি
- স্বচ্ছ ও নিরীক্ষিত সরকারি আদেশ: +${verified}টি
- মূল প্রকল্প মাইলফলক: ${milestone}

স্বচ্ছ শাসন ও নীতি জবাবদিহিতার জন্য ড্যাশবোর্ড অনুসরণ করুন।
🔗 https://viksitbengal.gov.in/bn`;

    const igCopy = `🚀 বিকাশশীল বাংলা দৈনিক আপডেট | ${dateStr}

পশ্চিমবঙ্গের ট্রিলিয়ন ডলার অর্থনীতির পথে প্রতিদিনের বাস্তব অগ্রগতি!
💰 আজকের বরাদ্দ: +₹${outlay} কোটি
📋 যাচাইকৃত আদেশ: +${verified}টি
🌟 প্রধান মাইলফলক: ${milestone}

বিস্তারিত জানতে বায়োর লিংকে ক্লিক করুন 👆
#ViksitBengal #বিকাশশীলবাংলা #WestBengalEconomy #Kolkata #BengalDevelopment`;

    const ytTitle = `বিকাশশীল বাংলা দৈনিক আপডেট: +₹${outlay} কোটি মূলধন বরাদ্দ ও নতুন মাইলফলক (${dateStr})`.slice(
      0,
      98
    );
    const ytDesc = `পশ্চিমবঙ্গ সরকারের ১৪১টি নীতি প্রতিশ্রুতি ও ট্রিলিয়ন ডলার জিএসডিপি অগ্রযাত্রার দৈনিক বিবরণ।\nতারিখ: ${dateStr}\nবরাদ্দ: +₹${outlay} কোটি\nলাইভ ড্যাশবোর্ড: https://viksitbengal.gov.in/bn`;

    return {
      x: xCopy.length > 280 ? xCopy.slice(0, 277) + '...' : xCopy,
      facebook: fbCopy,
      linkedin: liCopy,
      instagram: igCopy,
      youtube: {
        title: ytTitle,
        description: ytDesc,
      },
    };
  }

  // English Copy
  const xCopy = `📊 Viksit Bengal Daily Economic Delta (${dateStr})
• Capital Outlay Sanctioned: +₹${outlay} Cr
• Verified Evidence Added: +${verified}
• Key Milestone: ${milestone.slice(0, 75)}

Explore live $1T GSDP tracker: viksitbengal.gov.in
#ViksitBengal #1TrillionEconomy #WestBengal`;

  const fbCopy = `📢 Viksit Bengal — Daily Policy & Economic Update (${dateStr})

Tracking West Bengal's verified trajectory toward a $1 Trillion USD Economy:
✅ 24h Capital Outlay Sanctioned: +₹${outlay} Cr
✅ Verified Official Gazette & PIB Notices: +${verified}
⭐ Milestone Highlight: ${milestone}

Monitor all 141 state commitments across 23 districts in real time:
🔗 https://viksitbengal.gov.in/en/dashboard

#ViksitBengal #WestBengal #1TrillionEconomy #BengalEconomy #Accountability`;

  const liCopy = `West Bengal $1 Trillion Economy Trajectory — Daily Governance Delta (${dateStr})

Today's verified institutional and infrastructure investment highlights:
- Incremental Capital Outlay: +₹${outlay} Cr
- Verified Government & Audit Citations: +${verified}
- Critical Milestone: ${milestone}

The Viksit Bengal Dashboard delivers transparent, data-driven tracking across 15 developmental sectors.
Read the full economic telemetry: https://viksitbengal.gov.in/en/indicators`;

  const igCopy = `🚀 Viksit Bengal Daily Delta | ${dateStr}

Daily accountability tracking West Bengal's journey to a $1 Trillion Economy!
💰 Outlay Verified Today: +₹${outlay} Cr
📋 Official Gazette Orders: +${verified}
🌟 Today's Milestone: ${milestone}

Tap the link in bio to explore the interactive 23-district map and telemetry 👆
#ViksitBengal #WestBengalEconomy #PolicyTracking #DataDrivenGovernance`;

  const ytTitle = `Viksit Bengal Daily Delta: +₹${outlay} Cr Capital Outlay & Milestones (${dateStr})`.slice(
    0,
    98
  );
  const ytDesc = `Daily progress telemetry tracking West Bengal's 141 policy commitments toward a $1 Trillion USD GSDP by 2033.\nDate: ${dateStr}\nOutlay Sanctioned: +₹${outlay} Cr\nExplore the live dashboard: https://viksitbengal.gov.in/en`;

  return {
    x: xCopy.length > 280 ? xCopy.slice(0, 277) + '...' : xCopy,
    facebook: fbCopy,
    linkedin: liCopy,
    instagram: igCopy,
    youtube: {
      title: ytTitle,
      description: ytDesc,
    },
  };
}
