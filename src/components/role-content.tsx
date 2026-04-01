'use client';

import type { ReactNode } from 'react';
import type { UserRole } from '@/lib/types';
import { useSessionUser } from '@/hooks/use-session-user';

export function RoleContent({
  allowedRoles,
  children,
  fallback = null,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user, isLoading } = useSessionUser();

  if (isLoading) {
    return null;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}