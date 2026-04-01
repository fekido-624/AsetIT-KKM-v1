import prisma from '@/lib/prisma';
import { ensureDefaultAdmin, hashPassword, normalizeRole } from '@/lib/auth';
import type { ManagedUser, UserRole } from '@/lib/types';

function toManagedUser(row: {
  id: number;
  username: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}): ManagedUser {
  return {
    id: row.id,
    username: row.username,
    role: normalizeRole(row.role),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getManagedUsers(): Promise<ManagedUser[]> {
  await ensureDefaultAdmin();
  const rows = await prisma.user.findMany({ orderBy: [{ role: 'asc' }, { username: 'asc' }] });
  return rows.map(toManagedUser);
}

export async function findUserForLogin(username: string) {
  await ensureDefaultAdmin();
  return prisma.user.findUnique({ where: { username } });
}

export async function createManagedUser(data: { username: string; password: string; role: UserRole }) {
  const username = data.username.trim();
  const password = data.password.trim();
  if (!username || !password) {
    throw new Error('Username dan password diperlukan.');
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw new Error('Username sudah digunakan.');
  }

  const created = await prisma.user.create({
    data: {
      username,
      passwordHash: hashPassword(password),
      role: data.role,
    },
  });

  return toManagedUser(created);
}

export async function updateManagedUser(
  username: string,
  data: { role?: UserRole; password?: string },
  actorUsername: string,
) {
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    throw new Error('User tidak dijumpai.');
  }

  const nextRole = data.role ? normalizeRole(data.role) : normalizeRole(target.role);
  if (target.username === actorUsername && nextRole !== 'admin') {
    throw new Error('Admin semasa tidak boleh tukar role sendiri kepada user.');
  }

  if (target.role === 'admin' && nextRole !== 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      throw new Error('Mesti ada sekurang-kurangnya seorang admin.');
    }
  }

  const updateData: { role?: UserRole; passwordHash?: string } = {};
  if (data.role) {
    updateData.role = nextRole;
  }
  if (data.password && data.password.trim()) {
    updateData.passwordHash = hashPassword(data.password.trim());
  }

  const updated = await prisma.user.update({
    where: { username },
    data: updateData,
  });

  return toManagedUser(updated);
}

export async function deleteManagedUser(username: string, actorUsername: string) {
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) {
    throw new Error('User tidak dijumpai.');
  }

  if (target.username === actorUsername) {
    throw new Error('Anda tidak boleh padam akaun sendiri.');
  }

  if (target.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      throw new Error('Mesti ada sekurang-kurangnya seorang admin.');
    }
  }

  await prisma.user.delete({ where: { username } });
}