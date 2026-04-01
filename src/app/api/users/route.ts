import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, normalizeRole } from '@/lib/auth';
import { createManagedUser, deleteManagedUser, getManagedUsers, updateManagedUser } from '@/lib/user-db';

function requireAdmin(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return { error: NextResponse.json({ message: 'Sila login dahulu.' }, { status: 401 }) };
  }
  if (user.role !== 'admin') {
    return { error: NextResponse.json({ message: 'Akses admin diperlukan.' }, { status: 403 }) };
  }
  return { user };
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const users = await getManagedUsers();
    return NextResponse.json({ ok: true, users });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message || 'Gagal ambil senarai user.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await req.json();
    const created = await createManagedUser({
      username: String(body?.username || '').trim(),
      password: String(body?.password || ''),
      role: normalizeRole(String(body?.role || 'user')),
    });
    return NextResponse.json({ ok: true, user: created });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message || 'Gagal cipta user.' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await req.json();
    const username = String(body?.username || '').trim();
    if (!username) {
      return NextResponse.json({ message: 'Username diperlukan.' }, { status: 400 });
    }

    const updated = await updateManagedUser(
      username,
      {
        role: body?.role ? normalizeRole(String(body.role)) : undefined,
        password: body?.password ? String(body.password) : undefined,
      },
      auth.user.username,
    );

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message || 'Gagal kemaskini user.' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await req.json();
    const username = String(body?.username || '').trim();
    if (!username) {
      return NextResponse.json({ message: 'Username diperlukan.' }, { status: 400 });
    }

    await deleteManagedUser(username, auth.user.username);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message || 'Gagal padam user.' }, { status: 400 });
  }
}