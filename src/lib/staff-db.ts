import prisma from '@/lib/prisma';
import type { Staff } from '@/lib/types';
import type { Staff as PrismaStaff } from '@prisma/client';
import { sortStaffByGradeDesc } from '@/lib/grade-order';

type LegacyFlatStaffInput = {
  Nama: string;
  Jawatan: string;
  Gred: string;
  Emel: string;
  Cawangan: string;
  Wing: string;
  StatusPerjawatan: string;
  PC_Bilangan?: string;
  PC_JenisPerolehan?: string;
  PC_NamaProjek?: string;
  PC_TahunPerolehan?: string;
  PC_NoPendaftaran?: string;
  PC_KodSewaan?: string;
  PC_NoSiri?: string;
  PC_Catatan?: string;
  NB_Bilangan?: string;
  NB_JenisPerolehan?: string;
  NB_NamaProjek?: string;
  NB_TahunPerolehan?: string;
  NB_NoPendaftaran?: string;
  NB_KodSewaan?: string;
  NB_NoSiri?: string;
  NB_Catatan?: string;
  Printer_Bilangan?: string;
  Printer_JenisPerolehan?: string;
  Printer_NamaProjek?: string;
  Printer_TahunPerolehan?: string;
  Printer_NoPendaftaran?: string;
  Printer_KodSewaan?: string;
  Printer_NoSiri?: string;
  Printer_Jenama?: string;
  Printer_Jenis?: string;
  Printer_KodInk?: string;
  Printer_Catatan?: string;
};

function normalizeWingLabel(value: string) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const cleaned = raw.toLowerCase().replace(/\s+/g, ' ');
  const digitMatch = cleaned.match(/([1-4])/);
  if (digitMatch) {
    return `Wing ${digitMatch[1]}`;
  }

  return raw;
}

function buildWingAliases(wings: string[]) {
  const aliasSet = new Set<string>();

  for (const wing of wings) {
    const normalized = normalizeWingLabel(wing);
    const digitMatch = normalized.match(/([1-4])/);

    aliasSet.add(String(wing || '').trim());
    aliasSet.add(normalized);

    if (digitMatch) {
      const n = digitMatch[1];
      aliasSet.add(n);
      aliasSet.add(`Wing ${n}`);
      aliasSet.add(`Wing${n}`);
      aliasSet.add(`wing ${n}`);
      aliasSet.add(`wing${n}`);
      aliasSet.add(`Wing ${n}(test)`);
      aliasSet.add(`Wing${n}(test)`);
      aliasSet.add(`wing ${n}(test)`);
      aliasSet.add(`wing${n}(test)`);
    }
  }

  return Array.from(aliasSet).filter(Boolean);
}

function toDbStaffData(data: Omit<Staff, 'Bil' | 'Avatar'> | LegacyFlatStaffInput) {
  const pc = 'PC' in data ? data.PC : undefined;
  const nb = 'NB' in data ? data.NB : undefined;
  const printer = 'Printer' in data ? data.Printer : undefined;
  const flat = data as LegacyFlatStaffInput;

  return {
    Nama: data.Nama,
    Jawatan: data.Jawatan,
    Gred: data.Gred,
    Emel: data.Emel,
    Cawangan: data.Cawangan,
    Wing: normalizeWingLabel(data.Wing),
    StatusPerjawatan: data.StatusPerjawatan,
    PC_Bilangan: pc?.Bilangan ?? flat.PC_Bilangan ?? '',
    PC_JenisPerolehan: pc?.JenisPerolehan ?? flat.PC_JenisPerolehan ?? '',
    PC_NamaProjek: pc?.NamaProjek ?? flat.PC_NamaProjek ?? '',
    PC_TahunPerolehan: pc?.TahunPerolehan ?? flat.PC_TahunPerolehan ?? '',
    PC_NoPendaftaran: pc?.NoPendaftaran ?? flat.PC_NoPendaftaran ?? '',
    PC_KodSewaan: pc?.KodSewaan ?? flat.PC_KodSewaan ?? '',
    PC_NoSiri: pc?.NoSiri ?? flat.PC_NoSiri ?? '',
    PC_Catatan: pc?.Catatan ?? flat.PC_Catatan ?? '',
    NB_Bilangan: nb?.Bilangan ?? flat.NB_Bilangan ?? '',
    NB_JenisPerolehan: nb?.JenisPerolehan ?? flat.NB_JenisPerolehan ?? '',
    NB_NamaProjek: nb?.NamaProjek ?? flat.NB_NamaProjek ?? '',
    NB_TahunPerolehan: nb?.TahunPerolehan ?? flat.NB_TahunPerolehan ?? '',
    NB_NoPendaftaran: nb?.NoPendaftaran ?? flat.NB_NoPendaftaran ?? '',
    NB_KodSewaan: nb?.KodSewaan ?? flat.NB_KodSewaan ?? '',
    NB_NoSiri: nb?.NoSiri ?? flat.NB_NoSiri ?? '',
    NB_Catatan: nb?.Catatan ?? flat.NB_Catatan ?? '',
    Printer_Bilangan: printer?.Bilangan ?? flat.Printer_Bilangan ?? '',
    Printer_JenisPerolehan: printer?.JenisPerolehan ?? flat.Printer_JenisPerolehan ?? '',
    Printer_NamaProjek: printer?.NamaProjek ?? flat.Printer_NamaProjek ?? '',
    Printer_TahunPerolehan: printer?.TahunPerolehan ?? flat.Printer_TahunPerolehan ?? '',
    Printer_NoPendaftaran: printer?.NoPendaftaran ?? flat.Printer_NoPendaftaran ?? '',
    Printer_KodSewaan: printer?.KodSewaan ?? flat.Printer_KodSewaan ?? '',
    Printer_NoSiri: printer?.NoSiri ?? flat.Printer_NoSiri ?? '',
    Printer_Jenama: printer?.Jenama ?? flat.Printer_Jenama ?? '',
    Printer_Jenis: printer?.Jenis ?? flat.Printer_Jenis ?? '',
    Printer_KodInk: printer?.KodInk ?? flat.Printer_KodInk ?? '',
    Printer_Catatan: printer?.Catatan ?? flat.Printer_Catatan ?? '',
  };
}

