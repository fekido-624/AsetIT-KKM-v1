'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/auth-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useSessionUser } from '@/hooks/use-session-user';
import type { ManagedUser, UserRole } from '@/lib/types';
import { Loader2, Shield, Trash2, UserPlus } from 'lucide-react';

type NewUserForm = {
  username: string;
  password: string;
  role: UserRole;
};

const initialForm: NewUserForm = {
  username: '',
  password: '',
  role: 'user',
};

export default function ManageUsersPage() {
  const { toast } = useToast();
  const { user: sessionUser } = useSessionUser();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [form, setForm] = useState<NewUserForm>(initialForm);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});

  const loadUsers = async (showSpinner = true) => {
    if (showSpinner) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Gagal ambil senarai user.'));
      }
      setUsers(body.users || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ralat load user',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast({
        variant: 'destructive',
        title: 'Data tak lengkap',
        description: 'Username dan password diperlukan.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Gagal cipta user.'));
      }

      toast({
        title: 'User berjaya ditambah',
        description: `Akaun ${body.user.username} telah dicipta.`,
      });
      setForm(initialForm);
      await loadUsers(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cipta user gagal',
        description: (error as Error).message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (username: string, role: UserRole) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Gagal tukar role.'));
      }

      setUsers((prev) => prev.map((item) => (item.username === username ? body.user : item)));
      toast({
        title: 'Role dikemaskini',
        description: `Role untuk ${username} ditukar ke ${role}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Kemaskini role gagal',
        description: (error as Error).message,
      });
      await loadUsers(false);
    }
  };

  const handlePasswordReset = async (username: string) => {
    const password = (passwordDrafts[username] || '').trim();
    if (!password) {
      toast({
        variant: 'destructive',
        title: 'Password kosong',
        description: 'Masukkan password baru dahulu.',
      });
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Gagal reset password.'));
      }

      setPasswordDrafts((prev) => ({ ...prev, [username]: '' }));
      toast({
        title: 'Password dikemaskini',
        description: `Password untuk ${username} berjaya ditukar.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Reset password gagal',
        description: (error as Error).message,
      });
    }
  };

  const handleDeleteUser = async (username: string) => {
    const confirmed = window.confirm(`Padam akaun ${username}?`);
    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || 'Gagal padam user.'));
      }

      setUsers((prev) => prev.filter((item) => item.username !== username));
      toast({
        title: 'User dipadam',
        description: `Akaun ${username} telah dipadam.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Padam user gagal',
        description: (error as Error).message,
      });
    }
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-3xl font-headline">Manage User Accounts</CardTitle>
                <CardDescription>
                  Cipta akaun login baru, tetapkan role `admin` atau `user`, reset password, dan padam akaun.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Tambah User Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="new-username">Username</Label>
                <Input
                  id="new-username"
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Contoh: operator1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Masukkan password"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(value: UserRole) => setForm((prev) => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="user">user</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSaving ? 'Menyimpan...' : 'Tambah User'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Senarai Akaun</CardTitle>
                <CardDescription>
                  Admin semasa: {sessionUser?.username || '-'}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => loadUsers(false)} disabled={isRefreshing}>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading users...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tarikh Cipta</TableHead>
                    <TableHead>Password Baru</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.role === 'admin' ? 'destructive' : 'secondary'}>{item.role}</Badge>
                          <Select value={item.role} onValueChange={(value: UserRole) => handleRoleChange(item.username, value)}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">admin</SelectItem>
                              <SelectItem value="user">user</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleString('ms-MY')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="password"
                            value={passwordDrafts[item.username] || ''}
                            onChange={(e) => setPasswordDrafts((prev) => ({ ...prev, [item.username]: e.target.value }))}
                            placeholder="Reset password"
                          />
                          <Button variant="outline" onClick={() => handlePasswordReset(item.username)}>
                            Reset
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(item.username)}
                          disabled={item.username === sessionUser?.username}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Padam
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </AuthGuard>
  );
}