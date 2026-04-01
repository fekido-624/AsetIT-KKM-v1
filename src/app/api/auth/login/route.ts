import { NextRequest, NextResponse } from 'next/server';
import { ensureDefaultAdmin, setSessionCookie, verifyPassword } from '@/lib/auth';
import { findUserForLogin } from '@/lib/user-db';

export async function POST(req: NextRequest) {
  try {
    await ensureDefaultAdmin();
    const body = await req.json();
    const username = String(body?.username || '').trim();
    const password = String(body?.password || '');

    if (!username || !password) {
      return NextResponse.json({ message: 'Username dan password diperlukan.' }, { status: 400 });
    }

    const user = await findUserForLogin(username);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ message: 'Username atau password tidak sah.' }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      user: { username: user.username, role: user.role },
    });
    setSessionCookie(response, { username: user.username, role: user.role === 'admin' ? 'admin' : 'user' });
    return response;
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message || 'Login gagal.' }, { status: 500 });
  }
}