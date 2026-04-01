'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { sortStaffByGradeDesc } from '@/lib/grade-order';
import AuthGuard from '@/components/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet } from 'lucide-react';

type StaffRow = {
  Bil: number;
  Nama: string;
  Jawatan: string;
  Gred: string;
  Emel: string;
  Cawangan: string;
  Wing: string;
  StatusPerjawatan: string;
  PC_Bilangan: string;
  PC_JenisPerolehan: string;
  PC_NamaProjek: string;
  PC_TahunPerolehan: string;
  PC_NoPendaftaran: string;
  PC_KodSewaan: string;
  PC_NoSiri: string;
  PC_Catatan: string;
  NB_Bilangan: string;
  NB_JenisPerolehan: string;
  NB_NamaProjek: string;
  NB_TahunPerolehan: string;
  NB_NoPendaftaran: string;
  NB_KodSewaan: string;
  NB_NoSiri: string;
  NB_Catatan: string;
  Printer_Bilangan: string;
  Printer_JenisPerolehan: string;
  Printer_NamaProjek: string;
  Printer_TahunPerolehan: string;
  Printer_NoPendaftaran: string;
  Printer_KodSewaan: string;
  Printer_NoSiri: string;
  Printer_Jenama: string;
  Printer_Jenis: string;
  Printer_KodInk: string;
  Printer_Catatan: string;
};

const wingOptions = [
  { label: 'All Staff', value: 'all' },
  { label: 'Wing 1', value: '1' },
  { label: 'Wing 2', value: '2' },
  { label: 'Wing 3', value: '3' },
  { label: 'Wing 4', value: '4' },
];

export default function ExportDataPage() {
  const { toast } = useToast();
  const [wing, setWing] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/staff?wing=${encodeURIComponent(wing)}`);
      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Failed to load staff data'));
      }

      const rows: StaffRow[] = sortStaffByGradeDesc(body?.rows || []);
      if (!rows.length) {
        toast({
          variant: 'destructive',
          title: 'Tiada data',
          description: 'Tiada rekod staf untuk pilihan ini.',
        });
        return;
      }

      const exportRows = rows.map((r, index) => ({
        Bil: wing === 'all' ? r.Bil : index + 1,
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

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Staff');

      const label = wingOptions.find((w) => w.value === wing)?.label.replace(/\s+/g, '_') || 'All_Staff';
      const fileName = `Staff_Export_${label}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: 'Export berjaya',
        description: `${rows.length} rekod telah diexport ke ${fileName}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export gagal',
        description: (error as Error).message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
    <main className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Export Data Staff (.xlsx)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Pilih Data Export</p>
            <Select value={wing} onValueChange={setWing}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Wing" />
              </SelectTrigger>
              <SelectContent>
                {wingOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export XLSX'}
          </Button>
        </CardContent>
      </Card>
    </main>
    </AuthGuard>
  );
}
