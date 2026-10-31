import {
  DailyTallyMetrics,
  ScrapedSourceDto,
  ScrapeRunSummary,
  ChatQueryRequest,
  ChatQueryResponse,
  CitizenEvidenceSubmissionDto,
  LiveAnalyticsSummary,
} from '@viksit/shared';

// Supports NEXT_PUBLIC_API_URL (e.g. http://localhost:3001) or built-in Next.js /api routes on port 3000
const CONFIGURED_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function resolveApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    // Use same-origin /api routes in browser for zero-latency, resilient full-stack operation
    return `/api${cleanPath}`;
  }
  const baseUrl = CONFIGURED_API_URL || 'http://127.0.0.1:3000/api';
  return `${baseUrl}${cleanPath}`;
}

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = resolveApiUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText}`);
  }

  return res.json();
}

export async function getLiveAnalytics(): Promise<LiveAnalyticsSummary> {
  return fetchApi<LiveAnalyticsSummary>('/analytics');
}

export async function getDistricts() {
  return fetchApi<any[]>('/districts');
}

export async function getDistrictByCode(code: string) {
  const districts = await getDistricts();
  return districts.find((d) => d.code?.toUpperCase() === code.toUpperCase()) || null;
}

export async function getPromises(query: Record<string, string> = {}) {
  const params = new URLSearchParams(query).toString();
  return fetchApi<any[]>(`/promises${params ? `?${params}` : ''}`);
}

export async function getPromiseByCode(code: string) {
  const promises = await getPromises();
  return promises.find((p) => p.code?.toUpperCase() === code.toUpperCase()) || null;
}

export async function updatePromiseLifecycle(
  dto: { code: string; status: string; outlayCr?: number; reason?: string },
  token: string
) {
  return fetchApi<any>('/promises', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });
}

export async function getIndicators() {
  return fetchApi<any[]>('/indicators');
}

export async function getEvidence(query: Record<string, string> = {}) {
  const params = new URLSearchParams(query).toString();
  return fetchApi<any[]>(`/evidence${params ? `?${params}` : ''}`);
}

export async function reviewEvidenceItem(
  id: string,
  reviewStatus: 'APPROVED' | 'REJECTED',
  token?: string
) {
  return fetchApi<any>('/evidence', {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify({ id, reviewStatus }),
  });
}

export async function getDailyTally(): Promise<DailyTallyMetrics> {
  return fetchApi<DailyTallyMetrics>('/scraper/daily-tally');
}

export async function getScraperSources(): Promise<ScrapedSourceDto[]> {
  try {
    return await fetchApi<ScrapedSourceDto[]>('/scraper/sources');
  } catch {
    return [];
  }
}

export async function triggerScrapeRun(): Promise<ScrapeRunSummary> {
  return fetchApi<ScrapeRunSummary>('/scraper/run', {
    method: 'POST',
  });
}

export async function submitCitizenEvidence(dto: CitizenEvidenceSubmissionDto) {
  return fetchApi<{ success: boolean; evidenceId: string; message: string }>('/scraper/citizen-evidence', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function queryChat(dto: ChatQueryRequest): Promise<ChatQueryResponse> {
  return fetchApi<ChatQueryResponse>('/chat/query', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function login(email: string, password: string) {
  return fetchApi<{ accessToken: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

