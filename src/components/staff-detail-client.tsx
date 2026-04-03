'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Staff } from '@/lib/types';
import { resolveAvatarSrc } from '@/lib/avatar-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSessionUser } from '@/hooks/use-session-user';
import { getProcurementSelectValue, PROCUREMENT_TYPE_OPTIONS } from '@/lib/procurement-types';
import { AssetNoteAssistant } from '@/components/asset-note-assistant';
import { ArrowLeft, Briefcase, Building, HardDrive, Laptop, Mail, MapPin, Printer, User, Save, Wand2, Pencil } from 'lucide-react';

interface StaffDetailClientProps {
  initialStaff: Staff;
  backHref?: string;
}

type EditableAsset = 'PC' | 'NB' | 'Printer';
type NoteContextType = { asset: EditableAsset, note: string } | null;
type ProfileSnapshot = Pick<Staff, 'Nama' | 'Jawatan' | 'Gred' | 'Cawangan' | 'Wing' | 'StatusPerjawatan'>;

export function StaffDetailClient({ initialStaff, backHref = '/dashboard' }: StaffDetailClientProps) {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff>(initialStaff);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSnapshot, setProfileSnapshot] = useState<ProfileSnapshot | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);
  const [isEditing, setIsEditing] = useState<EditableAsset | null>(null);
  const [isNoteAssistantOpen, setIsNoteAssistantOpen] = useState(false);
  const [noteContext, setNoteContext] = useState<NoteContextType>(null);
  const { user } = useSessionUser();
  const canManageStaff = user?.role === 'admin';
  
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

  const handleOpenNoteAssistant = (asset: EditableAsset) => {
    setNoteContext({ asset, note: staff[asset].Catatan });
    setIsNoteAssistantOpen(true);
  };

  const handleNoteUpdateFromAssistant = (newNote: string) => {
    if (noteContext) {
      handleInputChange(noteContext.asset, 'Catatan', newNote);
    }
  };


  const avatarSrc = resolveAvatarSrc(staff.Avatar);

  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
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
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    if (profileSnapshot) {
      setStaff((prev) => ({ ...prev, ...profileSnapshot }));
    }
    setIsEditingProfile(false);
    setProfileSnapshot(null);
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsSavingAvatar(true);
    try {
      const payload = new FormData();
      payload.append('email', staff.Emel);
      payload.append('file', file);

      const res = await fetch('/api/staff/avatar', {
        method: 'POST',
        body: payload,
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Failed to update avatar'));
      }

      setStaff((prev) => ({ ...prev, Avatar: String(body.avatar || prev.Avatar) }));
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
      event.target.value = '';
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
                  <div className="md:col-span-2 relative">
                    <Textarea
                      id={`${assetType}-${key}`}
                      value={value}
                      onChange={(e) => handleInputChange(assetType, key, e.target.value)}
                      className="pr-10"
                    />
                    <Button 
                      type="button"
                      size="icon" 
                      variant="ghost" 
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => handleOpenNoteAssistant(assetType)}
                    >
                      <Wand2 className="w-4 h-4 text-primary" />
                    </Button>
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
            <Avatar className="w-24 h-24 border-4 border-primary shadow-lg">
              <AvatarImage src={avatarSrc} alt={staff.Nama} />
              <AvatarFallback className="text-4xl">{staff.Nama.charAt(0)}</AvatarFallback>
            </Avatar>
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
                <Button type="button" onClick={handleChooseAvatar} disabled={isSavingAvatar}>
                  {isSavingAvatar ? 'Uploading...' : 'Edit / Replace Image'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="ml-2"
                  onClick={handleDeleteStaff}
                  disabled={isDeletingStaff}
                >
                  {isDeletingStaff ? 'Deleting...' : 'Delete Staff'}
                </Button>
              </div> : null}
              {canManageStaff ? (
                <p className="text-xs text-muted-foreground mt-2">
                  Pilih gambar dari komputer anda (jpg, jpeg, png, webp).
                </p>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t">
          <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /><span>{staff.Emel}</span></div>
          <div className="flex items-center gap-3"><User className="w-5 h-5 text-primary" />{isEditingProfile ? <Input value={staff.StatusPerjawatan} onChange={(e) => handleProfileInputChange('StatusPerjawatan', e.target.value)} /> : <span>{staff.StatusPerjawatan}</span>}</div>
          <div className="flex items-center gap-3"><Building className="w-5 h-5 text-primary" />{isEditingProfile ? <Input value={staff.Cawangan} onChange={(e) => handleProfileInputChange('Cawangan', e.target.value)} /> : <span>{staff.Cawangan}</span>}</div>
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
      
      {isNoteAssistantOpen && noteContext && (
        <AssetNoteAssistant
          isOpen={isNoteAssistantOpen}
          onClose={() => setIsNoteAssistantOpen(false)}
          note={noteContext.note}
          onNoteUpdate={handleNoteUpdateFromAssistant}
        />
      )}
    </div>
  );
}
