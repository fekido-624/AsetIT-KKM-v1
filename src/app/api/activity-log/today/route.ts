import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getTodayActivitySummary } from '@/lib/activity-log';

export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Sila login dahulu.' }, { status: 401 });
  }

  try {
    const summary = await getTodayActivitySummary(user.username);
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    return NextResponse.json({ ok: false, message: (error as Error).message || 'Gagal ambil log aktiviti.' }, { status: 500 });
  }
}
