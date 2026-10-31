export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface ScrapedSourceDto {
  id: string;
  name: string;
  url: string;
  sourceType: string;
  sourceTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
  categoryTag?: string;
  isActive: boolean;
  lastScrapedAt?: string;
}

export interface ScrapeRunSummary {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  itemsDiscovered: number;
  itemsMatched: number;
  itemsPendingReview: number;
  logDetails?: string;
}

export interface DailyDeltaTransition {
  promiseCode: string;
  titleEn: string;
  titleBn: string;
  previousStatus: string;
  currentStatus: string;
  districtNameEn: string;
  districtNameBn: string;
  outlayCr?: number;
  sourcePublisher: string;
  sourceTier: string;
  sourceUrl?: string;
  timestamp: string;
}

export interface DailySectorVelocity {
  sectorCode: string;
  sectorEn: string;
  sectorBn: string;
  activeCount: number;
  deltaToday: number;
  outlayCr: number;
}

export interface DailyTallyMetrics {
  date: string;
  lastSyncedAt?: string;
  liveSyncMode?: 'LIVE_WEB_AND_GEMINI' | 'LIVE_RSS_VERIFIED' | 'DAILY_DELTA_ENGINE';
  activeSourcesCount?: number;
  todayVerifiedItemsCount: number;
  todayPromisesMovedCount: number;
  totalDeliveredPromises: number;
  totalUnderImplementation: number;
  totalFundedAmountCr: number;
  dailyDelta?: {
    dateKey: string;
    previousDateKey: string;
    netNewEvidenceDelta: number;
    promisesProgressedDelta: number;
    outlaySanctionedDeltaCr: number;
    gsdpTrajectoryDeltaBps: number;
    headlineSummaryEn: string;
    headlineSummaryBn: string;
    transitions: DailyDeltaTransition[];
    sectorVelocity: DailySectorVelocity[];
  };
  recentEvidences: Array<{
    id: string;
    title: string;
    titleBn?: string;
    publisher?: string;
    sourceUrl?: string;
    sourceTier: string;
    publishedAt?: string;
    matchedPromiseCode?: string;
    matchedPromiseTitle?: string;
    matchedPromiseTitleBn?: string;
    proposedStatus?: string;
    previousStatus?: string;
    outlayCr?: number;
    confidenceScore?: number;
    districtCode?: string;
    isLiveWebFetched?: boolean;
    excerpt?: string;
  }>;
}

export interface ChatCitation {
  promiseCode?: string;
  promiseTitle?: string;
  sourceTitle: string;
  sourceUrl?: string;
  sourceTier: string;
  publishedAt?: string;
}

export interface ChatQueryRequest {
  message: string;
  locale?: 'en' | 'bn';
  conversationId?: string;
  contextDistrictCode?: string;
  contextCategoryCode?: string;
}

export interface ChatQueryResponse {
  answer: string;
  locale: 'en' | 'bn';
  citations: ChatCitation[];
  suggestedFollowUps: string[];
  matchedPromises?: Array<{
    code: string;
    title: string;
    status: string;
  }>;
}

export interface CitizenEvidenceSubmissionDto {
  promiseCode: string;
  title: string;
  sourceUrl?: string;
  excerpt?: string;
  districtCode?: string;
  submitterEmail?: string;
}

export interface GsdpTrajectoryPoint {
  year: string;
  conservativeUsdB: number;
  baseCaseUsdB: number;
  ambitiousUsdB: number;
  liveImpulseUsdB: number;
  conservativeInrLakhCr: number;
  baseCaseInrLakhCr: number;
  ambitiousInrLakhCr: number;
  liveImpulseInrLakhCr: number;
  capexOutlayCr: number;
}

export interface SabaiMembershipSubmissionDto {
  fullName: string;
  email: string;
  phone: string;
  districtCode?: string;
  amountInr: number;
  utrNumber?: string;
  notes?: string;
}

export interface SectorAnalyticItem {
  code: string;
  nameEn: string;
  nameBn: string;
  shortEn: string;
  shortBn: string;
  total: number;
  delivered: number;
  inProgress: number;
  budgeted: number;
  announced: number;
  notStarted: number;
  executionRate: number;
  sanctionedOutlayCr: number;
  disbursedOutlayCr: number;
  utilizationRate: number;
  jobsProjectedLakhs: number;
}

export interface DailyIngestionPoint {
  dateKey: string;
  dateLabel: string;
  verifiedReleases: number;
  promisesMoved: number;
  outlaySanctionedCr: number;
  cumulativeOutlayCr: number;
  avgConfidencePct: number;
}

export interface RegionalZoneAnalytic {
  zone: string;
  zoneBn: string;
  districtsCount: number;
  populationM: number;
  gsdpSharePct: number;
  avgDeliveryScore: number;
  activePromises: number;
  deliveredPromises: number;
  sanctionedOutlayCr: number;
  perCapitaInr: number;
}

export interface LiveAnalyticsSummary {
  timestamp: string;
  lastSyncedAt: string;
  liveSyncMode: string;
  overview: {
    totalPromises: number;
    deliveredCount: number;
    underImplementationCount: number;
    budgetedCount: number;
    announcedCount: number;
    notStartedCount: number;
    stalledCount: number;
    deliveryCompletionRate: number;
    activeExecutionRate: number;
    weightedProgressScore: number;
    totalEvidences: number;
    approvedEvidences: number;
    pendingEvidences: number;
    rejectedEvidences: number;
    avgConfidenceScorePct: number;
    totalTrackedOutlayCr: number;
    totalDisbursedOutlayCr: number;
    outlayUtilizationPct: number;
    todayOutlayDeltaCr: number;
    currentGsdpUsdB: number;
    currentGsdpInrLakhCr: number;
    targetGsdpUsdB: number;
    targetGsdp2047UsdB: number;
    targetGsdp2033InrLakhCr: number;
    targetGsdp2047InrLakhCr: number;
    gsdpProgressPct: number;
    gsdp2047ProgressPct: number;
    requiredCagrBasePct: number;
    currentRealizedCagrPct: number;
    perCapitaInr: number;
    targetPerCapitaInr: number;
    targetPerCapita2047Inr: number;
    projectedJobsLakhs: number;
    activeSourcesCount: number;
    totalScrapeRuns: number;
    districtsCovered: number;
    avgDistrictDeliveryScore: number;
  };
  gsdpTrajectorySeries: GsdpTrajectoryPoint[];
  sectorAnalytics: SectorAnalyticItem[];
  dailyIngestionSeries: DailyIngestionPoint[];
  evidenceTierBreakdown: {
    byTier: Array<{
      tier: string;
      labelEn: string;
      labelBn: string;
      count: number;
      outlayCr: number;
      avgConfidencePct: number;
      sharePct: number;
    }>;
    byType: Array<{
      type: string;
      labelEn: string;
      labelBn: string;
      count: number;
      outlayCr: number;
    }>;
    byStatus: Array<{
      status: string;
      labelEn: string;
      labelBn: string;
      count: number;
      sharePct: number;
    }>;
  };
  regionalZoneAnalytics: RegionalZoneAnalytic[];
  districtMatrix: Array<{
    code: string;
    nameEn: string;
    nameBn: string;
    zone: string;
    populationM: number;
    gsdpSharePct: number;
    deliveryScore: number;
    promiseCount: number;
    deliveredCount: number;
    inProgressCount: number;
    outlayCr: number;
    perCapitaInr: number;
  }>;
}


