import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/lib/auth-guard';
import { prisma } from '@viksit/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = authenticateApiRequest(req, ['ADMIN', 'RESEARCHER', 'PUBLIC', 'CITIZEN']);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  // Retrieve matching user record from MySQL or directory
  let dbUser: any = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { email: auth.user.email },
    });
  } catch {
    // Fall back to token claims
  }

  return NextResponse.json({
    id: dbUser?.id || auth.user.sub || `usr-${auth.user.role.toLowerCase()}`,
    email: auth.user.email,
    name: dbUser?.name || auth.user.name || auth.user.email.split('@')[0],
    role: dbUser?.role || auth.user.role,
    createdAt: dbUser?.createdAt || new Date().toISOString(),
  });
}
