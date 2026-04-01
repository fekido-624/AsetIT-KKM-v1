import type { Staff } from "./types";
import { getGradeRank, sortStaffByGradeDesc } from "./grade-order";

let staffData: Staff[] = [
  {
    Bil: 1,
    Nama: "Dr. Ahmad bin Kassim",
    Jawatan: "Pengarah",
    Gred: "JUSA C",
    Emel: "ahmad.kassim@kkm.gov.my",
    Cawangan: "Pengurusan Atasan",
    Wing: "Wing 1",
    StatusPerjawatan: "Tetap",
    Avatar: "avatar1",
    PC: {
      Bilangan: "1",
      JenisPerolehan: "Sewa",
      NamaProjek: "Projek 2022",
      TahunPerolehan: "2022",
      NoPendaftaran: "KKM/PC/001",
      KodSewaan: "RENT-PC-001",
      NoSiri: "SN-PC-001",
      Catatan: "PC untuk kegunaan pejabat.",
    },
    NB: {
      Bilangan: "1",
      JenisPerolehan: "Beli",
      NamaProjek: "N/A",
      TahunPerolehan: "2023",
      NoPendaftaran: "KKM/NB/001",
      KodSewaan: "N/A",
      NoSiri: "SN-NB-001",
      Catatan: "Laptop peribadi pejabat.",
    },
    Printer: {
      Bilangan: "1",
      JenisPerolehan: "Sewa",
      NamaProjek: "Projek 2022",
      TahunPerolehan: "2022",
      NoPendaftaran: "KKM/PRN/001",
      KodSewaan: "RENT-PRN-001",
      NoSiri: "SN-PRN-001",
      Jenama: "HP",
      Jenis: "LaserJet",
      KodInk: "HP-123",
      Catatan: "Printer di bilik Pengarah.",
    },
  },
  {
    Bil: 2,
    Nama: "Siti Nurhaliza binti Ishak",
    Jawatan: "Pegawai Teknologi Maklumat",
    Gred: "F48",
    Emel: "siti.nurhaliza@kkm.gov.my",
    Cawangan: "Bahagian IT",
    Wing: "Wing 2",
    StatusPerjawatan: "Tetap",
    Avatar: "avatar2",
    PC: {
      Bilangan: "1",
      JenisPerolehan: "Beli",
      NamaProjek: "N/A",
      TahunPerolehan: "2021",
      NoPendaftaran: "KKM/PC/002",
      KodSewaan: "N/A",
      NoSiri: "SN-PC-002",
      Catatan: "Stesen kerja utama.",
    },
    NB: {
      Bilangan: "1",
      JenisPerolehan: "Sewa",
      NamaProjek: "Projek 2023",
      TahunPerolehan: "2023",
      NoPendaftaran: "KKM/NB/002",
      KodSewaan: "RENT-NB-002",
      NoSiri: "SN-NB-002",
      Catatan: "Laptop untuk kerja luar.",
    },
    Printer: {
      Bilangan: "0",
      JenisPerolehan: "",
      NamaProjek: "",
      TahunPerolehan: "",
      NoPendaftaran: "",
      KodSewaan: "",
      NoSiri: "",
      Jenama: "",
      Jenis: "",
      KodInk: "",
      Catatan: "",
    },
  },
  {
    Bil: 3,
    Nama: "Lim Wei Kiat",
    Jawatan: "Penolong Pegawai Tadbir",
    Gred: "N29",
    Emel: "lim.weikiat@kkm.gov.my",
    Cawangan: "Unit Pentadbiran",
    Wing: "Wing 1",
    StatusPerjawatan: "Kontrak",
    Avatar: "avatar3",
    PC: {
      Bilangan: "1",
      JenisPerolehan: "Beli",
      NamaProjek: "N/A",
      TahunPerolehan: "2020",
      NoPendaftaran: "KKM/PC/003",
      KodSewaan: "N/A",
      NoSiri: "SN-PC-003",
      Catatan: "PC di kaunter.",
    },
    NB: {
      Bilangan: "0",
      JenisPerolehan: "",
      NamaProjek: "",
      TahunPerolehan: "",
      NoPendaftaran: "",
      KodSewaan: "",
      NoSiri: "",
      Catatan: "",
    },
    Printer: {
      Bilangan: "0",
      JenisPerolehan: "",
      NamaProjek: "",
      TahunPerolehan: "",
      NoPendaftaran: "",
      KodSewaan: "",
      NoSiri: "",
      Jenama: "",
      Jenis: "",
      KodInk: "",
      Catatan: "",
    },
  },
  {
    Bil: 4,
    Nama: "Priya a/p Ramasamy",
    Jawatan: "Ketua Jururawat",
    Gred: "U42",
    Emel: "priya.ramasamy@kkm.gov.my",
    Cawangan: "Kejururawatan",
    Wing: "Wing 3",
    StatusPerjawatan: "Tetap",
    Avatar: "avatar4",
    PC: {
      Bilangan: "1",
      JenisPerolehan: "Sewa",
      NamaProjek: "Projek 2022",
      TahunPerolehan: "2022",
      NoPendaftaran: "KKM/PC/004",
      KodSewaan: "RENT-PC-004",
      NoSiri: "SN-PC-004",
      Catatan: "PC di pejabat jururawat.",
    },
    NB: {
      Bilangan: "1",
      JenisPerolehan: "Beli",
      NamaProjek: "N/A",
      TahunPerolehan: "2022",
      NoPendaftaran: "KKM/NB/004",
      KodSewaan: "N/A",
      NoSiri: "SN-NB-004",
      Catatan: "",
    },
    Printer: {
      Bilangan: "1",
      JenisPerolehan: "Beli",
      NamaProjek: "N/A",
      TahunPerolehan: "2021",
      NoPendaftaran: "KKM/PRN/002",
      KodSewaan: "N/A",
      NoSiri: "SN-PRN-002",
      Jenama: "Brother",
      Jenis: "Inkjet",
      KodInk: "BR-456",
      Catatan: "Printer kegunaan umum wad.",
    },
  },
  {
    Bil: 5,
    Nama: "Muhammad Zikri bin Azman",
    Jawatan: "Pegawai Farmasi",
    Gred: "UF44",
    Emel: "zikri.azman@kkm.gov.my",
    Cawangan: "Farmasi",
    Wing: "Wing 4",
    StatusPerjawatan: "Tetap",
    Avatar: "avatar5",
    PC: {
      Bilangan: "1",
      JenisPerolehan: "Beli",
      NamaProjek: "N/A",
      TahunPerolehan: "2023",
      NoPendaftaran: "KKM/PC/005",
      KodSewaan: "N/A",
      NoSiri: "SN-PC-005",
      Catatan: "Komputer di kaunter farmasi.",
    },
    NB: {
      Bilangan: "0",
      JenisPerolehan: "",
      NamaProjek: "",
      TahunPerolehan: "",
      NoPendaftaran: "",
      KodSewaan: "",
      NoSiri: "",
      Catatan: "",
    },
    Printer: {
      Bilangan: "1",
      JenisPerolehan: "Sewa",
      NamaProjek: "Projek 2023",
      TahunPerolehan: "2023",
      NoPendaftaran: "KKM/PRN/003",
      KodSewaan: "RENT-PRN-003",
      NoSiri: "SN-PRN-003",
      Jenama: "Epson",
      Jenis: "Dot Matrix",
      KodInk: "EPS-789",
      Catatan: "Untuk cetakan label ubat.",
    },
  },
  {
    Bil: 6,
    Nama: "Dr. Tan Siew Lee",
    Jawatan: "Pakar Perubatan",
    Gred: "UD54",
    Emel: "siewlee.tan@kkm.gov.my",
    Cawangan: "Pakar Perubatan",
    Wing: "Wing 2",
    StatusPerjawatan: "Tetap",
    Avatar: "avatar6",
    PC: {
      Bilangan: "1",
      JenisPerolehan: "Beli",
      NamaProjek: "N/A",
      TahunPerolehan: "2023",
      NoPendaftaran: "KKM/PC/006",
      KodSewaan: "N/A",
      NoSiri: "SN-PC-006",
      Catatan: "PC di bilik konsultasi.",
    },
    NB: {
      Bilangan: "1",
      JenisPerolehan: "Sewa",
      NamaProjek: "Projek 2023",
      TahunPerolehan: "2023",
      NoPendaftaran: "KKM/NB/005",
      KodSewaan: "RENT-NB-005",
      NoSiri: "SN-NB-005",
      Catatan: "Untuk pembentangan.",
    },
    Printer: {
      Bilangan: "0",
      JenisPerolehan: "",
      NamaProjek: "",
      TahunPerolehan: "",
      NoPendaftaran: "",
      KodSewaan: "",
      NoSiri: "",
      Jenama: "",
      Jenis: "",
      KodInk: "",
      Catatan: "",
    },
  },
];

