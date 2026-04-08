import { timingSafeEqual } from 'crypto';
import { unlink, writeFile } from 'fs/promises';
import path from 'path';
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

    const staffRows = await prisma.staff.findMany({
      select: { Avatar: true },
    });

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
    });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message || 'Gagal clear data staff.' },
      { status: 500 }
    );
  }
}
