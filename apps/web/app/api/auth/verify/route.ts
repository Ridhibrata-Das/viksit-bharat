import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let token: string | undefined;

    // 1. Try body
    try {
      const body = await req.json();
      if (body && typeof body.token === 'string') {
        token = body.token.trim();
      }
    } catch {
      // Body empty or not JSON
    }

    // 2. Try Authorization header
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    // 3. Try Cookie
    if (!token) {
      const cookie = req.cookies.get('auth_token');
      if (cookie?.value) {
        token = cookie.value.trim();
      }
    }

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token missing' },
        { status: 401 }
      );
    }

    const decoded = verifyAuthToken(token);
    if (!decoded) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token signature' },
        { status: 401 }
      );
    }

    const role = decoded.role || 'PUBLIC';
    const permissions = {
      canModerateEvidence: role === 'ADMIN',
      canOverridePromises: role === 'ADMIN',
      canSubmitEvidence: role === 'ADMIN' || role === 'RESEARCHER',
      canRegisterPromises: role === 'ADMIN' || role === 'RESEARCHER',
      canViewDashboard: true,
    };

    return NextResponse.json({
      valid: true,
      user: {
        id: decoded.sub || decoded.email,
        email: decoded.email,
        name: decoded.name || decoded.email,
        role,
      },
      permissions,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error.message || 'Internal verification error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
