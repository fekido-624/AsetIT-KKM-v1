import prisma from '@/lib/prisma';
import type { Staff } from '@/lib/types';
import type { Staff as PrismaStaff } from '@prisma/client';
import { sortStaffByGradeDesc } from '@/lib/grade-order';

function toDbStaffData(data: Omit<Staff, 'Bil' | 'Avatar'>) {
  return {
    Nama: data.Nama,
    Jawatan: data.Jawatan,
    Gred: data.Gred,
    Emel: data.Emel,
    Cawangan: data.Cawangan,
    Wing: data.Wing,
    StatusPerjawatan: data.StatusPerjawatan,
    PC_Bilangan: data.PC.Bilangan,
    PC_JenisPerolehan: data.PC.JenisPerolehan,
    PC_NamaProjek: data.PC.NamaProjek,
    PC_TahunPerolehan: data.PC.TahunPerolehan,
    PC_NoPendaftaran: data.PC.NoPendaftaran,
    PC_KodSewaan: data.PC.KodSewaan,
    PC_NoSiri: data.PC.NoSiri,
    PC_Catatan: data.PC.Catatan,
    NB_Bilangan: data.NB.Bilangan,
    NB_JenisPerolehan: data.NB.JenisPerolehan,
    NB_NamaProjek: data.NB.NamaProjek,
    NB_TahunPerolehan: data.NB.TahunPerolehan,
    NB_NoPendaftaran: data.NB.NoPendaftaran,
    NB_KodSewaan: data.NB.KodSewaan,
    NB_NoSiri: data.NB.NoSiri,
    NB_Catatan: data.NB.Catatan,
    Printer_Bilangan: data.Printer.Bilangan,
    Printer_JenisPerolehan: data.Printer.JenisPerolehan,
    Printer_NamaProjek: data.Printer.NamaProjek,
    Printer_TahunPerolehan: data.Printer.TahunPerolehan,
    Printer_NoPendaftaran: data.Printer.NoPendaftaran,
    Printer_KodSewaan: data.Printer.KodSewaan,
    Printer_NoSiri: data.Printer.NoSiri,
    Printer_Jenama: data.Printer.Jenama,
    Printer_Jenis: data.Printer.Jenis,
    Printer_KodInk: data.Printer.KodInk,
    Printer_Catatan: data.Printer.Catatan,
  };
}

function toUiStaff(row: PrismaStaff): Staff {
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
  const rows = await prisma.staff.findMany({
    where: { Wing: { in: wings } },
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

export async function addOrUpdateStaff(data: Omit<Staff, 'Bil' | 'Avatar'>) {
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
