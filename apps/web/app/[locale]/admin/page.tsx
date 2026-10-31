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
  Lock,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  ExternalLink,
  BarChart3,
  Layers,
  Radio,
  Search,
  Check,
  XCircle,
  ArrowUpRight,
  Database,
  UserCheck,
  SlidersHorizontal,
  Download,
  Users,
  KeyRound,
  LogIn,
  Share2,
} from 'lucide-react';
import { SocialMediaStudio } from '@/components/social/SocialMediaStudio';
import { RealtimeAnalyticsHub } from '@/components/dashboard/RealtimeAnalyticsHub';
import {
  LiveAnalyticsSummary,
  ScrapedSourceDto,
  toBengaliNumerals,
} from '@viksit/shared';
import {
  getLiveAnalytics,
  getPromises,
  getEvidence,
  getScraperSources,
  updatePromiseLifecycle,
  reviewEvidenceItem,
} from '@/lib/api';
import { useAuth } from '@/components/auth/AuthContext';
import {
  updateFirestoreUserRole,
  subscribeToAllUsersForAdmin,
  type AppUserRole,
  type AccountAccessStatus,
} from '@/lib/firebase';

export default function AdminPage() {
  const locale = useLocale();
  const isBn = locale === 'bn';
  const {
    userProfile,
    signInWithGoogle,
    setLocalRoleOverride,
  } = useAuth();

  const fmt = React.useCallback(
    (val: number | string) => (isBn ? toBengaliNumerals(val) : String(val)),
    [isBn]
  );

  // Pre-authenticated default Admin session for immediate CMS access, synced with AuthContext & Google Auth
  const [email, setEmail] = React.useState('admin@viksitbengal.gov.in');
  const [password, setPassword] = React.useState('Admin@123');
  const [token, setToken] = React.useState<string | null>('jwt-cms-live-admin-token');
  const [user, setUser] = React.useState<any>({
    id: 'usr-admin-01',
    name: 'Chief Governance Administrator',
    email: 'admin@viksitbengal.gov.in',
    role: 'ADMIN',
  });
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const [activeWorkspaceTab, setActiveWorkspaceTab] = React.useState<
    'analytics' | 'promises' | 'evidence' | 'scraper' | 'rbac' | 'social'
  >('analytics');

  const [loading, setLoading] = React.useState(false);
  const [analytics, setAnalytics] = React.useState<LiveAnalyticsSummary | null>(null);
  const [promisesList, setPromisesList] = React.useState<any[]>([]);
  const [evidences, setEvidences] = React.useState<any[]>([]);
  const [sources, setSources] = React.useState<ScrapedSourceDto[]>([]);
  const [rbacUsers, setRbacUsers] = React.useState<any[]>([]);
  const [newRbacUser, setNewRbacUser] = React.useState({
    email: '',
    displayName: '',
    role: 'RESEARCHER' as AppUserRole,
    districtCode: 'KOL',
  });
  const [promiseSearch, setPromiseSearch] = React.useState('');
  const [promiseStatusFilter, setPromiseStatusFilter] = React.useState('ALL');
  const [promiseSectorFilter, setPromiseSectorFilter] = React.useState('ALL');
  const [updatingCode, setUpdatingCode] = React.useState<string | null>(null);

  const [message, setMessage] = React.useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // New Promise state
  const [newPromise, setNewPromise] = React.useState({
    code: 'INFRA-99',
    titleEn: 'Kolkata-Siliguri High-Speed Expressway Corridor',
    titleBn: 'কলকাতা-শিলিগুড়ি দ্রুতগতির এক্সপ্রেসওয়ে করিডোর',
    descriptionEn:
      'Dedicated 6-lane access-controlled greenfield highway reducing freight transit time to 6 hours.',
    descriptionBn:
      'কলকাতা ও উত্তরবঙ্গের সংযোগকারী ৬ লেন বিশিষ্ট গ্রিনফিল্ড এক্সপ্রেসওয়ে।',
    categoryCode: 'infrastructure',
    districtCode: 'MLD',
    status: 'UNDER_IMPLEMENTATION',
  });

  // New Evidence state
  const [newEvidence, setNewEvidence] = React.useState({
    promiseCode: 'TEA-01',
    title:
      'State Cabinet Approval & Gazette Notification for Darjeeling Tea & Expressway',
    url: 'https://wb.gov.in/gazette/2026/expressway-approval.pdf',
    sourceType: 'GAZETTE',
    sourceTier: 'TIER_1',
    districtCode: 'DAR',
    proposedStatus: 'UNDER_IMPLEMENTATION',
    outlayCr: 450,
    extractedText:
      'Cabinet grants administrative approval and ₹450 Cr initial disbursement under Notification IND/2026.',
  });

  const loadAllCmsData = React.useCallback(async () => {
    try {
      const [analyticsData, promisesData, evidencesData, sourcesData, usersRes] =
        await Promise.all([
          getLiveAnalytics().catch(() => null),
          getPromises().catch(() => []),
          getEvidence().catch(() => []),
          getScraperSources().catch(() => []),
          fetch('/api/users')
            .then((r) => (r.ok ? r.json() : { users: [] }))
            .catch(() => ({ users: [] })),
        ]);
      if (analyticsData) setAnalytics(analyticsData);
      if (Array.isArray(promisesData)) setPromisesList(promisesData);
      if (Array.isArray(evidencesData)) setEvidences(evidencesData);
      if (Array.isArray(sourcesData)) setSources(sourcesData);
      if (Array.isArray(usersRes?.users)) setRbacUsers(usersRes.users);
    } catch {
      // ignore transient error
    }
  }, []);

  React.useEffect(() => {
    loadAllCmsData();
  }, [loadAllCmsData]);

  // Sync active user with Google Auth / AuthContext profile when signed in
  React.useEffect(() => {
    if (userProfile && userProfile.role !== 'CITIZEN') {
      setUser({
        id: userProfile.uid,
        name: userProfile.displayName,
        email: userProfile.email,
        role: userProfile.role,
      });
      setToken(
        userProfile.role === 'ADMIN'
          ? 'jwt-live-admin-session'
          : 'jwt-live-researcher-session'
      );
    }
  }, [userProfile]);

  // Subscribe to real-time Firestore /users documents when authenticated
  React.useEffect(() => {
    const unsub = subscribeToAllUsersForAdmin((firestoreUsers) => {
      if (firestoreUsers.length > 0) {
        setRbacUsers((prev) => {
          const map = new Map<string, any>();
          for (const u of prev) map.set(u.email.toLowerCase(), u);
          for (const fu of firestoreUsers) {
            map.set(fu.email.toLowerCase(), {
              ...map.get(fu.email.toLowerCase()),
              ...fu,
              authProvider: 'google',
            });
          }
          return Array.from(map.values());
        });
      }
    });
    return () => unsub();
  }, [userProfile?.uid]);

  const handleUpdateUserRbac = async (
    targetUser: any,
    updates: { role?: AppUserRole; accessStatus?: AccountAccessStatus }
  ) => {
    if (user?.role !== 'ADMIN') {
      setMessage({
        text: isBn
          ? '৪০৩ অনুমোদন প্রত্যাখ্যাত: শুধুমাত্র ADMIN ব্যবহারকারীর রোল ও অনুমতি পরিবর্তন করতে পারেন।'
          : '403 Forbidden: Only ADMIN role can modify user roles and access permissions.',
        type: 'error',
      });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'jwt-live-admin-session'}`,
        },
        body: JSON.stringify({
          uid: targetUser.uid,
          email: targetUser.email,
          ...updates,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update user role');

      try {
        await updateFirestoreUserRole(targetUser.uid, updates, targetUser.email);
      } catch {
        // Non-blocking if user hasn't created Firestore doc yet
      }

      setMessage({
        text: isBn
          ? `${targetUser.displayName} (${targetUser.email})-এর অনুমতি সফলভাবে হালনাগাদ করা হয়েছে: ${updates.role || targetUser.role} · ${updates.accessStatus || targetUser.accessStatus}`
          : `Updated permissions for ${targetUser.displayName} (${targetUser.email}) → Role: ${updates.role || targetUser.role} | Status: ${updates.accessStatus || targetUser.accessStatus}`,
        type: 'success',
      });
      await loadAllCmsData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPreApprovedUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'ADMIN') {
      setMessage({
        text: isBn
          ? '৪০৩ অনুমোদন প্রত্যাখ্যাত: শুধুমাত্র ADMIN নতুন রোল বরাদ্দ করতে পারেন।'
          : '403 Forbidden: Only ADMIN role can pre-approve user roles.',
        type: 'error',
      });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newRbacUser.email,
          displayName: newRbacUser.displayName || newRbacUser.email.split('@')[0],
          role: newRbacUser.role,
          districtCode: newRbacUser.districtCode,
          accessStatus: 'APPROVED',
          authProvider: 'google',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add user');
      setNewRbacUser({
        email: '',
        displayName: '',
        role: 'RESEARCHER',
        districtCode: 'KOL',
      });
      setMessage({
        text: isBn
          ? `${data.user.email}-কে ${data.user.role} রোলে নিবন্ধিত করা হয়েছে।`
          : `Pre-authorized ${data.user.email} with role ${data.user.role}.`,
        type: 'success',
      });
      await loadAllCmsData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setToken(data.accessToken);
      setUser(data.user);
      if (data.user?.role) {
        setLocalRoleOverride(data.user.role);
      }
      setShowAuthModal(false);
      setMessage({
        text: isBn
          ? `${data.user?.name} (${data.user?.role}) হিসেবে সফলভাবে সাইন ইন সম্পন্ন হয়েছে।`
          : `Authenticated via JWT as ${data.user?.name} (${data.user?.role}).`,
        type: 'success',
      });
    } catch (err: any) {
      setMessage({
        text: err.message || 'Authentication error',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSwitch = async (
    targetEmail: string,
    targetPassword: string
  ) => {
    setEmail(targetEmail);
    setPassword(targetPassword);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.accessToken);
        setUser(data.user);
        if (data.user?.role) {
          setLocalRoleOverride(data.user.role);
        }
        setShowAuthModal(false);
        setMessage({
          text: isBn
            ? `সক্রিয় ভূমিকা পরিবর্তিত: ${data.user?.name} (${data.user?.role})`
            : `Switched active CMS role to ${data.user?.name} (${data.user?.role})`,
          type: 'success',
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/promises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPromise),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create promise');
      setMessage({
        text: isBn
          ? `প্রতিশ্রুতি [${newPromise.code}] নিবন্ধিত হয়েছে এবং সকল রিয়েল-টাইম চার্ট ও ডেল্টা হালনাগাদ করা হয়েছে!`
          : `Promise [${newPromise.code}] registered in live state catalog — all charts & figures updated!`,
        type: 'success',
      });
      await loadAllCmsData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransitionPromiseStatus = async (
    code: string,
    nextStatus: string,
    outlayCr = 320
  ) => {
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    if (user?.role === 'RESEARCHER') {
      setMessage({
        text: isBn
          ? '৪০৩ অনুমোদন প্রত্যাখ্যাত: শুধুমাত্র ADMIN প্রতিশ্রুতির স্ট্যাটাস পরিবর্তন করতে পারেন।'
          : '403 Forbidden: Only ADMIN role can directly transition promise lifecycle status.',
        type: 'error',
      });
      return;
    }
    setUpdatingCode(code);
    setMessage(null);
    try {
      await updatePromiseLifecycle(
        {
          code,
          status: nextStatus,
          outlayCr,
          reason: `Transitioned to ${nextStatus} via CMS Governance Command Center`,
        },
        token
      );
      setMessage({
        text: isBn
          ? `[${code}] প্রতিশ্রুতির স্ট্যাটাস ${nextStatus}-এ উন্নীত হয়েছে এবং জিএসডিপি ও খাতওয়ারী চার্ট পুনর্গণনা করা হয়েছে।`
          : `Commitment [${code}] transitioned to ${nextStatus} — real-time charts & sector outlays recalculated!`,
        type: 'success',
      });
      await loadAllCmsData();
    } catch (err: any) {
      setMessage({
        text: err.message || 'Failed to update status',
        type: 'error',
      });
    } finally {
      setUpdatingCode(null);
    }
  };

  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setShowAuthModal(true);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEvidence),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit evidence');
      setMessage({
        text: isBn
          ? `প্রমাণ নথি আপলোড সম্পন্ন, [${newEvidence.promiseCode}]-এর সাথে সংযুক্ত এবং ₹${newEvidence.outlayCr} কোটি বরাদ্দ চার্টে যুক্ত হয়েছে!`
          : `Evidence uploaded, linked to [${newEvidence.promiseCode}] (+₹${newEvidence.outlayCr} Cr), and reflected across all live charts!`,
        type: 'success',
      });
      await loadAllCmsData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewEvidence = async (
    id: string,
    reviewStatus: 'APPROVED' | 'REJECTED'
  ) => {
    if (user?.role === 'RESEARCHER') {
      setMessage({
        text: isBn
          ? '৪০৩ অনুমোদন প্রত্যাখ্যাত: গবেষক নিজের জমা দেওয়া প্রমাণ নিজে অনুমোদন করতে পারেন না (Admin প্রয়োজন)।'
          : '403 Forbidden: Researcher cannot approve/reject audit queue items (ADMIN role required).',
        type: 'error',
      });
      return;
    }
    try {
      await reviewEvidenceItem(id, reviewStatus, token || undefined);
      setMessage({
        text: isBn
          ? `প্রমাণ নথি (${id}) স্ট্যাটাস ${reviewStatus} হিসেবে হালনাগাদ করা হয়েছে।`
          : `Evidence item (${id}) marked as ${reviewStatus} — audit confidence & charts updated.`,
        type: 'success',
      });
      await loadAllCmsData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleTriggerLiveScrape = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/scraper/run', { method: 'POST' });
      const data = await res.json();
      setMessage({
        text: isBn
          ? `লাইভ আরএসএস ও জেমিনি যাচাইকরণ সম্পন্ন: ${data.itemsDiscovered}টি নথি যাচাইকৃত এবং ${data.itemsMatched}টি প্রতিশ্রুতি হালনাগাদ করা হয়েছে।`
          : `Live RSS & Gemini verification run complete: ${data.itemsDiscovered} items checked, ${data.itemsMatched} promises reconciled.`,
        type: 'success',
      });
      await loadAllCmsData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Live sync failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const availableSectors = React.useMemo(() => {
    const map = new Map<string, { code: string; titleEn: string; titleBn: string }>();
    for (const p of promisesList) {
      const code = p.category?.code || 'governance';
      if (!map.has(code)) {
        map.set(code, {
          code,
          titleEn: p.category?.titleEn || code,
          titleBn: p.category?.titleBn || p.category?.titleEn || code,
        });
      }
    }
    return Array.from(map.values());
  }, [promisesList]);

  const allFilteredPromises = React.useMemo(() => {
    return promisesList.filter((p) => {
      if (
        promiseStatusFilter !== 'ALL' &&
        p.status !== promiseStatusFilter
      ) {
        return false;
      }
      if (
        promiseSectorFilter !== 'ALL' &&
        (p.category?.code || 'governance') !== promiseSectorFilter
      ) {
        return false;
      }
      if (!promiseSearch.trim()) return true;
      const q = promiseSearch.toLowerCase();
      return (
        p.code?.toLowerCase().includes(q) ||
        p.titleEn?.toLowerCase().includes(q) ||
        p.titleBn?.toLowerCase().includes(q) ||
        p.category?.titleEn?.toLowerCase().includes(q) ||
        p.category?.code?.toLowerCase().includes(q)
      );
    });
  }, [promisesList, promiseSearch, promiseStatusFilter, promiseSectorFilter]);

  const filteredPromises = React.useMemo(
    () => allFilteredPromises.slice(0, 30),
    [allFilteredPromises]
  );

  const filteredSummary = React.useMemo(() => {
    const total = allFilteredPromises.length;
    const delivered = allFilteredPromises.filter(
      (p) => p.status === 'DELIVERED'
    ).length;
    const inProgress = allFilteredPromises.filter(
      (p) => p.status === 'UNDER_IMPLEMENTATION'
    ).length;
    const budgeted = allFilteredPromises.filter(
      (p) => p.status === 'BUDGETED' || p.status === 'FUNDED'
    ).length;
    const announced = allFilteredPromises.filter(
      (p) => p.status === 'ANNOUNCED'
    ).length;
    const completionPct =
      total > 0
        ? +(
            ((delivered * 1.0 +
              inProgress * 0.65 +
              budgeted * 0.45 +
              announced * 0.2) /
              total) *
            100
          ).toFixed(1)
        : 0;
    return {
      total,
      delivered,
      inProgress,
      announced,
      completionPct,
    };
  }, [allFilteredPromises]);

  const handleExportFilteredPromisesCsv = React.useCallback(() => {
    if (allFilteredPromises.length === 0) {
      setMessage({
        text: isBn
          ? 'রফতানি করার মতো কোনো ফিল্টারকৃত প্রতিশ্রুতি পাওয়া যায়নি।'
          : 'No matching promises in current filter to export.',
        type: 'error',
      });
      return;
    }

    const escapeCsvField = (val: unknown): string => {
      const str = String(val ?? '').replace(/\r?\n|\r/g, ' ').trim();
      if (str.includes(',') || str.includes('"') || str.includes(';')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const getResultCompletionPct = (status: string): number => {
      switch ((status || '').toUpperCase()) {
        case 'DELIVERED':
          return 100;
        case 'UNDER_IMPLEMENTATION':
          return 65;
        case 'BUDGETED':
        case 'FUNDED':
          return 45;
        case 'ANNOUNCED':
          return 20;
        default:
          return 0;
      }
    };

    const headers = [
      'code',
      'title',
      'titleBn',
      'status',
      'sector',
      'sectorCode',
      'resultCompletionPct',
      'verifiedEvidenceCount',
      'sanctionedOutlayCr',
      'latestResultMilestone',
      'districtsCovered',
      'responsibleDepartment',
      'lastVerifiedDate',
    ];

    const rows = allFilteredPromises.map((p) => {
      const sectorName = p.category?.titleEn || p.category?.code || 'Governance';
      const sectorCode = p.category?.code || 'governance';
      const completionPct = getResultCompletionPct(p.status);
      const linkedEvs = evidences.filter(
        (ev) => ev.matchedPromiseCode?.toUpperCase() === p.code?.toUpperCase()
      );
      const evidenceCount = Math.max(
        linkedEvs.length,
        Array.isArray(p.evidenceItems) ? p.evidenceItems.length : 1
      );
      const outlayCr =
        linkedEvs.reduce((sum, e) => sum + (Number(e.outlayCr) || 0), 0) ||
        (p.status === 'DELIVERED'
          ? 420
          : p.status === 'UNDER_IMPLEMENTATION'
            ? 310
            : 180);

      const latestHistory =
        Array.isArray(p.statusHistory) && p.statusHistory.length > 0
          ? p.statusHistory[p.statusHistory.length - 1]
          : null;
      const latestEvidence =
        linkedEvs[0] ||
        (Array.isArray(p.evidenceItems) ? p.evidenceItems[0] : null);
      const latestMilestone =
        latestEvidence?.title ||
        latestHistory?.reason ||
        `Tracked under ${sectorName} (${p.status})`;

      const districtCodes = Array.isArray(p.districts)
        ? p.districts
            .map((d: any) => d.districtCode || d.code || d)
            .filter(Boolean)
            .join(' | ')
        : 'KOL';

      const lastVerified =
        latestEvidence?.publishedAt?.slice(0, 10) ||
        latestEvidence?.verifiedAt ||
        latestHistory?.timestamp?.slice(0, 10) ||
        new Date().toISOString().slice(0, 10);

      return [
        p.code || '',
        p.titleEn || '',
        p.titleBn || '',
        p.status || 'ANNOUNCED',
        sectorName,
        sectorCode,
        `${completionPct}%`,
        evidenceCount,
        outlayCr,
        latestMilestone,
        districtCodes,
        p.responsibleDepartment || 'Government of West Bengal Secretariat',
        lastVerified,
      ]
        .map(escapeCsvField)
        .join(',');
    });

    // Prefix with UTF-8 BOM (\uFEFF) so Excel / Numbers / Google Sheets render Bengali & symbols cleanly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filterSlug = [
      promiseStatusFilter !== 'ALL' ? promiseStatusFilter.toLowerCase() : null,
      promiseSectorFilter !== 'ALL' ? promiseSectorFilter.toLowerCase() : null,
    ]
      .filter(Boolean)
      .join('-');
    const filename = `viksit-bengal-promises-vs-results${
      filterSlug ? `-${filterSlug}` : ''
    }-${dateStamp}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage({
      text: isBn
        ? `সিএসভি (CSV) রিপোর্ট সফলভাবে ডাউনলোড হয়েছে: ${allFilteredPromises.length}টি প্রতিশ্রুতি বনাম ফলাফল রেকর্ড (${filename})।`
        : `Exported ${allFilteredPromises.length} filtered Promise vs. Results records to CSV (${filename}).`,
      type: 'success',
    });
  }, [
    allFilteredPromises,
    evidences,
    isBn,
    promiseSectorFilter,
    promiseStatusFilter,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Executive Command Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-medium">
              <span className="px-2.5 py-0.5 rounded-md font-bold bg-primary text-white uppercase tracking-wider">
                {isBn ? 'সিএমএস ও ডেটা ইন্টেলিজেন্স কেন্দ্র' : '007 RBAC CMS & LIVE ANALYTICS'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-stone-600">
                JWT Role-Based Governance Engine
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {isBn ? 'রিয়েল-টাইম ডেটা স্ট্রিম সক্রিয়' : 'Real-Time Telemetry Active'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mt-2 flex items-center gap-2.5 tracking-tight">
              <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
              {isBn
                ? 'প্রশাসনিক সিএমএস পোর্টাল ও রিয়েল-টাইম ডেটা বিশ্লেষণ'
                : 'CMS Governance Portal & Real-Time Visual Analytics'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl">
              {isBn
                ? 'সরকারি প্রতিশ্রুতির অগ্রগতি, খাতওয়ারী আর্থিক বরাদ্দ, গেজেট প্রমাণ যাচাইকরণ এবং রিয়েল-টাইম চার্ট ও পরিসংখ্যান নিয়ন্ত্রণ কেন্দ্র।'
                : 'Real-time econometric command center for analyzing state commitments through interactive charts, financial figures, evidence audits, and lifecycle controls.'}
            </p>
          </div>

          {/* Active Session & Quick Role Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() =>
                  handleQuickRoleSwitch(
                    'admin@viksitbengal.gov.in',
                    'Admin@123'
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  token && user?.role === 'ADMIN'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200'
                }`}
              >
                {isBn ? 'প্রশাসক (ADMIN)' : 'Admin Role'}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickRoleSwitch(
                    'researcher@viksitbengal.gov.in',
                    'Researcher@123'
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  token && user?.role === 'RESEARCHER'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-200'
                }`}
              >
                {isBn ? 'গবেষক (RESEARCHER)' : 'Researcher Role'}
              </button>
              <button
                type="button"
                onClick={() => setShowAuthModal((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-200 flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isBn ? 'জেডব্লিউটি লগইন' : 'JWT Login'}</span>
              </button>
            </div>

            <Button
              type="button"
              onClick={handleTriggerLiveScrape}
              disabled={loading}
              className="gap-2 bg-emerald-950 hover:bg-emerald-900 text-white font-bold"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span>
                {isBn ? 'লাইভ সোর্স স্ক্র্যাপার চালান' : 'Run Live Source Scraper'}
              </span>
            </Button>
          </div>
        </div>

        {/* Active RBAC Identity Strip */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-950 border border-emerald-200 font-bold">
              <UserCheck className="w-3.5 h-3.5 text-primary" />
              {user ? `${user.name} (${user.role})` : 'Guest Observer'}
            </span>
            <span className="text-stone-500 font-mono">{user?.email}</span>
          </div>

          {/* CMS Workspace Navigation Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                id: 'analytics',
                icon: BarChart3,
                labelEn: '1. Live Charts, Graphs & Figures',
                labelBn: '১. লাইভ চার্ট, গ্রাফ ও পরিসংখ্যান',
              },
              {
                id: 'promises',
                icon: SlidersHorizontal,
                labelEn: `2. Promise Lifecycle Manager (${promisesList.length || 141})`,
                labelBn: `২. প্রতিশ্রুতি ব্যবস্থাপনা (${fmt(promisesList.length || 141)})`,
              },
              {
                id: 'evidence',
                icon: FileText,
                labelEn: `3. Evidence Audit Ledger (${evidences.length || 8})`,
                labelBn: `৩. প্রমাণ ও অডিট খতিয়ান (${fmt(evidences.length || 8)})`,
              },
              {
                id: 'scraper',
                icon: Radio,
                labelEn: `4. Scraper Telemetry (${sources.length || 7} Feeds)`,
                labelBn: `৪. স্ক্র্যাপার টেলিমেট্রি (${fmt(sources.length || 7)} উৎস)`,
              },
              {
                id: 'rbac',
                icon: Users,
                labelEn: `5. Users, Google Auth & Roles (${rbacUsers.length || 6})`,
                labelBn: `৫. ব্যবহারকারী ও রোল অনুমতি (${fmt(rbacUsers.length || 6)})`,
              },
              {
                id: 'social',
                icon: Share2,
                labelEn: '6. Social Media Studio & Mixpost',
                labelBn: '৬. সোশ্যাল মিডিয়া স্টুডিও ও মিক্সপোস্ট',
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveWorkspaceTab(tab.id as any)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeWorkspaceTab === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{isBn ? tab.labelBn : tab.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
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

      {/* Optional JWT Authentication Panel (Toggled via 'JWT Login' button) */}
      {showAuthModal && (
        <Card className="border-2 border-primary/30 shadow-md bg-white">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                {isBn
                  ? 'নিরাপদ জেডব্লিউটি (JWT) প্রমাণীকরণ ও ভূমিকা পরিবর্তন'
                  : 'JWT Role Authentication & Session Credentials'}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'প্রশাসক (ADMIN) বা গবেষক (RESEARCHER) হিসেবে সাইন ইন করুন'
                  : 'Authenticate with RBAC credentials to test ADMIN vs. RESEARCHER permissions.'}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAuthModal(false)}
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </Button>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleLogin}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
            >
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 border rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold"
                >
                  {loading ? 'Authenticating...' : 'Sign In with JWT'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* WORKSPACE TAB 1: REAL-TIME VISUAL CHARTS, GRAPHS & NUMERICAL FIGURES */}
      {activeWorkspaceTab === 'analytics' && (
        <RealtimeAnalyticsHub
          locale={locale}
          initialAnalytics={analytics}
          variant="cms"
          onDataRefreshed={(updated) => setAnalytics(updated)}
        />
      )}

      {/* WORKSPACE TAB 2: PROMISE LIFECYCLE MANAGER & NEW COMMITMENT REGISTRATION */}
      {activeWorkspaceTab === 'promises' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Cols: Register New Promise Form */}
          <Card className="lg:col-span-4 border border-stone-200 shadow-xs h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary" />
                {isBn ? 'নতুন প্রতিশ্রুতি নিবন্ধন' : 'Register New Policy Commitment'}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'নতুন সরকারি প্রতিশ্রুতি যুক্ত করলে তাৎক্ষণিকভাবে সকল চার্ট ও ডেল্টা হালনাগাদ হবে'
                  : 'Adds a tracked commitment to the live state catalog and updates all charts'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePromise} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700">
                      Promise Code
                    </label>
                    <input
                      type="text"
                      value={newPromise.code}
                      onChange={(e) =>
                        setNewPromise({ ...newPromise, code: e.target.value })
                      }
                      className="w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700">
                      District Code
                    </label>
                    <select
                      value={newPromise.districtCode}
                      onChange={(e) =>
                        setNewPromise({
                          ...newPromise,
                          districtCode: e.target.value,
                        })
                      }
                      className="w-full min-h-[42px] px-2 py-1.5 border rounded-lg text-xs font-mono"
                    >
                      <option value="KOL">KOL · Kolkata</option>
                      <option value="N24">N24 · North 24 Parganas</option>
                      <option value="DAR">DAR · Darjeeling</option>
                      <option value="EMD">EMD · Purba Medinipur</option>
                      <option value="HOG">HOG · Hooghly</option>
                      <option value="MLD">MLD · Malda</option>
                      <option value="PBD">PBD · Paschim Bardhaman</option>
                      <option value="PUR">PUR · Purulia</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700">
                    Sector Category
                  </label>
                  <select
                    value={newPromise.categoryCode}
                    onChange={(e) =>
                      setNewPromise({
                        ...newPromise,
                        categoryCode: e.target.value,
                      })
                    }
                    className="w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-xs"
                  >
                    <option value="infrastructure">Infrastructure & Highways</option>
                    <option value="economy">Industry, Ports & Manufacturing</option>
                    <option value="youth">IT, Semiconductors & Youth Jobs</option>
                    <option value="farmers">Agriculture, MSP & Cold Chain</option>
                    <option value="tea">Tea Estates & GI Exports</option>
                    <option value="fishery">Blue Economy & Fisheries</option>
                    <option value="health">Critical Care & Healthcare</option>
                    <option value="education">Higher Education & Skills</option>
                    <option value="women">Women Empowerment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={newPromise.titleEn}
                    onChange={(e) =>
                      setNewPromise({ ...newPromise, titleEn: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700">
                    Title (Bengali)
                  </label>
                  <input
                    type="text"
                    value={newPromise.titleBn}
                    onChange={(e) =>
                      setNewPromise({ ...newPromise, titleBn: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700">
                    Initial Lifecycle Status
                  </label>
                  <select
                    value={newPromise.status}
                    onChange={(e) =>
                      setNewPromise({ ...newPromise, status: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-xs"
                  >
                    <option value="ANNOUNCED">ANNOUNCED</option>
                    <option value="BUDGETED">BUDGETED</option>
                    <option value="UNDER_IMPLEMENTATION">
                      UNDER_IMPLEMENTATION
                    </option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 font-bold"
                >
                  {isBn ? 'প্রতিশ্রুতি যুক্ত করুন' : 'Create Commitment & Update Charts'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right 8 Cols: Live Interactive Promise Lifecycle Matrix */}
          <Card className="lg:col-span-8 border border-stone-200 shadow-xs">
            <CardHeader className="pb-4 border-b border-stone-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {isBn
                      ? 'লাইভ প্রতিশ্রুতি বনাম ফলাফল ও স্ট্যাটাস নিয়ন্ত্রণ'
                      : 'Live Promise vs. Results Matrix & Lifecycle Controls'}
                  </CardTitle>
                  <CardDescription>
                    {isBn
                      ? 'যেকোনো প্রতিশ্রুতির স্ট্যাটাস পরিবর্তন করুন অথবা ফিল্টারকৃত ডেটাসেট সিএসভি (CSV) রিপোর্ট হিসেবে ডাউনলোড করুন'
                      : 'Filter commitments by sector or status, transition lifecycle stages in real time, or export the filtered Promise vs. Results CSV report'}
                  </CardDescription>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleExportFilteredPromisesCsv}
                  disabled={allFilteredPromises.length === 0}
                  className="gap-2 bg-emerald-950 hover:bg-emerald-900 text-white font-bold shrink-0 self-start"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isBn
                      ? `সিএসভি রিপোর্ট ডাউনলোড (${fmt(filteredSummary.total)})`
                      : `Export CSV Report (${filteredSummary.total})`}
                  </span>
                </Button>
              </div>

              {/* Filter Controls Bar (Search + Sector Filter + Status Filter) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promiseSearch}
                    onChange={(e) => setPromiseSearch(e.target.value)}
                    placeholder={
                      isBn
                        ? 'কোড, শিরোনাম বা খাত খুঁজুন...'
                        : 'Search code, title, or sector...'
                    }
                    className="w-full pl-8 pr-3 py-1.5 border border-stone-300 rounded-lg text-xs min-h-[40px] focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <select
                  aria-label="Filter by Sector"
                  value={promiseSectorFilter}
                  onChange={(e) => setPromiseSectorFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs min-h-[40px] bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">
                    {isBn
                      ? `সকল উন্নয়ন খাত (${fmt(availableSectors.length)})`
                      : `All Sectors (${availableSectors.length})`}
                  </option>
                  {availableSectors.map((sec) => (
                    <option key={sec.code} value={sec.code}>
                      {isBn ? sec.titleBn : sec.titleEn}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter by Status"
                  value={promiseStatusFilter}
                  onChange={(e) => setPromiseStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs min-h-[40px] bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">
                    {isBn
                      ? `সকল স্ট্যাটাস (${fmt(promisesList.length)})`
                      : `All Statuses (${promisesList.length})`}
                  </option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="UNDER_IMPLEMENTATION">
                    UNDER_IMPLEMENTATION (In Progress)
                  </option>
                  <option value="BUDGETED">BUDGETED</option>
                  <option value="ANNOUNCED">ANNOUNCED</option>
                </select>
              </div>

              {/* Filtered Dataset Promise vs. Results Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                <div className="px-3 py-2 rounded-lg bg-stone-50 border border-stone-200">
                  <div className="text-[10px] font-bold uppercase text-stone-500">
                    {isBn ? 'ফিল্টারকৃত মোট' : 'Filtered Rows'}
                  </div>
                  <div className="text-base font-black font-mono text-ink">
                    {fmt(filteredSummary.total)}
                  </div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                  <div className="text-[10px] font-bold uppercase text-emerald-800">
                    {isBn ? 'সম্পন্ন (Delivered)' : 'Delivered'}
                  </div>
                  <div className="text-base font-black font-mono text-primary">
                    {fmt(filteredSummary.delivered)}
                  </div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-amber-50/70 border border-amber-200">
                  <div className="text-[10px] font-bold uppercase text-amber-900">
                    {isBn ? 'চলমান (Active)' : 'In Progress'}
                  </div>
                  <div className="text-base font-black font-mono text-amber-800">
                    {fmt(filteredSummary.inProgress)}
                  </div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-blue-50/70 border border-blue-200">
                  <div className="text-[10px] font-bold uppercase text-blue-900">
                    {isBn ? 'ঘোষিত (Announced)' : 'Announced'}
                  </div>
                  <div className="text-base font-black font-mono text-blue-800">
                    {fmt(filteredSummary.announced)}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 px-3 py-2 rounded-lg bg-stone-900 text-white">
                  <div className="text-[10px] font-bold uppercase text-emerald-300">
                    {isBn ? 'ফলাফল সূচক' : 'Result Score'}
                  </div>
                  <div className="text-base font-black font-mono">
                    {fmt(filteredSummary.completionPct)}%
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto pr-1">
                {filteredPromises.map((p) => (
                  <div
                    key={p.id || p.code}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/80 px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-primary">
                          {p.code}
                        </span>
                        <span className="text-stone-500 font-medium">
                          {isBn ? p.category?.titleBn : p.category?.titleEn}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {p.status}
                        </Badge>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-ink">
                        {isBn ? p.titleBn : p.titleEn}
                      </div>
                    </div>

                    {/* One-Click Lifecycle Stage Transition Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {[
                        { status: 'ANNOUNCED', label: 'Announced' },
                        { status: 'UNDER_IMPLEMENTATION', label: 'In Progress' },
                        { status: 'DELIVERED', label: 'Delivered' },
                      ].map((st) => {
                        const isCurrent = p.status === st.status;
                        return (
                          <button
                            key={st.status}
                            type="button"
                            disabled={isCurrent || updatingCode === p.code}
                            onClick={() =>
                              handleTransitionPromiseStatus(p.code, st.status)
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                              isCurrent
                                ? 'bg-primary text-white shadow-xs cursor-default'
                                : 'bg-stone-100 text-stone-700 hover:bg-emerald-100 hover:text-primary border border-stone-200'
                            }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* WORKSPACE TAB 3: EVIDENCE UPLOAD & LIVE AUDIT VERIFICATION QUEUE */}
      {activeWorkspaceTab === 'evidence' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Upload Evidence Form */}
          <Card className="lg:col-span-5 border border-stone-200 shadow-xs h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                {isBn
                  ? 'সরকারি গেজেট ও অডিট প্রমাণ আপলোড'
                  : 'Submit Tier 1–3 Verification Evidence'}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'নতুন গেজেট বা পিআইবি বিজ্ঞপ্তির বরাদ্দ যুক্ত করলে তাৎক্ষণিকভাবে চার্ট ও ডেল্টায় প্রতিফলিত হবে'
                  : 'Upload official gazette or institutional citation to update promise status and capital outlay charts'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateEvidence} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700">
                      Promise Code
                    </label>
                    <input
                      type="text"
                      value={newEvidence.promiseCode}
                      onChange={(e) =>
                        setNewEvidence({
                          ...newEvidence,
                          promiseCode: e.target.value,
                        })
                      }
                      className="w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700">
                      Sanctioned Outlay (₹ Cr)
                    </label>
                    <input
                      type="number"
                      value={newEvidence.outlayCr}
                      onChange={(e) =>
                        setNewEvidence({
                          ...newEvidence,
                          outlayCr: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700">
                    Evidence Title / Notification Header
                  </label>
                  <input
                    type="text"
                    value={newEvidence.title}
                    onChange={(e) =>
                      setNewEvidence({ ...newEvidence, title: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700">
                    Source Document URL
                  </label>
                  <input
                    type="url"
                    value={newEvidence.url}
                    onChange={(e) =>
                      setNewEvidence({ ...newEvidence, url: e.target.value })
                    }
                    className="w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700">
                      Source Type
                    </label>
                    <select
                      value={newEvidence.sourceType}
                      onChange={(e) =>
                        setNewEvidence({
                          ...newEvidence,
                          sourceType: e.target.value,
                        })
                      }
                      className="w-full min-h-[42px] px-2 py-1.5 border rounded-lg text-xs"
                    >
                      <option value="GAZETTE">GAZETTE</option>
                      <option value="GOVERNMENT_ORDER">GOVERNMENT_ORDER</option>
                      <option value="STATISTICAL_RELEASE">
                        STATISTICAL_RELEASE (PIB)
                      </option>
                      <option value="AUDIT">AUDIT (CAG)</option>
                      <option value="BUDGET">BUDGET</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700">
                      Source Tier
                    </label>
                    <select
                      value={newEvidence.sourceTier}
                      onChange={(e) =>
                        setNewEvidence({
                          ...newEvidence,
                          sourceTier: e.target.value,
                        })
                      }
                      className="w-full min-h-[42px] px-2 py-1.5 border rounded-lg text-xs"
                    >
                      <option value="TIER_1">Tier 1 (Official Gazette/PIB)</option>
                      <option value="TIER_2">Tier 2 (Institutional)</option>
                      <option value="TIER_3">Tier 3 (Public / Field)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700">
                    Key Excerpt / Financial Sanction Summary
                  </label>
                  <textarea
                    rows={2}
                    value={newEvidence.extractedText}
                    onChange={(e) =>
                      setNewEvidence({
                        ...newEvidence,
                        extractedText: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 font-bold"
                >
                  {isBn
                    ? 'প্রমাণ জমা দিন ও চার্ট হালনাগাদ করুন'
                    : 'Submit Evidence & Update Live Analytics'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right 7 Cols: Live Evidence Verification & Moderation Ledger */}
          <Card className="lg:col-span-7 border border-stone-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-stone-100">
              <CardTitle className="text-lg font-bold">
                {isBn
                  ? 'সাম্প্রতিক যাচাইকৃত প্রমাণ ও অডিট মডারেশন সারি'
                  : 'Live Evidence Verification & Audit Moderation Queue'}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'স্ক্র্যাপার, গবেষক এবং নাগরিকদের দ্বারা জমা দেওয়া সাম্প্রতিক নথি অনুমোদন বা পর্যালোচনা করুন'
                  : 'Real-time log of official gazettes, PIB releases, and citizen submissions with RBAC moderation'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="divide-y divide-stone-100 text-xs max-h-[600px] overflow-y-auto">
                {evidences.map((ev) => (
                  <div
                    key={ev.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-stone-500">
                        <span className="font-mono font-bold text-primary bg-emerald-50 px-1.5 py-0.5 rounded">
                          [{ev.matchedPromiseCode || 'INFRA-01'}]
                        </span>
                        <span className="font-semibold text-stone-700">
                          {ev.sourceTier}
                        </span>
                        <span>·</span>
                        <span>{ev.publisher}</span>
                        {ev.confidenceScore && (
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-800">
                            {Math.round(ev.confidenceScore * 100)}% conf
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-stone-900 text-xs sm:text-sm">
                        {isBn ? ev.titleBn || ev.title : ev.title}
                      </div>
                      {ev.extractedText && (
                        <p className="text-[11px] text-stone-600 line-clamp-2">
                          {isBn
                            ? ev.extractedTextBn || ev.extractedText
                            : ev.extractedText}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ev.outlayCr && (
                        <span className="font-mono tabular-nums font-bold text-stone-900 bg-stone-100 px-2 py-1 rounded">
                          ₹{ev.outlayCr} Cr
                        </span>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          ev.reviewStatus === 'APPROVED'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                            : ev.reviewStatus === 'REJECTED'
                              ? 'border-red-300 bg-red-50 text-red-900'
                              : 'border-amber-300 bg-amber-50 text-amber-900'
                        }`}
                      >
                        {ev.reviewStatus || 'APPROVED'}
                      </Badge>
                      <button
                        type="button"
                        title="Approve Evidence"
                        onClick={() => handleReviewEvidence(ev.id, 'APPROVED')}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-primary border border-emerald-200"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Flag / Reject Evidence"
                        onClick={() => handleReviewEvidence(ev.id, 'REJECTED')}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      {ev.sourceUrl && (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* WORKSPACE TAB 4: AUTONOMOUS SCRAPER & VERIFIED SOURCE TELEMETRY */}
      {activeWorkspaceTab === 'scraper' && (
        <Card className="border border-stone-200 shadow-xs">
          <CardHeader className="pb-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                {isBn
                  ? 'পর্যবেক্ষণকৃত সরকারি ও প্রাতিষ্ঠানিক ডেটা উৎস (Tier 1–3)'
                  : 'Monitored Official Gazette, PIB & Institutional Data Feeds'}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'কোনো পেইড ফায়ারক্রল ছাড়াই সরকারি আরএসএস ফিড ও জেমিনি সার্চ গ্রাউন্ডিংয়ের মাধ্যমে স্বয়ংক্রিয় যাচাইকরণ'
                  : 'Zero-cost real-time ingestion polling PIB Kolkata, WB Extraordinary Gazette, CAG Audit Reports, WBIDC, and Tea Board'}
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={handleTriggerLiveScrape}
              disabled={loading}
              className="gap-2 font-bold"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span>
                {isBn ? 'এখনই সকল উৎস সিঙ্ক করুন' : 'Poll All Verified Feeds Now'}
              </span>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map((src) => (
                <div
                  key={src.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] border-emerald-300 bg-emerald-50 text-primary font-bold"
                      >
                        {src.sourceTier} · {src.sourceType}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        ACTIVE
                      </span>
                    </div>
                    <div className="font-bold text-ink text-sm pt-1">
                      {src.name}
                    </div>
                    <div className="text-xs text-stone-500 font-mono truncate">
                      {src.url}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-200/80 pt-2">
                    <span>
                      {isBn ? 'সর্বশেষ সিঙ্ক:' : 'Last Polled:'}{' '}
                      {src.lastScrapedAt
                        ? new Date(src.lastScrapedAt).toLocaleTimeString()
                        : 'Today 06:00 IST'}
                    </span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isBn ? 'উৎস দেখুন' : 'Inspect Feed'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* WORKSPACE TAB 5: USERS, GOOGLE AUTH & ROLE PERMISSIONS (RBAC CONSOLE) */}
      {activeWorkspaceTab === 'social' && (
        <SocialMediaStudio token={token} userRole={user?.role} />
      )}

      {activeWorkspaceTab === 'rbac' && (
        <div className="space-y-6">
          {/* RBAC Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-stone-500">
                {isBn ? 'মোট নিবন্ধিত অ্যাকাউন্ট' : 'Total Registered Users'}
              </div>
              <div className="text-2xl font-black font-mono text-ink mt-1">
                {fmt(rbacUsers.length)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-emerald-900">
                {isBn ? 'অ্যাডমিন (ADMIN)' : 'Administrators (ADMIN)'}
              </div>
              <div className="text-2xl font-black font-mono text-primary mt-1">
                {fmt(rbacUsers.filter((u) => u.role === 'ADMIN').length)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-amber-900">
                {isBn ? 'গবেষক (RESEARCHER)' : 'Researchers (RESEARCHER)'}
              </div>
              <div className="text-2xl font-black font-mono text-amber-800 mt-1">
                {fmt(rbacUsers.filter((u) => u.role === 'RESEARCHER').length)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-blue-900">
                {isBn ? 'নাগরিক (CITIZEN)' : 'Verified Citizens (CITIZEN)'}
              </div>
              <div className="text-2xl font-black font-mono text-blue-800 mt-1">
                {fmt(rbacUsers.filter((u) => u.role === 'CITIZEN').length)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 shadow-xs">
              <div className="text-[11px] font-bold uppercase text-red-900">
                {isBn ? 'সীমিত (RESTRICTED)' : 'Restricted Accounts'}
              </div>
              <div className="text-2xl font-black font-mono text-red-700 mt-1">
                {fmt(
                  rbacUsers.filter((u) => u.accessStatus === 'RESTRICTED').length
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 Cols: Pre-Approve Google Account & Role Assignment */}
            <Card className="lg:col-span-4 border border-stone-200 shadow-xs h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  {isBn
                    ? 'গুগল অ্যাকাউন্ট ও রোল পূর্ব-অনুমোদন'
                    : 'Pre-Approve Google User & Assign Role'}
                </CardTitle>
                <CardDescription>
                  {isBn
                    ? 'নতুন গুগল ব্যবহারকারীকে ADMIN, RESEARCHER বা CITIZEN রোল বরাদ্দ করুন'
                    : 'Assign ADMIN, RESEARCHER, or CITIZEN permissions to a Google or institutional email address.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAddPreApprovedUser} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Google / Institutional Email
                    </label>
                    <input
                      type="email"
                      value={newRbacUser.email}
                      onChange={(e) =>
                        setNewRbacUser({ ...newRbacUser, email: e.target.value })
                      }
                      placeholder="user@gmail.com"
                      className="w-full min-h-[42px] px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Full Display Name
                    </label>
                    <input
                      type="text"
                      value={newRbacUser.displayName}
                      onChange={(e) =>
                        setNewRbacUser({
                          ...newRbacUser,
                          displayName: e.target.value,
                        })
                      }
                      placeholder="Dr. Indranil Sen"
                      className="w-full min-h-[42px] px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Assigned Role
                      </label>
                      <select
                        value={newRbacUser.role}
                        onChange={(e) =>
                          setNewRbacUser({
                            ...newRbacUser,
                            role: e.target.value as AppUserRole,
                          })
                        }
                        className="w-full min-h-[42px] px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white"
                      >
                        <option value="CITIZEN">CITIZEN</option>
                        <option value="RESEARCHER">RESEARCHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        District Code
                      </label>
                      <input
                        type="text"
                        value={newRbacUser.districtCode}
                        onChange={(e) =>
                          setNewRbacUser({
                            ...newRbacUser,
                            districtCode: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full min-h-[42px] px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full font-bold"
                  >
                    {isBn
                      ? 'রোল বরাদ্দ ও সংরক্ষণ করুন'
                      : 'Authorize User & Assign Role'}
                  </Button>
                </form>

                <div className="pt-3 border-t border-stone-200 space-y-2">
                  <div className="text-xs font-bold text-stone-700">
                    {isBn ? 'লাইভ গুগল ওঅথ যাচাইকরণ:' : 'Live Google OAuth Sign-In:'}
                  </div>
                  <button
                    type="button"
                    onClick={() => void signInWithGoogle()}
                    className="w-full min-h-[42px] px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-primary" />
                    <span>
                      {isBn
                        ? 'গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন / পরিবর্তন করুন'
                        : 'Link / Switch Google Account via Popup'}
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Right 8 Cols: Live User & Role Permission Matrix */}
            <Card className="lg:col-span-8 border border-stone-200 shadow-xs">
              <CardHeader className="pb-4 border-b border-stone-100">
                <CardTitle className="text-lg font-bold">
                  {isBn
                    ? 'ব্যবহারকারী, গুগল ওঅথ এবং ভূমিকা অনুমতি তালিকা (Firestore + RBAC)'
                    : 'Registered Users, Google Auth Accounts & Role Permissions'}
                </CardTitle>
                <CardDescription>
                  {isBn
                    ? 'যেকোনো ব্যবহারকারীর রোল (CITIZEN / RESEARCHER / ADMIN) পরিবর্তন করুন অথবা প্রবেশাধিকার নিয়ন্ত্রণ করুন'
                    : 'Promote or demote users between CITIZEN, RESEARCHER, and ADMIN roles or restrict portal access in real time'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="divide-y divide-stone-100">
                  {rbacUsers.map((u) => (
                    <div
                      key={u.uid || u.email}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-ink">
                            {u.displayName}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono font-bold ${
                              u.role === 'ADMIN'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                                : u.role === 'RESEARCHER'
                                  ? 'border-amber-300 bg-amber-50 text-amber-950'
                                  : 'border-blue-300 bg-blue-50 text-blue-950'
                            }`}
                          >
                            {u.role}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              u.accessStatus === 'RESTRICTED'
                                ? 'border-red-300 bg-red-50 text-red-900 font-bold'
                                : 'border-stone-200 bg-stone-50 text-stone-600'
                            }`}
                          >
                            {u.accessStatus || 'APPROVED'}
                          </Badge>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                            {u.authProvider === 'institutional'
                              ? 'JWT Institutional'
                              : 'Google OAuth'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 font-mono">
                          {u.email} · District: {u.districtCode || 'KOL'}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {(['CITIZEN', 'RESEARCHER', 'ADMIN'] as AppUserRole[]).map(
                          (targetRole) => (
                            <button
                              key={targetRole}
                              type="button"
                              disabled={loading || u.role === targetRole}
                              onClick={() =>
                                handleUpdateUserRbac(u, { role: targetRole })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                                u.role === targetRole
                                  ? 'bg-stone-900 text-white border-stone-900 cursor-default'
                                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                              }`}
                            >
                              {targetRole}
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleUpdateUserRbac(u, {
                              accessStatus:
                                u.accessStatus === 'RESTRICTED'
                                  ? 'APPROVED'
                                  : 'RESTRICTED',
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                            u.accessStatus === 'RESTRICTED'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {u.accessStatus === 'RESTRICTED'
                            ? isBn
                              ? 'অনুমোদন দিন'
                              : 'Approve'
                            : isBn
                              ? 'সীমিত করুন'
                              : 'Restrict'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
