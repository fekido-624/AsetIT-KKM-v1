'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Staff } from '@/lib/types';
import { resolveAvatarSrc } from '@/lib/avatar-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSessionUser } from '@/hooks/use-session-user';
import { getProcurementSelectValue, PROCUREMENT_TYPE_OPTIONS } from '@/lib/procurement-types';
import { CATATAN_OPTIONS, getCatatanSelectValue } from '@/lib/catatan-options';
import { ArrowLeft, Briefcase, Building, Camera, HardDrive, Laptop, Mail, MapPin, Pencil, Printer, Save, Upload, User, X } from 'lucide-react';

const CAWANGAN_OPTIONS = [
  'ARAC',
  'Eksport',
  'Import',
  'Industri Domestik (CID)',
  'Komunikasi & Kepenggunaan (K&K)',
  'Kosong',
  'MJMM',
  'Makmal',
  'PMA',
  'PRE-MARKET APPROVAL',
  'Pejabat DPSSC',
  'Pejabat PDSC',
  'Pejabat PPI',
  'Pejabat Timbalan Ketua Pengarah Kesihatan (Keselamatan Dan Kualiti Makanan)',
  'Pematuhan Domestik (CPD)',
  'Pengurusan',
  'Polisi & Pembangunan (P&P)',
  'Standard Codex (S&C)',
  'Surveilan',
  'Tiada',
] as const;

interface StaffDetailClientProps {
  initialStaff: Staff;
  backHref?: string;
}

type EditableAsset = 'PC' | 'NB' | 'Printer';
type ProfileSnapshot = Pick<Staff, 'Nama' | 'Jawatan' | 'Gred' | 'Cawangan' | 'Wing' | 'StatusPerjawatan'>;

const AVATAR_CROP_SIZE = 320;
const AVATAR_MIN_ZOOM = 1;
const AVATAR_MAX_ZOOM = 3;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCoverScale(width: number, height: number) {
  if (!width || !height) {
    return 1;
  }
  return Math.max(AVATAR_CROP_SIZE / width, AVATAR_CROP_SIZE / height);
}

function clampAvatarOffset(
  offset: { x: number; y: number },
  imageSize: { width: number; height: number },
  zoom: number
) {
  const baseScale = getCoverScale(imageSize.width, imageSize.height);
  const scaledWidth = imageSize.width * baseScale * zoom;
  const scaledHeight = imageSize.height * baseScale * zoom;
  const maxOffsetX = Math.max(0, (scaledWidth - AVATAR_CROP_SIZE) / 2);
  const maxOffsetY = Math.max(0, (scaledHeight - AVATAR_CROP_SIZE) / 2);

  return {
    x: clamp(offset.x, -maxOffsetX, maxOffsetX),
    y: clamp(offset.y, -maxOffsetY, maxOffsetY),
  };
}

