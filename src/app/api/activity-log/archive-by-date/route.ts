import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getArchivedActivitySummaryByDate } from '@/lib/activity-log';

export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Sila login dahulu.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dateStr = String(searchParams.get('date') || '').trim();

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { ok: false, message: 'Format tarikh tidak sah (gunakan YYYY-MM-DD).' },
        { status: 400 }
      );
    }

    const summary = await getArchivedActivitySummaryByDate(user.username, dateStr);
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: (error as Error).message || 'Gagal ambil archive log aktiviti.' },
      { status: 500 }
    );
  }
}
