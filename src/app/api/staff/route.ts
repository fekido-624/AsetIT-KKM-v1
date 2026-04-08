import { NextRequest, NextResponse } from 'next/server';
import { addOrUpdateStaff } from '@/lib/staff-db';
import { getSessionUser } from '@/lib/auth';
import { appendActivityLog } from '@/lib/activity-log';
import { getStaffAssetSummary } from '@/lib/asset-status';
import { toUiStaff } from '@/lib/staff-db';
import prisma from '@/lib/prisma';

function isStaffCompleted(row: Awaited<ReturnType<typeof prisma.staff.findUnique>>) {
  if (!row) {
    return false;
  }
  const summary = getStaffAssetSummary(toUiStaff(row));
  return summary.totalExisting > 0 && summary.incompleteCount === 0;
}

function requireSession(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return { error: NextResponse.json({ status: 'error', message: 'Sila login dahulu.' }, { status: 401 }) };
  }
  return { user };
}

function requireAdmin(req: NextRequest) {
  const auth = requireSession(req);
  if ('error' in auth) {
    return auth;
  }
  if (auth.user.role !== 'admin') {
    return { error: NextResponse.json({ status: 'error', message: 'Akses admin diperlukan.' }, { status: 403 }) };
  }
  return auth;
}

export async function GET(req: NextRequest) {
  const auth = requireSession(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const { searchParams } = new URL(req.url);
    const wing = String(searchParams.get('wing') || '').trim();

    let where: { Wing?: { in: string[] } } = {};
    if (wing && wing !== 'all') {
      const normalized = wing.toLowerCase();
      if (/^[1-4]$/.test(normalized)) {
        where = { Wing: { in: [`Wing ${normalized}`, `Wing ${normalized}(test)`] } };
      } else if (normalized.startsWith('wing ')) {
        where = { Wing: { in: [wing] } };
      }
    }

    const rows = await prisma.staff.findMany({
      where,
      orderBy: { Bil: 'asc' },
    });

    return NextResponse.json({ status: 'ok', rows });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const data = await req.json();
    const targetEmail = String(data?.Emel || '').trim().toLowerCase();
    const before = targetEmail ? await prisma.staff.findUnique({ where: { Emel: targetEmail } }) : null;
    const beforeComplete = isStaffCompleted(before);
    const result = await addOrUpdateStaff(data);

    const latest = await prisma.staff.findUnique({ where: { Emel: targetEmail } });
    if (latest) {
      try {
        await appendActivityLog({
          timestamp: new Date().toISOString(),
          actor: auth.user.username,
          action: result === 'created' ? 'staff_created' : 'staff_updated',
          targetEmail: latest.Emel,
          targetName: latest.Nama,
        });

        const afterComplete = isStaffCompleted(latest);
        const shouldLogCompleted = (result === 'created' && afterComplete) || (!beforeComplete && afterComplete);

        if (shouldLogCompleted) {
          await appendActivityLog({
            timestamp: new Date().toISOString(),
            actor: auth.user.username,
            action: 'staff_completed',
            targetEmail: latest.Emel,
            targetName: latest.Nama,
            note: 'Staff marked complete through add/update form.',
          });
        }
      } catch {
        // Logging should not break staff save flow.
      }
    }

    return NextResponse.json({ status: 'ok', result });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: (err as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await req.json();
    const email = String(body?.email || '').trim();
    const profile = body?.profile || {};
    const assetType = String(body?.assetType || '').trim();
    const assetData = body?.assetData || {};

    if (!email) {
      return NextResponse.json({ status: 'error', message: 'Email is required.' }, { status: 400 });
    }

    const before = await prisma.staff.findUnique({ where: { Emel: email } });
    const beforeComplete = isStaffCompleted(before);

    if (assetType === 'PC' || assetType === 'NB' || assetType === 'Printer') {
      let data: Record<string, string> = {};
      if (assetType === 'PC') {
        data = {
          PC_Bilangan: String(assetData.Bilangan ?? ''),
          PC_JenisPerolehan: String(assetData.JenisPerolehan ?? ''),
          PC_NamaProjek: String(assetData.NamaProjek ?? ''),
          PC_TahunPerolehan: String(assetData.TahunPerolehan ?? ''),
          PC_NoPendaftaran: String(assetData.NoPendaftaran ?? ''),
          PC_KodSewaan: String(assetData.KodSewaan ?? ''),
          PC_NoSiri: String(assetData.NoSiri ?? ''),
          PC_Catatan: String(assetData.Catatan ?? ''),
        };
      }
      if (assetType === 'NB') {
        data = {
          NB_Bilangan: String(assetData.Bilangan ?? ''),
          NB_JenisPerolehan: String(assetData.JenisPerolehan ?? ''),
          NB_NamaProjek: String(assetData.NamaProjek ?? ''),
          NB_TahunPerolehan: String(assetData.TahunPerolehan ?? ''),
          NB_NoPendaftaran: String(assetData.NoPendaftaran ?? ''),
          NB_KodSewaan: String(assetData.KodSewaan ?? ''),
          NB_NoSiri: String(assetData.NoSiri ?? ''),
          NB_Catatan: String(assetData.Catatan ?? ''),
        };
      }
      if (assetType === 'Printer') {
        data = {
          Printer_Bilangan: String(assetData.Bilangan ?? ''),
          Printer_JenisPerolehan: String(assetData.JenisPerolehan ?? ''),
          Printer_NamaProjek: String(assetData.NamaProjek ?? ''),
          Printer_TahunPerolehan: String(assetData.TahunPerolehan ?? ''),
          Printer_NoPendaftaran: String(assetData.NoPendaftaran ?? ''),
          Printer_KodSewaan: String(assetData.KodSewaan ?? ''),
          Printer_NoSiri: String(assetData.NoSiri ?? ''),
          Printer_Jenama: String(assetData.Jenama ?? ''),
          Printer_Jenis: String(assetData.Jenis ?? ''),
          Printer_KodInk: String(assetData.KodInk ?? ''),
          Printer_Catatan: String(assetData.Catatan ?? ''),
        };
      }

      await prisma.staff.update({ where: { Emel: email }, data });

      const afterAssetUpdate = await prisma.staff.findUnique({ where: { Emel: email } });
      if (afterAssetUpdate) {
        const afterComplete = isStaffCompleted(afterAssetUpdate);
        try {
          await appendActivityLog({
            timestamp: new Date().toISOString(),
            actor: auth.user.username,
            action: 'staff_updated',
            targetEmail: afterAssetUpdate.Emel,
            targetName: afterAssetUpdate.Nama,
            note: `Updated ${assetType} asset details.`,
          });

          if (!beforeComplete && afterComplete) {
            await appendActivityLog({
              timestamp: new Date().toISOString(),
              actor: auth.user.username,
              action: 'staff_completed',
              targetEmail: afterAssetUpdate.Emel,
              targetName: afterAssetUpdate.Nama,
              note: 'Staff asset status changed to complete.',
            });
          }
        } catch {
          // Logging should not block staff update flow.
        }
      }

      return NextResponse.json({ status: 'ok' });
    }

    const updated = await prisma.staff.update({
      where: { Emel: email },
      data: {
        Nama: String(profile.Nama ?? ''),
        Jawatan: String(profile.Jawatan ?? ''),
        Gred: String(profile.Gred ?? ''),
        Cawangan: String(profile.Cawangan ?? ''),
        Wing: String(profile.Wing ?? ''),
        StatusPerjawatan: String(profile.StatusPerjawatan ?? ''),
      },
      select: {
        Nama: true,
        Jawatan: true,
        Gred: true,
        Cawangan: true,
        Wing: true,
        StatusPerjawatan: true,
      },
    });

    const afterProfileUpdate = await prisma.staff.findUnique({ where: { Emel: email } });
    if (afterProfileUpdate) {
      const afterComplete = isStaffCompleted(afterProfileUpdate);
      try {
        await appendActivityLog({
          timestamp: new Date().toISOString(),
          actor: auth.user.username,
          action: 'staff_updated',
          targetEmail: afterProfileUpdate.Emel,
          targetName: afterProfileUpdate.Nama,
          note: 'Updated staff profile details.',
        });

        if (!beforeComplete && afterComplete) {
          await appendActivityLog({
            timestamp: new Date().toISOString(),
            actor: auth.user.username,
            action: 'staff_completed',
            targetEmail: afterProfileUpdate.Emel,
            targetName: afterProfileUpdate.Nama,
            note: 'Staff asset status changed to complete.',
          });
        }
      } catch {
        // Logging should not block staff update flow.
      }
    }

    return NextResponse.json({ status: 'ok', profile: updated });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await req.json();
    const email = String(body?.email || '').trim();

    if (!email) {
      return NextResponse.json({ status: 'error', message: 'Email is required.' }, { status: 400 });
    }

    const existing = await prisma.staff.findUnique({ where: { Emel: email } });
    await prisma.staff.delete({ where: { Emel: email } });

    if (existing) {
      try {
        await appendActivityLog({
          timestamp: new Date().toISOString(),
          actor: auth.user.username,
          action: 'staff_deleted',
          targetEmail: existing.Emel,
          targetName: existing.Nama,
        });
      } catch {
        // Logging should not block staff delete flow.
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: (err as Error).message }, { status: 500 });
  }
}