export const getGradeValue = (grade: string): number => {
  return getGradeRank(grade);
};


// In a real app, this would be an API call.
// For now, we'll use local functions to simulate data fetching.
export const getStaff = (): Staff[] => {
  return sortStaffByGradeDesc(staffData);
};

export const getStaffByWing = (wing: string): Staff[] => {
  return getStaff().filter(
    (staff) => staff.Wing.toLowerCase() === `wing ${wing}`.toLowerCase()
  );
};

export const getStaffByEmail = (email: string): Staff | undefined => {
  return staffData.find(
    (staff) => staff.Emel.toLowerCase() === email.toLowerCase()
  );
};

export const updateStaffByEmail = (email: string, updatedStaff: Partial<Staff>): boolean => {
    const staffIndex = staffData.findIndex(
        (staff) => staff.Emel.toLowerCase() === email.toLowerCase()
    );

    if (staffIndex !== -1) {
        staffData[staffIndex] = { ...staffData[staffIndex], ...updatedStaff };
        return true;
    }
    return false;
};

export const addStaff = (newData: Omit<Staff, 'Bil' | 'Avatar'>): boolean => {
  const idx = staffData.findIndex(staff => staff.Emel.toLowerCase() === newData.Emel.toLowerCase());
  if (idx !== -1) {
    // Update existing staff
    const oldBil = staffData[idx].Bil;
    const avatarId = staffData[idx].Avatar;
    staffData[idx] = { ...newData, Bil: oldBil, Avatar: avatarId };
    return true;
  }
  // Add new staff
  const newBil = staffData.length > 0 ? Math.max(...staffData.map(s => s.Bil)) + 1 : 1;
  const avatarId = `avatar${(newBil % 6) + 1}`; // Cycle through existing 6 avatars
  const newStaff: Staff = {
    ...newData,
    Bil: newBil,
    Avatar: avatarId,
  };
  staffData.push(newStaff);
  return true;
}

