"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import AuthGuard from '@/components/auth-guard';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { addStaff } from "@/lib/data";

export default function BulkUploadPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an Excel (.xlsx) file to upload.",
      });
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (rows.length < 2) {
        setIsUploading(false);
        toast({
          variant: "destructive",
          title: "Excel Error",
          description: "Excel file must have a header and at least one row.",
        });
        return;
      }
      const expectedHeader = [
        "Bil","Nama","Jawatan","Gred","Emel","Cawangan / Bahagian / Unit","Wing","Status Perjawatan",
        "Bilangan PC dibekalkan","Jenis Perolehan (PC)","Nama Projek (PC)","Tahun Perolehan (PC)","No Pendaftaran (Kew PA) PC","Kod Sewaan / Peyelenggaraan (PC)","No. Siri PC","Catatan (PC)",
        "Bilangan NB dibekalkan","Jenis Perolehan (NB)","Nama Projek (NB)","Tahun Perolehan (NB)","No Pendaftaran (Kew PA) NB","Kod Sewaan / Peyelenggaraan (NB)","No. Siri NB","Catatan (NB)",
        "Bilangan Printer dibekalkan","Jenis Perolehan (Printer)","Nama Projek (Printer)","Tahun Perolehan (Printer)","No Pendaftaran (Kew PA) Printer","Kod Sewaan / Peyelenggaraan (Printer)","No. Siri Printer","Jenama (Printer)","Jenis (Printer)","Kod Ink / Toner","Catatan (Printer)"
      ];
      const header = (rows[0] as string[]).map(h => (h || "").toString().trim());
      if (header.length !== expectedHeader.length || !header.every((h, i) => h === expectedHeader[i])) {
        setIsUploading(false);
        toast({
          variant: "destructive",
          title: "Excel Header Error",
          description: "Excel header does not match expected format. Sila guna template.",
        });
        return;
      }
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      for (let i = 1; i < rows.length; i++) {
        const columns = (rows[i] as string[]).map(c => (c || "").toString().trim());
        while (columns.length < expectedHeader.length) columns.push("");
        if (columns.length !== expectedHeader.length) {
          errorCount++;
          errors.push(`Row ${i + 1}: Invalid number of columns. Expected ${expectedHeader.length}, got ${columns.length}.`);
          continue;
        }
        const [
          Bil, Nama, Jawatan, Gred, Emel, Cawangan, Wing, StatusPerjawatan,
          PC_Bilangan, PC_JenisPerolehan, PC_NamaProjek, PC_TahunPerolehan, PC_NoPendaftaran, PC_KodSewaan, PC_NoSiri, PC_Catatan,
          NB_Bilangan, NB_JenisPerolehan, NB_NamaProjek, NB_TahunPerolehan, NB_NoPendaftaran, NB_KodSewaan, NB_NoSiri, NB_Catatan,
          Printer_Bilangan, Printer_JenisPerolehan, Printer_NamaProjek, Printer_TahunPerolehan, Printer_NoPendaftaran, Printer_KodSewaan, Printer_NoSiri, Printer_Jenama, Printer_Jenis, Printer_KodInk, Printer_Catatan
        ] = columns;
        const staffData = {
          Nama: (Nama || '').trim(),
          Jawatan: (Jawatan || '').trim(),
          Gred: (Gred || '').trim(),
          Emel: (Emel || '').trim(),
          Cawangan: (Cawangan || '').trim(),
          Wing: (Wing || '').trim(),
          StatusPerjawatan: (StatusPerjawatan || '').trim(),
          PC_Bilangan: (PC_Bilangan || '').trim(),
          PC_JenisPerolehan: (PC_JenisPerolehan || '').trim(),
          PC_NamaProjek: (PC_NamaProjek || '').trim(),
          PC_TahunPerolehan: (PC_TahunPerolehan || '').trim(),
          PC_NoPendaftaran: (PC_NoPendaftaran || '').trim(),
          PC_KodSewaan: (PC_KodSewaan || '').trim(),
          PC_NoSiri: (PC_NoSiri || '').trim(),
          PC_Catatan: (PC_Catatan || '').trim(),
          NB_Bilangan: (NB_Bilangan || '').trim(),
          NB_JenisPerolehan: (NB_JenisPerolehan || '').trim(),
          NB_NamaProjek: (NB_NamaProjek || '').trim(),
          NB_TahunPerolehan: (NB_TahunPerolehan || '').trim(),
          NB_NoPendaftaran: (NB_NoPendaftaran || '').trim(),
          NB_KodSewaan: (NB_KodSewaan || '').trim(),
          NB_NoSiri: (NB_NoSiri || '').trim(),
          NB_Catatan: (NB_Catatan || '').trim(),
          Printer_Bilangan: (Printer_Bilangan || '').trim(),
          Printer_JenisPerolehan: (Printer_JenisPerolehan || '').trim(),
          Printer_NamaProjek: (Printer_NamaProjek || '').trim(),
          Printer_TahunPerolehan: (Printer_TahunPerolehan || '').trim(),
          Printer_NoPendaftaran: (Printer_NoPendaftaran || '').trim(),
          Printer_KodSewaan: (Printer_KodSewaan || '').trim(),
          Printer_NoSiri: (Printer_NoSiri || '').trim(),
          Printer_Jenama: (Printer_Jenama || '').trim(),
          Printer_Jenis: (Printer_Jenis || '').trim(),
          Printer_KodInk: (Printer_KodInk || '').trim(),
          Printer_Catatan: (Printer_Catatan || '').trim(),
        };
        try {
          const res = await fetch('/api/staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(staffData),
          });
          if (res.ok) {
            successCount++;
          } else {
            const body = await res.json().catch(() => ({}));
            errorCount++;
            errors.push(`Row ${i + 1}: ${String(body?.message || res.statusText || 'Request failed')}`);
          }
        } catch (err) {
          errorCount++;
          errors.push(`Row ${i + 1}: ${(err as Error).message || 'Network error'}`);
        }
      }
      setIsUploading(false);
      if (document.querySelector('input[type="file"]')) {
        (document.querySelector('input[type="file"]') as HTMLInputElement).value = "";
      }
      setFile(null);
      toast({
        title: 'Bulk Upload Complete',
        description: `${successCount} staff added successfully. ${errorCount} failed.`,
      });
      if (errorCount > 0) {
        toast({
          variant: 'destructive',
          title: 'Upload Errors',
          description: (
            <div className="text-sm">
              <p>Some rows could not be imported:</p>
              <ul className="list-disc list-inside mt-2">
                {errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                {errors.length > 5 && <li>...and {errors.length - 5} more.</li>}
              </ul>
            </div>
          ),
          duration: 9000,
        });
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "There was an error reading the file.",
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
    <main className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Upload className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Bulk Upload Staff</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input type="file" accept=".xlsx" onChange={handleFileChange} disabled={isUploading} />
            <a
              href="/Staff_Bulk_Upload_Template.xlsx"
              download
              className="inline-block"
            >
              <Button type="button" variant="outline" className="ml-0 sm:ml-4">Download Template</Button>
            </a>
          </div>
          <Button onClick={handleBulkUpload} disabled={isUploading || !file} className="flex-1 sm:flex-auto">
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
          <p className="text-muted-foreground mt-4 text-sm">Pastikan Excel (.xlsx) ikut template (A-AI, 35 kolum). Data akan auto masuk ke Wing mengikut kolum F: Wing.</p>
        </CardContent>
      </Card>
    </main>
    </AuthGuard>
  );
}
