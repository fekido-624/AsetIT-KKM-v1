'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthGuard from '@/components/auth-guard';
import { useToast } from '@/hooks/use-toast';
import { getProcurementSelectValue, PROCUREMENT_TYPE_OPTIONS } from '@/lib/procurement-types';
import { CATATAN_OPTIONS, getCatatanSelectValue } from '@/lib/catatan-options';
import { Loader2, UserPlus } from 'lucide-react';

type StaffFormData = {
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

const initialData: StaffFormData = {
  Nama: '',
  Jawatan: '',
  Gred: '',
  Emel: '',
  Cawangan: '',
  Wing: 'Wing 1',
  StatusPerjawatan: 'Tetap',
  PC_Bilangan: '',
  PC_JenisPerolehan: '',
  PC_NamaProjek: '',
  PC_TahunPerolehan: '',
  PC_NoPendaftaran: '',
  PC_KodSewaan: '',
  PC_NoSiri: '',
  PC_Catatan: '',
  NB_Bilangan: '',
  NB_JenisPerolehan: '',
  NB_NamaProjek: '',
  NB_TahunPerolehan: '',
  NB_NoPendaftaran: '',
  NB_KodSewaan: '',
  NB_NoSiri: '',
  NB_Catatan: '',
  Printer_Bilangan: '',
  Printer_JenisPerolehan: '',
  Printer_NamaProjek: '',
  Printer_TahunPerolehan: '',
  Printer_NoPendaftaran: '',
  Printer_KodSewaan: '',
  Printer_NoSiri: '',
  Printer_Jenama: '',
  Printer_Jenis: '',
  Printer_KodInk: '',
  Printer_Catatan: '',
};

export default function AddStaffPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<StaffFormData>(initialData);
  const [catatanMode, setCatatanMode] = useState<Record<'PC_Catatan' | 'NB_Catatan' | 'Printer_Catatan', boolean>>({
    PC_Catatan: false,
    NB_Catatan: false,
    Printer_Catatan: false,
  });

  const setField = (key: keyof StaffFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.Nama || !form.Jawatan || !form.Gred || !form.Emel || !form.Cawangan || !form.Wing || !form.StatusPerjawatan) {
      toast({
        variant: 'destructive',
        title: 'Data tidak lengkap',
        description: 'Sila isi semua medan wajib profil staf.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Gagal tambah staf'));
      }

      if (body?.result === 'updated') {
        toast({
          variant: 'destructive',
          title: '⚠️ Emel sudah wujud!',
          description: `Emel "${form.Emel}" dah ada dalam sistem. Data staf lama telah ditindih. Sila semak semula emel yang dimasukkan.`,
        });
        return;
      }

      toast({
        title: 'Staff berjaya ditambah',
        description: `${form.Nama} telah disimpan dalam database.`,
      });
      setForm(initialData);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ralat simpan data',
        description: (error as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (key: keyof StaffFormData, label: string, placeholder?: string) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        value={form[key]}
        onChange={(e) => setField(key, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  const renderJenisPerolehanField = (
    key: 'PC_JenisPerolehan' | 'NB_JenisPerolehan' | 'Printer_JenisPerolehan',
    label: string,
  ) => {
    const currentValue = form[key];
    const selectValue = getProcurementSelectValue(currentValue);

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select
          value={selectValue}
          onValueChange={(value) => {
            if (value === 'custom') {
              if (selectValue !== 'custom') {
                setField(key, '');
              }
              return;
            }
            setField(key, value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih jenis perolehan" />
          </SelectTrigger>
          <SelectContent>
            {PROCUREMENT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom (Sewaan Lain)</SelectItem>
          </SelectContent>
        </Select>

        {selectValue === 'custom' ? (
          <div className="flex gap-2">
            <Input
              value={currentValue}
              onChange={(e) => setField(key, e.target.value)}
              placeholder="Contoh: Sewaan Projek XYZ"
            />
            <Button type="button" variant="outline" onClick={() => setField(key, '')}>
              Padam
            </Button>
          </div>
        ) : null}
      </div>
    );
  };

  const renderCatatanField = (
    key: 'PC_Catatan' | 'NB_Catatan' | 'Printer_Catatan',
    label: string,
  ) => {
    const currentValue = form[key];
    const detectedCustom = getCatatanSelectValue(currentValue) === 'CUSTOM';
    const isCustomMode = catatanMode[key] || detectedCustom;
    const selectValue = isCustomMode ? 'CUSTOM' : getCatatanSelectValue(currentValue);

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select
          value={selectValue}
          onValueChange={(value) => {
            if (value === 'CUSTOM') {
              setCatatanMode((prev) => ({ ...prev, [key]: true }));
              if (!isCustomMode) {
                setField(key, '');
              }
              return;
            }

            setCatatanMode((prev) => ({ ...prev, [key]: false }));
            setField(key, value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih catatan" />
          </SelectTrigger>
          <SelectContent>
            {CATATAN_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="CUSTOM">CUSTOM TEXT</SelectItem>
          </SelectContent>
        </Select>

        {isCustomMode ? (
          <div className="flex gap-2">
            <Input
              value={currentValue}
              onChange={(e) => {
                setCatatanMode((prev) => ({ ...prev, [key]: true }));
                setField(key, e.target.value);
              }}
              placeholder="Contoh: Done (asset rosak)"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCatatanMode((prev) => ({ ...prev, [key]: true }));
                setField(key, '');
              }}
            >
              Padam
            </Button>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
    <main className="p-4 sm:p-6 md:p-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserPlus className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Tambah Kakitangan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderInput('Nama', 'Nama *', 'Contoh: Ali Bin Abu')}
              {renderInput('Jawatan', 'Jawatan *', 'Contoh: Pegawai Teknologi Makanan')}
              {renderInput('Gred', 'Gred *', 'Contoh: C12')}
              {renderInput('Emel', 'Emel *', 'Contoh: ali.abu@email.com')}
              {renderInput('Cawangan', 'Cawangan / Bahagian / Unit *')}

              <div className="space-y-2">
                <Label>Wing *</Label>
                <Select value={form.Wing} onValueChange={(value) => setField('Wing', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Wing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wing 1">Wing 1</SelectItem>
                    <SelectItem value="Wing 2">Wing 2</SelectItem>
                    <SelectItem value="Wing 3">Wing 3</SelectItem>
                    <SelectItem value="Wing 4">Wing 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status Perjawatan *</Label>
                <Select value={form.StatusPerjawatan} onValueChange={(value) => setField('StatusPerjawatan', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tetap">Tetap</SelectItem>
                    <SelectItem value="Kontrak">Kontrak</SelectItem>
                    <SelectItem value="MyStep">MyStep</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Maklumat PC Desktop</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderInput('PC_Bilangan', 'Bilangan PC')}
                {renderJenisPerolehanField('PC_JenisPerolehan', 'Jenis Perolehan (PC)')}
                {renderInput('PC_NamaProjek', 'Nama Projek (PC)')}
                {renderInput('PC_TahunPerolehan', 'Tahun Perolehan (PC)')}
                {renderInput('PC_NoPendaftaran', 'No Pendaftaran (Kew PA) PC')}
                {renderInput('PC_KodSewaan', 'Kod Sewaan / Peyelenggaraan (PC)')}
                {renderInput('PC_NoSiri', 'No. Siri PC')}
                {renderCatatanField('PC_Catatan', 'Catatan (PC)')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maklumat Laptop (NB)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderInput('NB_Bilangan', 'Bilangan NB')}
                {renderJenisPerolehanField('NB_JenisPerolehan', 'Jenis Perolehan (NB)')}
                {renderInput('NB_NamaProjek', 'Nama Projek (NB)')}
                {renderInput('NB_TahunPerolehan', 'Tahun Perolehan (NB)')}
                {renderInput('NB_NoPendaftaran', 'No Pendaftaran (Kew PA) NB')}
                {renderInput('NB_KodSewaan', 'Kod Sewaan / Peyelenggaraan (NB)')}
                {renderInput('NB_NoSiri', 'No. Siri NB')}
                {renderCatatanField('NB_Catatan', 'Catatan (NB)')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maklumat Printer</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {renderInput('Printer_Bilangan', 'Bilangan Printer')}
                {renderJenisPerolehanField('Printer_JenisPerolehan', 'Jenis Perolehan (Printer)')}
                {renderInput('Printer_NamaProjek', 'Nama Projek (Printer)')}
                {renderInput('Printer_TahunPerolehan', 'Tahun Perolehan (Printer)')}
                {renderInput('Printer_NoPendaftaran', 'No Pendaftaran (Kew PA) Printer')}
                {renderInput('Printer_KodSewaan', 'Kod Sewaan / Peyelenggaraan (Printer)')}
                {renderInput('Printer_NoSiri', 'No. Siri Printer')}
                {renderInput('Printer_Jenama', 'Jenama (Printer)')}
                {renderInput('Printer_Jenis', 'Jenis (Printer)')}
                {renderInput('Printer_KodInk', 'Kod Ink / Toner')}
                {renderCatatanField('Printer_Catatan', 'Catatan (Printer)')}
              </CardContent>
            </Card>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Menyimpan...' : 'Simpan Staff'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
    </AuthGuard>
  );
}