// This is a client-side store for demonstrating updates without a real backend.
// In a real application, you would use state management libraries (like Zustand, Redux) 
// or React Query/SWR to manage server state.
if (typeof window !== 'undefined') {
    (window as any).staffData = staffData;
    (window as any).updateStaff = (email: string, updatedStaff: Partial<Staff>) => {
        const staffIndex = (window as any).staffData.findIndex(
            (staff: Staff) => staff.Emel.toLowerCase() === email.toLowerCase()
        );
        if (staffIndex > -1) {
            (window as any).staffData[staffIndex] = { ...(window as any).staffData[staffIndex], ...updatedStaff };
            console.log('Staff updated:', (window as any).staffData[staffIndex]);
            return true;
        }
        return false;
    };
    (window as any).addStaff = (newData: Omit<Staff, 'Bil' | 'Avatar'>) => {
        const staffArray = (window as any).staffData as Staff[];
        const emailExists = staffArray.some((staff: Staff) => staff.Emel.toLowerCase() === newData.Emel.toLowerCase());
        if (emailExists) {
            console.error("Staff with this email already exists.");
            return false;
        }

        const newBil = staffArray.length > 0 ? Math.max(...staffArray.map((s: Staff) => s.Bil)) + 1 : 1;
        const avatarId = `avatar${(newBil % 6) + 1}`;

        const newStaff: Staff = {
            ...newData,
            Bil: newBil,
            Avatar: avatarId,
        };

        staffArray.push(newStaff);
        return true;
    }
}