export function toUiStaff(row: PrismaStaff): Staff {
  return {
    Bil: row.Bil,
    Nama: row.Nama,
    Jawatan: row.Jawatan,
    Gred: row.Gred,
    Emel: row.Emel,
    Cawangan: row.Cawangan,
    Wing: row.Wing,
    StatusPerjawatan: row.StatusPerjawatan,
    Avatar: row.Avatar,
    PC: {
      Bilangan: row.PC_Bilangan,
      JenisPerolehan: row.PC_JenisPerolehan,
      NamaProjek: row.PC_NamaProjek,
      TahunPerolehan: row.PC_TahunPerolehan,
      NoPendaftaran: row.PC_NoPendaftaran,
      KodSewaan: row.PC_KodSewaan,
      NoSiri: row.PC_NoSiri,
      Catatan: row.PC_Catatan,
    },
    NB: {
      Bilangan: row.NB_Bilangan,
      JenisPerolehan: row.NB_JenisPerolehan,
      NamaProjek: row.NB_NamaProjek,
      TahunPerolehan: row.NB_TahunPerolehan,
      NoPendaftaran: row.NB_NoPendaftaran,
      KodSewaan: row.NB_KodSewaan,
      NoSiri: row.NB_NoSiri,
      Catatan: row.NB_Catatan,
    },
    Printer: {
      Bilangan: row.Printer_Bilangan,
      JenisPerolehan: row.Printer_JenisPerolehan,
      NamaProjek: row.Printer_NamaProjek,
      TahunPerolehan: row.Printer_TahunPerolehan,
      NoPendaftaran: row.Printer_NoPendaftaran,
      KodSewaan: row.Printer_KodSewaan,
      NoSiri: row.Printer_NoSiri,
      Jenama: row.Printer_Jenama,
      Jenis: row.Printer_Jenis,
      KodInk: row.Printer_KodInk,
      Catatan: row.Printer_Catatan,
    },
  };
}

export async function getAllStaff() {
  return await prisma.staff.findMany({ orderBy: { Gred: 'desc' } });
}

export async function getAllStaffForUi(): Promise<Staff[]> {
  const rows = await prisma.staff.findMany({ orderBy: { Bil: 'asc' } });
  return sortStaffByGradeDesc(rows.map(toUiStaff));
}

export async function getStaffByWing(wing: string) {
  return await prisma.staff.findMany({ where: { Wing: wing }, orderBy: { Gred: 'desc' } });
}

export async function getStaffByWingsForUi(wings: string[]): Promise<Staff[]> {
  const wingAliases = buildWingAliases(wings);
  const rows = await prisma.staff.findMany({
    where: { Wing: { in: wingAliases } },
    orderBy: { Bil: 'asc' },
  });
  return sortStaffByGradeDesc(rows.map(toUiStaff));
}

export async function getStaffByEmail(email: string) {
  return await prisma.staff.findUnique({ where: { Emel: email } });
}

export async function getStaffByEmailForUi(email: string): Promise<Staff | null> {
  const row = await prisma.staff.findUnique({ where: { Emel: email } });
  return row ? toUiStaff(row) : null;
}

export async function addOrUpdateStaff(data: Omit<Staff, 'Bil' | 'Avatar'> | LegacyFlatStaffInput) {
  const dbData = toDbStaffData(data);

  // Try update first
  const existing = await prisma.staff.findUnique({ where: { Emel: data.Emel } });
  if (existing) {
    await prisma.staff.update({ where: { Emel: data.Emel }, data: dbData });
    return 'updated';
  } else {
    // Find max Bil
    const maxBil = await prisma.staff.aggregate({ _max: { Bil: true } });
    const Bil = (maxBil._max.Bil || 0) + 1;
    const Avatar = `avatar${(Bil % 6) + 1}`;
    await prisma.staff.create({ data: { ...dbData, Bil, Avatar } });
    return 'created';
  }
}