export function StaffDetailClient({ initialStaff, backHref = '/dashboard' }: StaffDetailClientProps) {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff>(initialStaff);
  const cawanganSet = new Set<string>(CAWANGAN_OPTIONS);
  const [isCustomCawangan, setIsCustomCawangan] = useState(
    initialStaff.Cawangan !== '' && !cawanganSet.has(initialStaff.Cawangan)
  );
  const [catatanMode, setCatatanMode] = useState<Record<EditableAsset, boolean>>({
    PC: false,
    NB: false,
    Printer: false,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSnapshot, setProfileSnapshot] = useState<ProfileSnapshot | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [avatarDraftSrc, setAvatarDraftSrc] = useState<string | null>(null);
  const [avatarDraftName, setAvatarDraftName] = useState('');
  const [avatarDraftType, setAvatarDraftType] = useState('image/png');
  const [avatarDraftSize, setAvatarDraftSize] = useState({ width: 0, height: 0 });
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarOffset, setAvatarOffset] = useState({ x: 0, y: 0 });
  const avatarDragRef = useRef<{ pointerId: number; startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);
  const [isEditing, setIsEditing] = useState<EditableAsset | null>(null);
  const { user } = useSessionUser();
  const canManageStaff = user?.role === 'admin';
  const cawanganSelectValue = isCustomCawangan ? 'CUSTOM' : staff.Cawangan;
  
  const { toast } = useToast();

  const handleInputChange = (assetType: EditableAsset, field: string, value: string) => {
    setStaff(prev => ({
      ...prev,
      [assetType]: {
        ...prev[assetType],
        [field]: value
      }
    }));
  };

  const handleSave = async (assetType: EditableAsset) => {
    try {
      const res = await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staff.Emel,
          assetType,
          assetData: staff[assetType],
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || `Could not save ${assetType} details.`));
      }

      toast({
        title: 'Asset Updated',
        description: `${assetType} details for ${staff.Nama} have been saved.`,
      });
      setIsEditing(null);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: (error as Error).message || `Could not save ${assetType} details.`,
      });
    }
  };

  const avatarSrc = resolveAvatarSrc(staff.Avatar);

  useEffect(() => {
    return () => {
      if (avatarDraftSrc) {
        window.URL.revokeObjectURL(avatarDraftSrc);
      }
    };
  }, [avatarDraftSrc]);

  const resetAvatarDraft = () => {
    setAvatarZoom(1);
    setAvatarOffset({ x: 0, y: 0 });
    setAvatarDraftSize({ width: 0, height: 0 });
    setAvatarDraftName('');
    setAvatarDraftType('image/png');
    setAvatarDraftSrc((prev) => {
      if (prev) {
        window.URL.revokeObjectURL(prev);
      }
      return null;
    });
  };

  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  const prepareAvatarDraft = async (file: File) => {
    const objectUrl = window.URL.createObjectURL(file);

    try {
      const image = new window.Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Gagal baca gambar yang dipilih.'));
        image.src = objectUrl;
      });

      setAvatarDraftSrc((prev) => {
        if (prev) {
          window.URL.revokeObjectURL(prev);
        }
        return objectUrl;
      });
      setAvatarDraftName(file.name || 'avatar.png');
      setAvatarDraftType(file.type || 'image/png');
      setAvatarDraftSize({ width: image.naturalWidth, height: image.naturalHeight });
      setAvatarZoom(1);
      setAvatarOffset({ x: 0, y: 0 });
      setIsAvatarDialogOpen(true);
    } catch (error) {
      window.URL.revokeObjectURL(objectUrl);
      throw error;
    }
  };

  const buildCroppedAvatarFile = async () => {
    if (!avatarDraftSrc || !avatarDraftSize.width || !avatarDraftSize.height) {
      throw new Error('Tiada gambar untuk dicrop.');
    }

    const image = new window.Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Gagal proses gambar untuk crop.'));
      image.src = avatarDraftSrc;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas tidak tersedia untuk crop gambar.');
    }

    const baseScale = getCoverScale(avatarDraftSize.width, avatarDraftSize.height);
    const effectiveScale = baseScale * avatarZoom;
    const sourceWidth = AVATAR_CROP_SIZE / effectiveScale;
    const sourceHeight = AVATAR_CROP_SIZE / effectiveScale;
    const sourceX = avatarDraftSize.width / 2 - sourceWidth / 2 - avatarOffset.x / effectiveScale;
    const sourceY = avatarDraftSize.height / 2 - sourceHeight / 2 - avatarOffset.y / effectiveScale;

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const mimeType = avatarDraftType === 'image/webp' ? 'image/webp' : 'image/jpeg';
    const extension = mimeType === 'image/webp' ? 'webp' : 'jpg';
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, 0.92));
    if (!blob) {
      throw new Error('Gagal hasilkan fail gambar selepas crop.');
    }

    const safeName = avatarDraftName.replace(/\.[^.]+$/, '') || 'avatar';
    return new File([blob], `${safeName}-cropped.${extension}`, { type: mimeType });
  };

  const handleAvatarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!avatarDraftSrc) {
      return;
    }

    avatarDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: avatarOffset.x,
      startOffsetY: avatarOffset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleAvatarPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!avatarDragRef.current || avatarDragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - avatarDragRef.current.startX;
    const deltaY = event.clientY - avatarDragRef.current.startY;
    setAvatarOffset(
      clampAvatarOffset(
        {
          x: avatarDragRef.current.startOffsetX + deltaX,
          y: avatarDragRef.current.startOffsetY + deltaY,
        },
        avatarDraftSize,
        avatarZoom
      )
    );
  };

  const handleAvatarPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!avatarDragRef.current || avatarDragRef.current.pointerId !== event.pointerId) {
      return;
    }

    avatarDragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleProfileInputChange = (field: keyof Staff, value: string) => {
    setStaff((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: initialStaff.Emel,
          profile: {
            Nama: staff.Nama,
            Jawatan: staff.Jawatan,
            Gred: staff.Gred,
            Cawangan: staff.Cawangan,
            Wing: staff.Wing,
            StatusPerjawatan: staff.StatusPerjawatan,
          },
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Failed to save profile'));
      }

      setIsEditingProfile(false);
      setProfileSnapshot(null);
      toast({
        title: 'Profile Updated',
        description: 'Maklumat profil staf berjaya dikemaskini.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: (error as Error).message || 'Tidak dapat simpan profil staf.',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleStartEditProfile = () => {
    setProfileSnapshot({
      Nama: staff.Nama,
      Jawatan: staff.Jawatan,
      Gred: staff.Gred,
      Cawangan: staff.Cawangan,
      Wing: staff.Wing,
      StatusPerjawatan: staff.StatusPerjawatan,
    });
    setIsCustomCawangan(staff.Cawangan !== '' && !cawanganSet.has(staff.Cawangan));
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    if (profileSnapshot) {
      setStaff((prev) => ({ ...prev, ...profileSnapshot }));
      setIsCustomCawangan(profileSnapshot.Cawangan !== '' && !cawanganSet.has(profileSnapshot.Cawangan));
    }
    setIsEditingProfile(false);
    setProfileSnapshot(null);
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      await prepareAvatarDraft(file);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gambar tidak dapat dibuka',
        description: (error as Error).message || 'Tidak dapat sediakan gambar untuk crop.',
      });
    } finally {
      event.target.value = '';
    }
  };

  const handleUploadCroppedAvatar = async () => {
    setIsSavingAvatar(true);
    try {
      const croppedFile = await buildCroppedAvatarFile();
      const payload = new FormData();
      payload.append('email', staff.Emel);
      payload.append('file', croppedFile);

      const res = await fetch('/api/staff/avatar', {
        method: 'POST',
        body: payload,
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Failed to update avatar'));
      }

      setStaff((prev) => ({ ...prev, Avatar: String(body.avatar || prev.Avatar) }));
      setIsAvatarDialogOpen(false);
      resetAvatarDraft();
      toast({
        title: 'Avatar Updated',
        description: 'Gambar staf berjaya diganti.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: (error as Error).message || 'Tidak dapat simpan avatar staf.',
      });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleDeleteStaff = async () => {
    const confirmed = window.confirm(`Padam staf ${staff.Nama}? Tindakan ini tidak boleh diundur.`);
    if (!confirmed) {
      return;
    }

    setIsDeletingStaff(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: staff.Emel }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Failed to delete staff'));
      }

      toast({
        title: 'Staff Deleted',
        description: `${staff.Nama} telah dipadam dari sistem.`,
      });
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: (error as Error).message || 'Tidak dapat padam staf.',
      });
    } finally {
      setIsDeletingStaff(false);
    }
  };

  const renderAssetTab = (assetType: EditableAsset, icon: React.ReactNode) => {
    const asset = staff[assetType];
    const isBeingEdited = isEditing === assetType;

    const fields = Object.entries(asset) as [keyof typeof asset, string][];

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">{icon} {assetType} Details</CardTitle>
            {canManageStaff && isBeingEdited ? (
              <Button size="sm" onClick={() => handleSave(assetType)}>
                <Save className="w-4 h-4 mr-2"/> Save
              </Button>
            ) : canManageStaff ? (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(assetType)}>
                <Pencil className="w-4 h-4 mr-2"/> Edit
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map(([key, value]) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
              <Label htmlFor={`${assetType}-${key}`} className="text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
              {isBeingEdited ? (
                key === 'JenisPerolehan' ? (
                  <div className="md:col-span-2 space-y-2">
                    <Select
                      value={getProcurementSelectValue(value)}
                      onValueChange={(next) => {
                        if (next === 'custom') {
                          if (getProcurementSelectValue(value) !== 'custom') {
                            handleInputChange(assetType, key, '');
                          }
                          return;
                        }
                        handleInputChange(assetType, key, next);
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

                    {getProcurementSelectValue(value) === 'custom' ? (
                      <div className="flex gap-2">
                        <Input
                          value={value}
                          onChange={(e) => handleInputChange(assetType, key, e.target.value)}
                          placeholder="Contoh: Sewaan Projek XYZ"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleInputChange(assetType, key, '')}
                        >
                          Padam
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : key === 'Catatan' ? (
                  <div className="md:col-span-2 space-y-2">
                    {(() => {
                      const detectedCustom = getCatatanSelectValue(value) === 'CUSTOM';
                      const isCustomMode = catatanMode[assetType] || detectedCustom;

                      return (
                        <>
                          <Select
                            value={isCustomMode ? 'CUSTOM' : getCatatanSelectValue(value)}
                            onValueChange={(next) => {
                              if (next === 'CUSTOM') {
                                setCatatanMode((prev) => ({ ...prev, [assetType]: true }));
                                if (!isCustomMode) {
                                  handleInputChange(assetType, key, '');
                                }
                                return;
                              }

                              setCatatanMode((prev) => ({ ...prev, [assetType]: false }));
                              handleInputChange(assetType, key, next);
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
                                value={value}
                                onChange={(e) => {
                                  setCatatanMode((prev) => ({ ...prev, [assetType]: true }));
                                  handleInputChange(assetType, key, e.target.value);
                                }}
                                placeholder="Contoh: Done (asset rosak)"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setCatatanMode((prev) => ({ ...prev, [assetType]: true }));
                                  handleInputChange(assetType, key, '');
                                }}
                              >
                                Padam
                              </Button>
                            </div>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <Input
                    id={`${assetType}-${key}`}
                    value={value}
                    onChange={(e) => handleInputChange(assetType, key, e.target.value)}
                    className="md:col-span-2"
                  />
                )
              ) : (
                <p className="md:col-span-2 font-medium">{value || 'N/A'}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Button type="button" variant="outline" onClick={() => router.push(backHref)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Senarai
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Dialog
              open={isAvatarDialogOpen}
              onOpenChange={(open) => {
                setIsAvatarDialogOpen(open);
                if (!open && !isSavingAvatar) {
                  resetAvatarDraft();
                }
              }}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="group relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={`Lihat gambar ${staff.Nama}`}
                >
                  <Avatar className="h-28 w-28 rounded-full border-[5px] border-primary/80 bg-muted shadow-xl ring-4 ring-primary/10 transition-transform duration-200 group-hover:scale-[1.03]">
                    <AvatarImage src={avatarSrc} alt={staff.Nama} className="object-cover" />
                    <AvatarFallback className="text-4xl">{staff.Nama.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-background/95 px-3 py-1 text-[11px] font-medium text-foreground shadow-md ring-1 ring-border">
                    <Camera className="h-3.5 w-3.5" />
                    Lihat
                  </span>
                </button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl overflow-hidden border-primary/10 p-0">
                <div className="bg-gradient-to-br from-primary/10 via-background to-muted/70 p-6 sm:p-8">
                  <DialogHeader className="mb-4 pr-8">
                    <DialogTitle>{avatarDraftSrc ? 'Laraskan Crop Gambar' : 'Gambar Staf'}</DialogTitle>
                    <DialogDescription>
                      {avatarDraftSrc
                        ? 'Drag gambar dalam frame bulat dan laras zoom sebelum upload.'
                        : `Preview gambar untuk ${staff.Nama}. Klik butang di bawah untuk ganti gambar jika perlu.`}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="rounded-[28px] border border-border/60 bg-background/80 p-4 shadow-2xl backdrop-blur-sm">
                    {avatarDraftSrc ? (
                      <div className="space-y-5">
                        <div className="mx-auto flex w-full max-w-[360px] justify-center">
                          <div
                            className="relative flex h-[320px] w-[320px] touch-none items-center justify-center overflow-hidden rounded-full border-[6px] border-primary/70 bg-muted shadow-xl"
                            onPointerDown={handleAvatarPointerDown}
                            onPointerMove={handleAvatarPointerMove}
                            onPointerUp={handleAvatarPointerEnd}
                            onPointerCancel={handleAvatarPointerEnd}
                          >
                            <img
                              src={avatarDraftSrc}
                              alt={`Crop ${staff.Nama}`}
                              className="max-w-none select-none"
                              draggable={false}
                              style={{
                                width: avatarDraftSize.width
                                  ? `${avatarDraftSize.width * getCoverScale(avatarDraftSize.width, avatarDraftSize.height) * avatarZoom}px`
                                  : undefined,
                                height: avatarDraftSize.height
                                  ? `${avatarDraftSize.height * getCoverScale(avatarDraftSize.width, avatarDraftSize.height) * avatarZoom}px`
                                  : undefined,
                                transform: `translate(${avatarOffset.x}px, ${avatarOffset.y}px)`,
                              }}
                            />
                            <div className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-background/70" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Zoom</span>
                            <span>{avatarZoom.toFixed(1)}x</span>
                          </div>
                          <Slider
                            value={[avatarZoom]}
                            min={AVATAR_MIN_ZOOM}
                            max={AVATAR_MAX_ZOOM}
                            step={0.05}
                            onValueChange={(value) => {
                              const nextZoom = value[0] || 1;
                              setAvatarZoom(nextZoom);
                              setAvatarOffset((prev) => clampAvatarOffset(prev, avatarDraftSize, nextZoom));
                            }}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Button type="button" onClick={handleUploadCroppedAvatar} disabled={isSavingAvatar}>
                            <Upload className="mr-2 h-4 w-4" />
                            {isSavingAvatar ? 'Uploading...' : 'Simpan Gambar'}
                          </Button>
                          <Button type="button" variant="outline" onClick={handleChooseAvatar} disabled={isSavingAvatar}>
                            Pilih Gambar Lain
                          </Button>
                          <Button type="button" variant="ghost" onClick={resetAvatarDraft} disabled={isSavingAvatar}>
                            <X className="mr-2 h-4 w-4" />
                            Batal Crop
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex aspect-square max-h-[70vh] items-center justify-center overflow-hidden rounded-[24px] bg-muted/50">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={staff.Nama}
                              className="h-full w-full object-contain transition-transform duration-300 ease-out"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-7xl font-semibold text-muted-foreground">
                              {staff.Nama.charAt(0)}
                            </div>
                          )}
                        </div>

                        {canManageStaff ? (
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <Button type="button" onClick={handleChooseAvatar} disabled={isSavingAvatar}>
                              <Upload className="mr-2 h-4 w-4" />
                              Replace Image
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Format dibenarkan: jpg, jpeg, png, webp.
                            </p>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start">
                {canManageStaff && isEditingProfile ? (
                  <Input value={staff.Nama} onChange={(e) => handleProfileInputChange('Nama', e.target.value)} className="mb-2 sm:mb-0" />
                ) : (
                  <CardTitle className="text-3xl font-headline mb-2 sm:mb-0">{staff.Nama}</CardTitle>
                )}
                  {canManageStaff && isEditingProfile ? (
                  <Input value={staff.Gred} onChange={(e) => handleProfileInputChange('Gred', e.target.value)} className="sm:max-w-48" />
                ) : (
                  <Badge variant={staff.Gred.startsWith('JUSA') ? "destructive" : "default"} className="text-lg px-4 py-1">{staff.Gred}</Badge>
                )}
              </div>
              <div className="mt-2">
                {canManageStaff && isEditingProfile ? (
                  <Input value={staff.Jawatan} onChange={(e) => handleProfileInputChange('Jawatan', e.target.value)} />
                ) : (
                  <p className="flex items-center gap-3 text-muted-foreground text-md">
                    <Briefcase className="w-5 h-5"/> {staff.Jawatan}
                  </p>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                {canManageStaff && isEditingProfile ? (
                  <>
                    <Button type="button" onClick={handleSaveProfile} disabled={isSavingProfile}>
                      {isSavingProfile ? 'Saving...' : 'Save Profile'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelEditProfile} disabled={isSavingProfile}>
                      Cancel
                    </Button>
                  </>
                ) : canManageStaff ? (
                  <Button type="button" variant="outline" onClick={handleStartEditProfile}>
                    Edit Profile
                  </Button>
                ) : null}
              </div>
              {canManageStaff ? <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteStaff}
                  disabled={isDeletingStaff}
                >
                  {isDeletingStaff ? 'Deleting...' : 'Delete Staff'}
                </Button>
              </div> : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t">
          <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /><span>{staff.Emel}</span></div>
          <div className="flex items-center gap-3"><User className="w-5 h-5 text-primary" />{isEditingProfile ? <Input value={staff.StatusPerjawatan} onChange={(e) => handleProfileInputChange('StatusPerjawatan', e.target.value)} /> : <span>{staff.StatusPerjawatan}</span>}</div>
          <div className="flex items-center gap-3"><Building className="w-5 h-5 text-primary" />{isEditingProfile ? <div className="w-full space-y-2"><Select value={cawanganSelectValue} onValueChange={(value) => {
            if (value === 'CUSTOM') {
              setIsCustomCawangan(true);
              handleProfileInputChange('Cawangan', '');
              return;
            }
            setIsCustomCawangan(false);
            handleProfileInputChange('Cawangan', value);
          }}><SelectTrigger><SelectValue placeholder="Pilih Cawangan" /></SelectTrigger><SelectContent>{CAWANGAN_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}<SelectItem value="CUSTOM">Lain-lain (isi sendiri)</SelectItem></SelectContent></Select>{isCustomCawangan ? <Input value={staff.Cawangan} onChange={(e) => {
            setIsCustomCawangan(true);
            handleProfileInputChange('Cawangan', e.target.value);
          }} placeholder="Contoh: Unit Khas" /> : null}</div> : <span>{staff.Cawangan}</span>}</div>
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-primary" />{isEditingProfile ? <Input value={staff.Wing} onChange={(e) => handleProfileInputChange('Wing', e.target.value)} /> : <span>{staff.Wing}</span>}</div>
        </CardContent>
      </Card>

      <Tabs defaultValue="PC">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="PC"><HardDrive className="w-4 h-4 mr-2" />PC</TabsTrigger>
          <TabsTrigger value="NB"><Laptop className="w-4 h-4 mr-2" />Laptop</TabsTrigger>
          <TabsTrigger value="Printer"><Printer className="w-4 h-4 mr-2" />Printer</TabsTrigger>
        </TabsList>
        <TabsContent value="PC">{renderAssetTab('PC', <HardDrive />)}</TabsContent>
        <TabsContent value="NB">{renderAssetTab('NB', <Laptop />)}</TabsContent>
        <TabsContent value="Printer">{renderAssetTab('Printer', <Printer />)}</TabsContent>
      </Tabs>
      
    </div>
  );
}
