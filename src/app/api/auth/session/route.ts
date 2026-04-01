import { NextRequest, NextResponse } from 'next/server';
import { ensureDefaultAdmin, getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await ensureDefaultAdmin();
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}