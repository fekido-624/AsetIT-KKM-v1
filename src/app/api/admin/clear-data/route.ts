import { timingSafeEqual } from 'crypto';
import { unlink, writeFile } from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

const CLEAR_DATA_KEYWORD = String(process.env.CLEAR_DATA_KEYWORD || 'PADAM SEMUA DATA STAF').trim();
const AVATAR_API_PREFIX = '/api/staff/avatar/files/';

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

function isKeywordValid(input: string) {
  const provided = Buffer.from(input.trim(), 'utf8');
  const expected = Buffer.from(CLEAR_DATA_KEYWORD, 'utf8');
  if (provided.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(provided, expected);
}

function extractUploadedAvatarFileName(avatar: string) {
  const raw = String(avatar || '').trim();
  if (!raw.startsWith(AVATAR_API_PREFIX)) {
    return null;
  }

  const fileName = raw.slice(AVATAR_API_PREFIX.length).trim();
  if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
    return null;
  }

  return fileName;
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await req.json();
    const confirmationKeyword = String(body?.confirmationKeyword || '').trim();

    if (!confirmationKeyword) {
      return NextResponse.json({ message: 'Kata kunci pengesahan diperlukan.' }, { status: 400 });
    }

    if (!isKeywordValid(confirmationKeyword)) {
      return NextResponse.json({ message: 'Kata kunci pengesahan tidak tepat.' }, { status: 400 });
    }

    const staffRows = await prisma.staff.findMany({ orderBy: { Bil: 'asc' } });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `staff-backup-before-clear-${timestamp}.xlsx`;

    const exportRows = staffRows.map((r) => ({
      Bil: r.Bil,
      Nama: r.Nama,
      Jawatan: r.Jawatan,
      Gred: r.Gred,
      Emel: r.Emel,
      'Cawangan / Bahagian / Unit': r.Cawangan,
      Wing: r.Wing,
      'Status Perjawatan': r.StatusPerjawatan,
      'Bilangan PC dibekalkan': r.PC_Bilangan,
      'Jenis Perolehan (PC)': r.PC_JenisPerolehan,
      'Nama Projek (PC)': r.PC_NamaProjek,
      'Tahun Perolehan (PC)': r.PC_TahunPerolehan,
      'No Pendaftaran (Kew PA) PC': r.PC_NoPendaftaran,
      'Kod Sewaan / Peyelenggaraan (PC)': r.PC_KodSewaan,
      'No. Siri PC': r.PC_NoSiri,
      'Catatan (PC)': r.PC_Catatan,
      'Bilangan NB dibekalkan': r.NB_Bilangan,
      'Jenis Perolehan (NB)': r.NB_JenisPerolehan,
      'Nama Projek (NB)': r.NB_NamaProjek,
      'Tahun Perolehan (NB)': r.NB_TahunPerolehan,
      'No Pendaftaran (Kew PA) NB': r.NB_NoPendaftaran,
      'Kod Sewaan / Peyelenggaraan (NB)': r.NB_KodSewaan,
      'No. Siri NB': r.NB_NoSiri,
      'Catatan (NB)': r.NB_Catatan,
      'Bilangan Printer dibekalkan': r.Printer_Bilangan,
      'Jenis Perolehan (Printer)': r.Printer_JenisPerolehan,
      'Nama Projek (Printer)': r.Printer_NamaProjek,
      'Tahun Perolehan (Printer)': r.Printer_TahunPerolehan,
      'No Pendaftaran (Kew PA) Printer': r.Printer_NoPendaftaran,
      'Kod Sewaan / Peyelenggaraan (Printer)': r.Printer_KodSewaan,
      'No. Siri Printer': r.Printer_NoSiri,
      'Jenama (Printer)': r.Printer_Jenama,
      'Jenis (Printer)': r.Printer_Jenis,
      'Kod Ink / Toner': r.Printer_KodInk,
      'Catatan (Printer)': r.Printer_Catatan,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    const backupBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const backupFileBase64 = Buffer.from(backupBuffer).toString('base64');

    // Strict process: if backup fails, clear-data is aborted.
    if (!backupFileBase64) {
      throw new Error('Backup XLSX gagal dijana. Proses clear data dibatalkan.');
    }

    const uploadDir = path.join(process.cwd(), 'public', 'staff-images');
    const avatarFilesToDelete = Array.from(
      new Set(
        staffRows
          .map((row) => extractUploadedAvatarFileName(row.Avatar))
          .filter((value): value is string => Boolean(value))
      )
    );

    const deleted = await prisma.staff.deleteMany();

    const activityLogPath = path.join(process.cwd(), 'data', 'activity-log.jsonl');
    await writeFile(activityLogPath, '', 'utf8').catch(() => undefined);

    await Promise.all(
      avatarFilesToDelete.map(async (fileName) => {
        const filePath = path.join(uploadDir, fileName);
        await unlink(filePath).catch(() => undefined);
      })
    );

    return NextResponse.json({
      ok: true,
      deletedStaffCount: deleted.count,
      deletedAvatarFiles: avatarFilesToDelete.length,
      usersPreserved: true,
      backupFile: backupFileName,
      backupFileBase64,
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message || 'Gagal clear data staff.' },
      { status: 500 }
    );
  }
}
