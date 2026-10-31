'use client';

import * as React from 'react';
import HeroTargetCard from './HeroTargetCard';
import StatsBand from './StatsBand';
import DistrictMap, { DistrictData } from './DistrictMap';
import PromiseExplorer from './PromiseExplorer';
import EconomicOverview from './EconomicOverview';
import { DailyTallyFeed } from './DailyTallyFeed';
import { DistrictLeaderboard } from './DistrictLeaderboard';
import { RealtimeAnalyticsHub } from './RealtimeAnalyticsHub';
import { CitizenChatbot } from '../chat/CitizenChatbot';
import { PromiseData } from './PromiseCard';
import { LiveAnalyticsSummary } from '@viksit/shared';

interface DashboardClientProps {
  districts: DistrictData[];
  promises: PromiseData[];
  indicators: any[];
  initialAnalytics?: LiveAnalyticsSummary | null;
  locale?: string;
}

export default function DashboardClient({
  districts,
  promises,
  indicators,
  initialAnalytics = null,
  locale = 'en',
}: DashboardClientProps) {
  const [selectedDistrictCode, setSelectedDistrictCode] = React.useState<string | null>(null);
  const [liveAnalytics, setLiveAnalytics] = React.useState<LiveAnalyticsSummary | null>(
    initialAnalytics
  );

  // Compute live stats (reactive to liveAnalytics updates)
  const totalPromises = liveAnalytics?.overview.totalPromises || promises.length || 141;
  const deliveredCount =
    liveAnalytics?.overview.deliveredCount ||
    promises.filter((p) => p.status === 'DELIVERED').length ||
    16;
  const inProgressCount =
    liveAnalytics?.overview.underImplementationCount ||
    promises.filter((p) => p.status === 'UNDER_IMPLEMENTATION').length ||
    54;
  const districtsCount = liveAnalytics?.overview.districtsCovered || districts.length || 23;
  const evidenceCount = liveAnalytics?.overview.totalEvidences || 34;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 1. Hero Vision & Scenarios Card */}
      <HeroTargetCard />

      {/* 2. Key Progress Metrics Band */}
      <StatsBand
        totalPromises={totalPromises}
        deliveredCount={deliveredCount}
        inProgressCount={inProgressCount}
        districtsCount={districtsCount}
        evidenceCount={evidenceCount}
      />

      {/* 3. Real-Time Econometric & Policy Analytics Visual Hub (Charts, Graphs & Figures) */}
      <RealtimeAnalyticsHub
        locale={locale}
        initialAnalytics={initialAnalytics}
        variant="dashboard"
        onDataRefreshed={(updated) => setLiveAnalytics(updated)}
      />

      {/* 4. Autonomous Daily Verified Governance Tally Feed */}
      <DailyTallyFeed locale={locale} />

      {/* 5. Interactive District Map & Regional Progress */}
      <DistrictMap
        districts={districts}
        selectedDistrictCode={selectedDistrictCode}
        onSelectDistrict={setSelectedDistrictCode}
      />

      {/* 6. 23-District Accountability & Delivery Leaderboard */}
      <DistrictLeaderboard locale={locale} />

      {/* 7. Categorized Promise Explorer with Filters & Timelines */}
      <PromiseExplorer
        initialPromises={promises}
        selectedDistrictCode={selectedDistrictCode}
        onClearDistrictFilter={() => setSelectedDistrictCode(null)}
      />

      {/* 8. Macroeconomic Indicators & Growth Trajectory */}
      <EconomicOverview />

      {/* 9. Citizen & Visitor AI Chatbot ("Sonar Bondhu") */}
      <CitizenChatbot locale={locale} />
    </div>
  );
}

