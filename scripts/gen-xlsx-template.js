import * as XLSX from "xlsx";

const header = [
  "Bil","Nama","Jawatan","Gred","Emel","Cawangan / Bahagian / Unit","Wing","Status Perjawatan",
  "Bilangan PC dibekalkan","Jenis Perolehan (PC)","Nama Projek (PC)","Tahun Perolehan (PC)","No Pendaftaran (Kew PA) PC","Kod Sewaan / Peyelenggaraan (PC)","No. Siri PC","Catatan (PC)",
  "Bilangan NB dibekalkan","Jenis Perolehan (NB)","Nama Projek (NB)","Tahun Perolehan (NB)","No Pendaftaran (Kew PA) NB","Kod Sewaan / Peyelenggaraan (NB)","No. Siri NB","Catatan (NB)",
  "Bilangan Printer dibekalkan","Jenis Perolehan (Printer)","Nama Projek (Printer)","Tahun Perolehan (Printer)","No Pendaftaran (Kew PA) Printer","Kod Sewaan / Peyelenggaraan (Printer)","No. Siri Printer","Jenama (Printer)","Jenis (Printer)","Kod Ink / Toner","Catatan (Printer)"
];
const example = [
  1,"Ali Bin Abu","Penolong Pegawai","FA29","ali.abu@email.com","Bahagian ICT","Wing 3","Kontrak",
  1,"Perolehan Baru","Projek ICT 2023",2023,"PC12345","SWN001","SN001","Catatan PC",
  1,"Perolehan Baru","Projek NB 2023",2023,"NB12345","SWN002","SN002","Catatan NB",
  1,"Perolehan Baru","Projek Printer 2023",2023,"PR12345","SWN003","SN003","Canon","Laser","INK001","Catatan Printer"
];

const ws = XLSX.utils.aoa_to_sheet([header, example]);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Template");
XLSX.writeFile(wb, "public/Staff_Bulk_Upload_Template.xlsx");
