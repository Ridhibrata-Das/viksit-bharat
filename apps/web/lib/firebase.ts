'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const BOOTSTRAPPED_ADMIN_EMAIL = 'leaplearnindia@gmail.com';

// Blueprint validation constants (synced verbatim with firebase-blueprint.json)
export const BLUEPRINT_LIMITS = {
  UID_MAX: 128,
  EMAIL_MAX: 254,
  DISPLAY_NAME_MAX: 120,
  PHOTO_URL_MAX: 512,
  ROLE_MAX: 32,
  STATUS_MAX: 32,
  DISTRICT_MAX: 16,
  ROUTE_MAX: 200,
  ACTION_MAX: 64,
  ID_REGEX: /^[a-zA-Z0-9_\-]+$/,
} as const;

export type AppUserRole = 'CITIZEN' | 'RESEARCHER' | 'ADMIN';
export type AccountAccessStatus = 'APPROVED' | 'RESTRICTED';

export interface UserProfileRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: AppUserRole;
  accessStatus: AccountAccessStatus;
  districtCode: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  authProvider?: 'google' | 'institutional';
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot as required by firebase-integration-rpc skill
let connectionTested = false;
export async function testFirestoreConnection(): Promise<void> {
  if (connectionTested || typeof window === 'undefined') return;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (typeof window !== 'undefined') {
  void testFirestoreConnection();
}

function sanitizeId(raw: string): string {
  const cleaned = String(raw || '')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, BLUEPRINT_LIMITS.UID_MAX);
  return cleaned || 'user_anon';
}

export async function ensureFirestoreUserProfile(
  user: User
): Promise<UserProfileRecord> {
  const safeUid = sanitizeId(user.uid);
  const userPath = `users/${safeUid}`;
  const userRef = doc(db, 'users', safeUid);

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  const normalizedEmail = (user.email || 'user@viksitbengal.gov.in')
    .trim()
    .slice(0, BLUEPRINT_LIMITS.EMAIL_MAX);
  const isBootstrappedAdmin =
    normalizedEmail.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
    user.emailVerified;

  if (existingSnap && existingSnap.exists()) {
    const data = existingSnap.data() as UserProfileRecord;
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL || user.photoURL || '',
      role: isBootstrappedAdmin ? 'ADMIN' : data.role || 'CITIZEN',
      accessStatus: data.accessStatus || 'APPROVED',
      districtCode: data.districtCode || 'KOL',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      authProvider: 'google',
    };
  }

  const initialRole: AppUserRole = isBootstrappedAdmin ? 'ADMIN' : 'CITIZEN';
  const newProfile = {
    uid: safeUid,
    email: normalizedEmail,
    displayName: (
      user.displayName ||
      normalizedEmail.split('@')[0] ||
      'Viksit Bengal Citizen'
    ).slice(0, BLUEPRINT_LIMITS.DISPLAY_NAME_MAX),
    photoURL: (user.photoURL || '').slice(0, BLUEPRINT_LIMITS.PHOTO_URL_MAX),
    role: initialRole,
    accessStatus: 'APPROVED' as AccountAccessStatus,
    districtCode: 'KOL',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, newProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userPath);
  }

  if (isBootstrappedAdmin) {
    const adminPath = `admins/${safeUid}`;
    try {
      await setDoc(doc(db, 'admins', safeUid), {
        uid: safeUid,
        email: normalizedEmail,
        grantedByUid: safeUid,
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, adminPath);
    }
  }

  // Sync with server-side RBAC directory so CMS table reflects this user immediately
  try {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: safeUid,
        email: normalizedEmail,
        displayName: newProfile.displayName,
        photoURL: newProfile.photoURL,
        role: initialRole,
        accessStatus: 'APPROVED',
        districtCode: 'KOL',
        authProvider: 'google',
      }),
    });
  } catch {
    // Non-blocking sync
  }

  return {
    ...newProfile,
    authProvider: 'google',
  };
}

export async function logFirestoreAccessEvent(
  profile: UserProfileRecord,
  route: string,
  action: string
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return;
  const safeUid = sanitizeId(auth.currentUser.uid);
  const logId = sanitizeId(`${safeUid}_${Date.now()}`);
  const logPath = `access_logs/${logId}`;

  try {
    await setDoc(doc(db, 'access_logs', logId), {
      uid: safeUid,
      email: profile.email.slice(0, BLUEPRINT_LIMITS.EMAIL_MAX),
      route: (route || '/').slice(0, BLUEPRINT_LIMITS.ROUTE_MAX),
      role: profile.role,
      action: (action || 'ACCESS_ROUTE').slice(0, BLUEPRINT_LIMITS.ACTION_MAX),
      status: 'LOGGED',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, logPath);
  }
}

export async function updateFirestoreUserRole(
  targetUid: string,
  updates: {
    role?: AppUserRole;
    accessStatus?: AccountAccessStatus;
    districtCode?: string;
    displayName?: string;
  },
  targetEmail?: string
): Promise<void> {
  const safeTargetUid = sanitizeId(targetUid);
  if (auth.currentUser && auth.currentUser.emailVerified) {
    const userPath = `users/${safeTargetUid}`;
    const userRef = doc(db, 'users', safeTargetUid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const existing = snap.data();
        await updateDoc(userRef, {
          role: updates.role ?? existing.role,
          accessStatus: updates.accessStatus ?? existing.accessStatus,
          districtCode: (updates.districtCode ?? existing.districtCode ?? 'KOL').slice(
            0,
            BLUEPRINT_LIMITS.DISTRICT_MAX
          ),
          displayName: (updates.displayName ?? existing.displayName ?? 'User').slice(
            0,
            BLUEPRINT_LIMITS.DISPLAY_NAME_MAX
          ),
          updatedAt: serverTimestamp(),
        });

        if (updates.role === 'ADMIN') {
          const adminPath = `admins/${safeTargetUid}`;
          const adminRef = doc(db, 'admins', safeTargetUid);
          const adminSnap = await getDoc(adminRef);
          if (!adminSnap.exists()) {
            await setDoc(adminRef, {
              uid: safeTargetUid,
              email: (targetEmail || existing.email || 'admin@viksitbengal.gov.in').slice(
                0,
                BLUEPRINT_LIMITS.EMAIL_MAX
              ),
              grantedByUid: sanitizeId(auth.currentUser.uid),
              status: 'ACTIVE',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  }
}

export function subscribeToOwnUserProfile(
  uid: string,
  onProfile: (profile: UserProfileRecord | null) => void
): Unsubscribe {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}`;
  return onSnapshot(
    doc(db, 'users', safeUid),
    (snap) => {
      if (snap.exists()) {
        onProfile(snap.data() as UserProfileRecord);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToAllUsersForAdmin(
  onUsers: (users: UserProfileRecord[]) => void
): Unsubscribe {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};
  const isBootstrapped =
    currentUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
    currentUser.emailVerified;

  const usersCol = collection(db, 'users');
  const q = isBootstrapped
    ? usersCol
    : query(usersCol, where('uid', '==', sanitizeId(currentUser.uid)));

  return onSnapshot(
    q,
    (snap) => {
      const list: UserProfileRecord[] = [];
      snap.forEach((d) => {
        list.push(d.data() as UserProfileRecord);
      });
      onUsers(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  );
}

export { signInWithPopup, firebaseSignOut, onAuthStateChanged };
export type { User };
