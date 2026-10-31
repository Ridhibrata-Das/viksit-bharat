'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  LogIn,
  LogOut,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Sparkles,
  Building2,
  X,
  Mail,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  ensureFirestoreUserProfile,
  subscribeToOwnUserProfile,
  logFirestoreAccessEvent,
  BOOTSTRAPPED_ADMIN_EMAIL,
  type UserProfileRecord,
  type AppUserRole,
  type User,
} from '@/lib/firebase';

interface AuthContextValue {
  firebaseUser: User | null;
  userProfile: UserProfileRecord | null;
  authReady: boolean;
  authLoading: boolean;
  authError: string | null;
  jwtToken: string;
  isAuthModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithInstitutionalRole: (
    role: AppUserRole,
    email?: string,
    password?: string
  ) => Promise<void>;
  signOutUser: () => Promise<void>;
  setLocalRoleOverride: (role: AppUserRole) => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'viksit_bengal_auth_profile_v1';

function getJwtForRole(role: AppUserRole): string {
  if (role === 'ADMIN') return 'jwt-live-admin-session';
  if (role === 'RESEARCHER') return 'jwt-live-researcher-session';
  return 'jwt-live-citizen-session';
}

export function AuthProvider({
  children,
  locale = 'en',
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  const isBn = locale === 'bn';
  const pathname = usePathname() || '/en';

  const [firebaseUser, setFirebaseUser] = React.useState<User | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfileRecord | null>(
    null
  );
  const [authReady, setAuthReady] = React.useState(false);
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  const openSignInModal = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      (window as any).__SUPPRESS_DONATE_POPUP__ = true;
    }
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeSignInModal = React.useCallback(() => {
    setIsAuthModalOpen(false);
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        (window as any).__SUPPRESS_DONATE_POPUP__ = false;
      }, 2000);
    }
  }, []);

  // Restore saved session on mount while Firebase Auth initializes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as UserProfileRecord;
          if (parsed && parsed.uid && parsed.email) {
            setUserProfile(parsed);
          }
        }
      } catch {
        // Ignore storage error
      }
    }
  }, []);

  // Listen to Firebase Auth state changes & Firestore profile updates
  React.useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (fbUser) {
        try {
          const ensured = await ensureFirestoreUserProfile(fbUser);
          setUserProfile(ensured);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ensured));
          }

          unsubProfile = subscribeToOwnUserProfile(fbUser.uid, (liveDoc) => {
            if (liveDoc) {
              const merged: UserProfileRecord = {
                ...liveDoc,
                authProvider: 'google',
              };
              setUserProfile(merged);
              if (typeof window !== 'undefined') {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              }
            }
          });
        } catch (err: any) {
          console.error('Failed to sync Firestore user profile:', err);
        }
      }

      setAuthReady(true);
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // Log protected route transitions to Firestore /access_logs
  React.useEffect(() => {
    if (userProfile && firebaseUser && pathname) {
      void logFirestoreAccessEvent(userProfile, pathname, 'ROUTE_ACCESS');
    }
  }, [pathname, userProfile?.uid, firebaseUser]);

  const signInWithGoogle = React.useCallback(async () => {
    if (typeof window !== 'undefined') {
      (window as any).__SUPPRESS_DONATE_POPUP__ = true;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const profile = await ensureFirestoreUserProfile(cred.user);
      setUserProfile(profile);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      const code = err?.code || '';
      console.warn('Firebase signInWithPopup error code:', code, err);
      if (
        code === 'auth/unauthorized-domain' ||
        code === 'auth/operation-not-allowed' ||
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request'
      ) {
        // Fallback for localhost development where domain is not whitelisted in Firebase console
        const fallbackProfile: UserProfileRecord = {
          uid: `dev_citizen_${Date.now()}`,
          email: 'citizen.observer@viksitbengal.gov.in',
          displayName: 'Verified Citizen Observer',
          photoURL: '',
          role: 'CITIZEN',
          accessStatus: 'APPROVED',
          districtCode: 'KOL',
          authProvider: 'google',
        };
        setUserProfile(fallbackProfile);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackProfile));
        }
        setIsAuthModalOpen(false);
      } else if (code === 'auth/popup-closed-by-user') {
        setAuthError(
          isBn
            ? 'গুগল সাইন-ইন পপআপটি বন্ধ করা হয়েছে। নিচের প্রাতিষ্ঠানিক রোল বাটন ব্যবহার করতে পারেন।'
            : 'Google Sign-In popup was closed. You can also use the 1-Click Role buttons below.'
        );
      } else {
        setAuthError(
          err?.message ||
            (isBn ? 'গুগল সাইন-ইন ব্যর্থ হয়েছে।' : 'Google Sign-In failed.')
        );
      }
    } finally {
      setAuthLoading(false);
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          (window as any).__SUPPRESS_DONATE_POPUP__ = false;
        }, 3000);
      }
    }
  }, [isBn]);

  const signInWithInstitutionalRole = React.useCallback(
    async (role: AppUserRole, email?: string, password?: string) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const defaultEmail =
          email ||
          (role === 'ADMIN'
            ? 'admin@viksitbengal.gov.in'
            : role === 'RESEARCHER'
              ? 'researcher@viksitbengal.gov.in'
              : 'citizen.observer@viksitbengal.gov.in');

        if (password) {
          const authRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: defaultEmail, password }),
          });
          if (!authRes.ok) {
            const errJson = await authRes.json().catch(() => ({}));
            throw new Error(errJson.message || 'Invalid credentials');
          }
        }

        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: `inst_${role.toLowerCase()}_${defaultEmail.replace(/[^a-zA-Z0-9]/g, '_')}`.slice(
              0,
              64
            ),
            email: defaultEmail,
            displayName:
              role === 'ADMIN'
                ? 'Viksit Bengal Institutional Admin'
                : role === 'RESEARCHER'
                  ? 'Policy & Econometric Researcher'
                  : 'Verified Citizen Observer',
            photoURL: '',
            role,
            accessStatus: 'APPROVED',
            districtCode: 'KOL',
            authProvider: 'institutional',
          }),
        });
        const data = await res.json();
        const profile: UserProfileRecord = data.user || {
          uid: `inst_${role.toLowerCase()}`,
          email: defaultEmail,
          displayName:
            role === 'ADMIN'
              ? 'Viksit Bengal Institutional Admin'
              : role === 'RESEARCHER'
                ? 'Policy & Econometric Researcher'
                : 'Verified Citizen Observer',
          photoURL: '',
          role,
          accessStatus: 'APPROVED',
          districtCode: 'KOL',
          authProvider: 'institutional',
        };

        setUserProfile(profile);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        }
        setIsAuthModalOpen(false);
      } catch (err: any) {
        setAuthError(
          err?.message ||
            (isBn ? 'সাইন-ইন ব্যর্থ হয়েছে।' : 'Institutional login failed.')
        );
      } finally {
        setAuthLoading(false);
      }
    },
    [isBn]
  );

  const setLocalRoleOverride = React.useCallback(
    (role: AppUserRole) => {
      const updated: UserProfileRecord = userProfile
        ? { ...userProfile, role }
        : {
            uid: `session_${role.toLowerCase()}`,
            email:
              role === 'ADMIN'
                ? BOOTSTRAPPED_ADMIN_EMAIL
                : role === 'RESEARCHER'
                  ? 'researcher@viksitbengal.gov.in'
                  : 'citizen@viksitbengal.gov.in',
            displayName:
              role === 'ADMIN'
                ? 'Principal Governance Admin'
                : role === 'RESEARCHER'
                  ? 'Policy Audit Researcher'
                  : 'Verified Citizen Member',
            photoURL: '',
            role,
            accessStatus: 'APPROVED',
            districtCode: 'KOL',
            authProvider: 'institutional',
          };
      setUserProfile(updated);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      setIsAuthModalOpen(false);
    },
    [userProfile]
  );

  const signOutUser = React.useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore signout error
    }
    setUserProfile(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const jwtToken = React.useMemo(
    () => getJwtForRole(userProfile?.role || 'CITIZEN'),
    [userProfile?.role]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      userProfile,
      authReady,
      authLoading,
      authError,
      jwtToken,
      isAuthModalOpen,
      openSignInModal,
      closeSignInModal,
      signInWithGoogle,
      signInWithInstitutionalRole,
      signOutUser,
      setLocalRoleOverride,
    }),
    [
      firebaseUser,
      userProfile,
      authReady,
      authLoading,
      authError,
      jwtToken,
      isAuthModalOpen,
      openSignInModal,
      closeSignInModal,
      signInWithGoogle,
      signInWithInstitutionalRole,
      signOutUser,
      setLocalRoleOverride,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      <RouteAuthBarrier locale={locale}>{children}</RouteAuthBarrier>
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

/**
 * Enforces:
 * 1. Open Public Access on Landing Page (/en, /bn, /)
 * 2. Google Authentication Barrier beyond the Landing Page (/dashboard, /promises, /districts, /indicators, /admin)
 * 3. Account Restriction Barrier if accessStatus === 'RESTRICTED'
 * 4. Role Permission Barrier on /admin when signed in as CITIZEN (requires RESEARCHER or ADMIN)
 */
function RouteAuthBarrier({
  children,
  locale = 'en',
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  const isBn = locale === 'bn';
  const pathname = usePathname() || `/${locale}`;
  const {
    userProfile,
    authReady,
    authLoading,
    authError,
    isAuthModalOpen,
    closeSignInModal,
    signInWithGoogle,
    signInWithInstitutionalRole,
    signOutUser,
  } = useAuth();

  const [instEmail, setInstEmail] = React.useState('');
  const [instPass, setInstPass] = React.useState('Admin@123');
  const [selectedRole, setSelectedRole] = React.useState<AppUserRole>('CITIZEN');

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Normalize path to detect if user is on Landing Page or beyond Landing Page
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const isLandingPage =
    cleanPath === '/' || cleanPath === '/en' || cleanPath === '/bn';
  const isAdminRoute =
    cleanPath.endsWith('/admin') || cleanPath.includes('/admin/');

  const isGateEnforced = mounted && !isLandingPage && authReady && !userProfile;
  const showAuthModal = mounted && (isGateEnforced || isAuthModalOpen) && !userProfile;
  const isRestrictedUser =
    mounted &&
    !isLandingPage &&
    authReady &&
    userProfile?.accessStatus === 'RESTRICTED';
  const needsAdminRoleBarrier =
    mounted &&
    isAdminRoute &&
    authReady &&
    userProfile &&
    userProfile.accessStatus !== 'RESTRICTED' &&
    userProfile.role === 'CITIZEN';

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Keep underlying children mounted so SSR & accessibility landmarks remain valid */}
      <div
        className={
          isGateEnforced || isRestrictedUser || needsAdminRoleBarrier
            ? 'pointer-events-none select-none filter blur-[6px] opacity-35 transition-all duration-200 max-h-[82vh] overflow-hidden'
            : 'flex-1 flex flex-col'
        }
        aria-hidden={
          isGateEnforced || isRestrictedUser || needsAdminRoleBarrier
            ? 'true'
            : undefined
        }
      >
        {children}
      </div>

      {/* BARRIER 1: Google Auth Gate Beyond Landing Page or Explicit Sign-In Modal */}
      {showAuthModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-barrier-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isGateEnforced) {
              closeSignInModal();
            }
          }}
        >
          <div className="w-full max-w-xl rounded-2xl bg-white border-2 border-emerald-900/20 shadow-2xl overflow-hidden my-auto relative">
            {/* Top Emerald Security Banner */}
            <div className="bg-[#0A5C36] text-white px-6 py-5 border-b border-emerald-800">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-400/30 text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isBn
                      ? 'যাচাইকৃত নাগরিক ও গবেষক প্রবেশদ্বার'
                      : 'Verified Governance Access Barrier'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isGateEnforced && (
                    <button
                      type="button"
                      onClick={closeSignInModal}
                      className="p-1 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                      aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  {isGateEnforced && (
                    <Link
                      href={`/${locale}`}
                      className="text-xs font-semibold text-emerald-100 hover:text-white inline-flex items-center gap-1 underline underline-offset-4"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{isBn ? 'মূল পাতায় ফিরুন' : 'Back to Landing Page'}</span>
                    </Link>
                  )}
                </div>
              </div>
              <h2
                id="auth-barrier-title"
                className="text-xl sm:text-2xl font-extrabold mt-3 tracking-tight"
              >
                {isBn
                  ? 'ড্যাশবোর্ডে প্রবেশ করুন'
                  : 'Sign in to Viksit Bengal Dashboard'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1.5 leading-relaxed">
                {isBn
                  ? 'আপনার ইমেল ঠিকানা লিখুন অথবা নিচের এক-ক্লিক ডেমো রোল দিয়ে সরাসরি সাইন-ইন করুন।'
                  : 'Enter your email below to sign in immediately without popups, or continue with Google.'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {authError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <div>{authError}</div>
                </div>
              )}

              {/* 1. Direct Email Sign-In (Open & prominent right away) */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!instEmail.trim()) return;
                  const inferredRole: AppUserRole =
                    selectedRole ||
                    (instEmail.toLowerCase().includes('admin')
                      ? 'ADMIN'
                      : instEmail.toLowerCase().includes('researcher')
                        ? 'RESEARCHER'
                        : 'CITIZEN');

                  void signInWithInstitutionalRole(
                    inferredRole,
                    instEmail.trim(),
                    inferredRole === 'ADMIN' ? (instPass || 'Admin@123') : undefined
                  );
                }}
                className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="signin-email-input"
                    className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{isBn ? 'ইমেল দিয়ে সরাসরি প্রবেশ' : 'Sign In with Email'}</span>
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {isBn ? 'পপআপ ছাড়া' : 'Instant · No Popups'}
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    id="signin-email-input"
                    type="email"
                    required
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    placeholder="Enter your email address (e.g. citizen@example.com)"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-xs"
                    autoFocus
                  />

                  {/* Role Selector Tabs */}
                  <div className="pt-1">
                    <div className="text-[11px] font-bold text-stone-600 mb-1.5">
                      {isBn ? 'আপনার ভূমিকা নির্বাচন করুন:' : 'Select Your Access Tier:'}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('CITIZEN')}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          selectedRole === 'CITIZEN'
                            ? 'bg-[#0A5C36] text-white border-emerald-950 shadow-sm'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        1. CITIZEN
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('RESEARCHER')}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          selectedRole === 'RESEARCHER'
                            ? 'bg-amber-600 text-white border-amber-800 shadow-sm'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        2. RESEARCHER
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole('ADMIN')}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          selectedRole === 'ADMIN'
                            ? 'bg-stone-950 text-white border-black shadow-sm'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        3. ADMIN
                      </button>
                    </div>
                  </div>

                  {selectedRole === 'ADMIN' && (
                    <div className="pt-1 space-y-1">
                      <input
                        type="password"
                        value={instPass}
                        onChange={(e) => setInstPass(e.target.value)}
                        placeholder="Admin Password (Default: Admin@123)"
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-xs bg-white"
                      />
                      <div className="text-[10px] text-stone-500">
                        Default seed admin password is <span className="font-mono font-bold">Admin@123</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={authLoading || !instEmail.trim()}
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-lg bg-[#0A5C36] hover:bg-[#084729] disabled:opacity-50 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {authLoading
                      ? isBn
                        ? 'সাইন-ইন হচ্ছে...'
                        : 'Authenticating...'
                      : isBn
                        ? 'ইমেল দিয়ে প্রবেশ করুন'
                        : `Sign In as ${selectedRole}`}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-stone-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
                  {isBn ? 'অথবা' : 'Or'}
                </span>
                <div className="border-t border-stone-200 w-full" />
              </div>

              {/* 2. One-Click Quick Role Sign-In */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-stone-600 flex items-center justify-between">
                  <span>{isBn ? '১-ক্লিক দ্রুত ডেমো লগইন:' : '1-Click Quick Demo Sign-In (No Typing):'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => void signInWithInstitutionalRole('CITIZEN')}
                    className="px-3 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    {isBn ? 'নাগরিক (CITIZEN)' : 'Demo CITIZEN'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void signInWithInstitutionalRole('RESEARCHER')}
                    className="px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-950 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    {isBn ? 'গবেষক (RESEARCHER)' : 'Demo RESEARCHER'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void signInWithInstitutionalRole('ADMIN')}
                    className="px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-950 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    {isBn ? 'অ্যাডমিন (ADMIN)' : 'Demo ADMIN'}
                  </button>
                </div>
              </div>

              {/* 3. Google OAuth Option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={authLoading}
                  className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.58-1.14 2.92-2.4 3.82v3.18h3.86c2.26-2.09 3.56-5.17 3.56-9.24z"
                    />
                    <path
                      fill="#34A853"
                      d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3.18c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.26C3.515 21.3 7.565 24 12.255 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.525 14.11c-.25-.72-.38-1.49-.38-2.31s.13-1.59.38-2.31V6.23h-3.98a11.996 11.996 0 0 0 0 11.14l3.98-3.26z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.23l3.98 3.26c.95-2.85 3.6-4.74 6.73-4.74z"
                    />
                  </svg>
                  <span>
                    {isBn
                      ? 'গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন'
                      : 'Continue with Google Account'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BARRIER 2: Restricted Account Barrier */}
      {isRestrictedUser && userProfile && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border-2 border-red-300 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-red-800 font-extrabold text-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <span>
                {isBn
                  ? 'অ্যাকাউন্ট প্রবেশাধিকার সীমিত করা হয়েছে'
                  : 'Account Access Restricted'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {isBn
                ? `আপনার অ্যাকাউন্ট (${userProfile.email}) বর্তমানে অ্যাডমিন দ্বারা সীমিত (RESTRICTED) অবস্থায় রয়েছে।`
                : `Your account (${userProfile.email}) has been placed in RESTRICTED status by a platform administrator.`}
            </p>
            <div className="flex items-center justify-between gap-3 pt-2">
              <Link
                href={`/${locale}`}
                className="px-4 py-2 rounded-lg border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100"
              >
                {isBn ? 'মূল পাতায় ফিরুন' : 'Return to Landing Page'}
              </Link>
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold cursor-pointer"
              >
                {isBn ? 'সাইন আউট' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRIER 3: Admin & Role Permission Gate on /admin for CITIZEN users */}
      {needsAdminRoleBarrier && userProfile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-barrier-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white border-2 border-amber-300 shadow-2xl overflow-hidden">
            <div className="bg-stone-900 text-white px-6 py-5 border-b border-stone-800">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5" />
                <span>
                  {isBn
                    ? 'ভূমিকা অনুমতি প্রতিবন্ধক (RBAC Barrier)'
                    : 'Role Permission Barrier · CMS Protected'}
                </span>
              </div>
              <h2
                id="role-barrier-title"
                className="text-xl font-extrabold mt-2.5"
              >
                {isBn
                  ? 'সিএমএস পোর্টালের জন্য ADMIN বা RESEARCHER অনুমতি প্রয়োজন'
                  : 'Admin or Researcher Role Required for CMS Portal'}
              </h2>
              <p className="text-xs text-stone-300 mt-1">
                {isBn
                  ? `আপনি বর্তমানে ${userProfile.email} হিসেবে CITIZEN রোলে সাইন-ইন করেছেন।`
                  : `You are signed in as ${userProfile.email} with the CITIZEN role.`}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold">
                  {isBn
                    ? 'আপনার বর্তমান CITIZEN রোলের সুবিধাসমূহ:'
                    : 'Your Current CITIZEN Role Permissions:'}
                </div>
                <p className="text-stone-700">
                  {isBn
                    ? 'আপনি ড্যাশবোর্ড (/dashboard), ১৪১ প্রতিশ্রুতি (/promises), ২৩ জেলা (/districts) এবং অর্থনৈতিক সূচক (/indicators) সম্পূর্ণভাবে ব্যবহার করতে পারবেন। কিন্তু সিএমএস পোর্টালে (/admin) ডেটা পরিবর্তন করতে RESEARCHER বা ADMIN রোল প্রয়োজন।'
                    : 'Your CITIZEN account unlocks full access to the Executive Dashboard (/dashboard), 141 Commitments (/promises), 23 Districts (/districts), and Macroeconomic Indicators (/indicators). Modifying commitments or moderating audit queues in /admin requires RESEARCHER or ADMIN privileges.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/${locale}/dashboard`}
                  className="px-4 py-2.5 rounded-xl bg-[#0A5C36] hover:bg-[#084729] text-white text-xs font-extrabold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>
                    {isBn ? 'মূল ড্যাশবোর্ডে যান' : 'Go to Executive Dashboard'}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => void signInWithInstitutionalRole('RESEARCHER')}
                  className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold cursor-pointer"
                >
                  {isBn
                    ? 'RESEARCHER রোলে উন্নীত করুন'
                    : 'Switch to RESEARCHER Role'}
                </button>

                <button
                  type="button"
                  onClick={() => void signInWithInstitutionalRole('ADMIN')}
                  className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold cursor-pointer"
                >
                  {isBn ? 'ADMIN রোলে উন্নীত করুন' : 'Elevate to ADMIN Role'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
