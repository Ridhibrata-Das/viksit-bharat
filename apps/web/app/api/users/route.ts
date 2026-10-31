import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface DirectoryUserRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'CITIZEN' | 'RESEARCHER' | 'ADMIN';
  accessStatus: 'APPROVED' | 'RESTRICTED';
  districtCode: string;
  authProvider: 'google' | 'institutional';
  createdAt: string;
  updatedAt: string;
}

const g = globalThis as unknown as {
  __VIKSIT_RBAC_USERS__?: DirectoryUserRecord[];
};

function getRbacUsers(): DirectoryUserRecord[] {
  if (!g.__VIKSIT_RBAC_USERS__) {
    const now = new Date().toISOString();
    g.__VIKSIT_RBAC_USERS__ = [
      {
        uid: 'admin_super_leaplearn',
        email: 'leaplearnindia@gmail.com',
        displayName: 'Principal Governance Administrator (Super Admin)',
        photoURL: '',
        role: 'ADMIN',
        accessStatus: 'APPROVED',
        districtCode: 'KOL',
        authProvider: 'google',
        createdAt: '2026-10-01T08:00:00.000Z',
        updatedAt: now,
      },
      {
        uid: 'admin_institutional_01',
        email: 'admin@viksitbengal.gov.in',
        displayName: 'State Policy Directorate Admin',
        photoURL: '',
        role: 'ADMIN',
        accessStatus: 'APPROVED',
        districtCode: 'KOL',
        authProvider: 'institutional',
        createdAt: '2026-10-02T09:30:00.000Z',
        updatedAt: now,
      },
      {
        uid: 'researcher_institutional_01',
        email: 'researcher@viksitbengal.gov.in',
        displayName: 'Dr. Subhasish Sen (Lead Econometric Researcher)',
        photoURL: '',
        role: 'RESEARCHER',
        accessStatus: 'APPROVED',
        districtCode: 'N24',
        authProvider: 'institutional',
        createdAt: '2026-10-05T11:15:00.000Z',
        updatedAt: now,
      },
      {
        uid: 'researcher_google_02',
        email: 'ananya.bose.econ@gmail.com',
        displayName: 'Prof. Ananya Bose (IIM Calcutta Policy Fellow)',
        photoURL: '',
        role: 'RESEARCHER',
        accessStatus: 'APPROVED',
        districtCode: 'HOW',
        authProvider: 'google',
        createdAt: '2026-10-12T14:20:00.000Z',
        updatedAt: now,
      },
      {
        uid: 'citizen_google_01',
        email: 'sourav.chatterjee.wb@gmail.com',
        displayName: 'Sourav Chatterjee (Verified Citizen Observer)',
        photoURL: '',
        role: 'CITIZEN',
        accessStatus: 'APPROVED',
        districtCode: 'DAR',
        authProvider: 'google',
        createdAt: '2026-10-15T16:45:00.000Z',
        updatedAt: now,
      },
      {
        uid: 'citizen_google_02',
        email: 'moumita.das.siliguri@gmail.com',
        displayName: 'Moumita Das (District Civic Monitor)',
        photoURL: '',
        role: 'CITIZEN',
        accessStatus: 'APPROVED',
        districtCode: 'JAL',
        authProvider: 'google',
        createdAt: '2026-10-18T10:05:00.000Z',
        updatedAt: now,
      },
    ];
  }
  return g.__VIKSIT_RBAC_USERS__;
}

export async function GET() {
  const users = getRbacUsers();
  const counts = {
    total: users.length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    researchers: users.filter((u) => u.role === 'RESEARCHER').length,
    citizens: users.filter((u) => u.role === 'CITIZEN').length,
    restricted: users.filter((u) => u.accessStatus === 'RESTRICTED').length,
  };
  return NextResponse.json({ users, counts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const users = getRbacUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email || u.uid === body.uid);
    const now = new Date().toISOString();

    if (existing) {
      existing.displayName = body.displayName || existing.displayName;
      existing.photoURL = body.photoURL ?? existing.photoURL;
      existing.updatedAt = now;
      if (email === 'leaplearnindia@gmail.com') {
        existing.role = 'ADMIN';
      }
      return NextResponse.json({ user: existing, created: false });
    }

    const assignedRole: 'CITIZEN' | 'RESEARCHER' | 'ADMIN' =
      email === 'leaplearnindia@gmail.com'
        ? 'ADMIN'
        : ['ADMIN', 'RESEARCHER', 'CITIZEN'].includes(body.role)
          ? body.role
          : 'CITIZEN';

    const newUser: DirectoryUserRecord = {
      uid: String(body.uid || `user_${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, '_'),
      email,
      displayName: String(body.displayName || email.split('@')[0]).slice(0, 120),
      photoURL: String(body.photoURL || '').slice(0, 512),
      role: assignedRole,
      accessStatus: body.accessStatus === 'RESTRICTED' ? 'RESTRICTED' : 'APPROVED',
      districtCode: String(body.districtCode || 'KOL').slice(0, 16),
      authProvider: body.authProvider === 'institutional' ? 'institutional' : 'google',
      createdAt: now,
      updatedAt: now,
    };

    users.unshift(newUser);
    return NextResponse.json({ user: newUser, created: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Failed to register user' },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.includes('researcher') || authHeader.includes('citizen')) {
      return NextResponse.json(
        { message: 'Forbidden: Only ADMIN role can modify user roles and access permissions.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const targetUid = String(body.uid || '').trim();
    const targetEmail = String(body.email || '').trim().toLowerCase();

    const users = getRbacUsers();
    const user = users.find(
      (u) => u.uid === targetUid || (targetEmail && u.email.toLowerCase() === targetEmail)
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (body.role && ['CITIZEN', 'RESEARCHER', 'ADMIN'].includes(body.role)) {
      user.role = body.role;
    }
    if (body.accessStatus && ['APPROVED', 'RESTRICTED'].includes(body.accessStatus)) {
      user.accessStatus = body.accessStatus;
    }
    if (body.districtCode) {
      user.districtCode = String(body.districtCode).slice(0, 16);
    }
    if (body.displayName) {
      user.displayName = String(body.displayName).slice(0, 120);
    }
    user.updatedAt = new Date().toISOString();

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Failed to update user role' },
      { status: 400 }
    );
  }
}
