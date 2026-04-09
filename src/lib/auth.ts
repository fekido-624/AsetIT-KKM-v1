import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { SessionUser, UserRole } from '@/lib/types';

export const SESSION_COOKIE = 'asetit_session';
const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Password123!';
const SESSION_SECRET = process.env.SESSION_SECRET || 'asetit-kkm-dev-secret';

const VALID_ROLES: UserRole[] = ['admin', 'user'];

function toBase64Url(value: Buffer | string) {
  return Buffer.from(value).toString('base64url');
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function isUserRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

export function normalizeRole(role: string): UserRole {
  return isUserRole(role) ? role : 'user';
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(':');
  if (!salt || !storedHash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, 'hex');
  if (derivedHash.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedHash, storedBuffer);
}

function sign(value: string) {
  return createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
}

export function createSessionToken(user: SessionUser) {
  const payload = toBase64Url(JSON.stringify(user));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function parseSessionToken(token: string | undefined): SessionUser | null {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as Partial<SessionUser>;
    if (!parsed.username || !parsed.role || !isUserRole(parsed.role)) {
      return null;
    }
    return { username: parsed.username, role: parsed.role };
  } catch {
    return null;
  }
}

export function getSessionUser(req: NextRequest) {
  return parseSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(response: NextResponse, user: SessionUser) {
  response.cookies.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  });
}

export async function ensureDefaultAdmin() {
  const adminCount = await prisma.user.count({ where: { role: 'admin' } });
  if (adminCount > 0) {
    return;
  }

  await prisma.user.upsert({
    where: { username: DEFAULT_ADMIN_USERNAME },
    update: {
      passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      role: 'admin',
    },
    create: {
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      role: 'admin',
    },
  });
}