export interface AssetPC {
  Bilangan: string;
  JenisPerolehan: string;
  NamaProjek: string;
  TahunPerolehan: string;
  NoPendaftaran: string;
  KodSewaan: string;
  NoSiri: string;
  Catatan: string;
}

export interface AssetNB {
  Bilangan: string;
  JenisPerolehan: string;
  NamaProjek: string;
  TahunPerolehan: string;
  NoPendaftaran: string;
  KodSewaan: string;
  NoSiri: string;
  Catatan: string;
}

export interface AssetPrinter {
  Bilangan: string;
  JenisPerolehan: string;
  NamaProjek: string;
  TahunPerolehan: string;
  NoPendaftaran: string;
  KodSewaan: string;
  NoSiri: string;
  Jenama: string;
  Jenis: string;
  KodInk: string;
  Catatan: string;
}

export interface Staff {
  Bil: number;
  Nama: string;
  Jawatan: string;
  Gred: string;
  Emel: string;
  Cawangan: string;
  Wing: string;
  StatusPerjawatan: string;
  PC: AssetPC;
  NB: AssetNB;
  Printer: AssetPrinter;
  Avatar: string;
}

export type UserRole = 'admin' | 'user';

export interface SessionUser {
  username: string;
  role: UserRole;
}

export interface ManagedUser extends SessionUser {
  id: number;
  createdAt: string;
  updatedAt: string;
}
