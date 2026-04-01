'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/lib/types';
import { useSessionUser } from '@/hooks/use-session-user';

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: UserRole[] }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const { user, isLoading } = useSessionUser();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/');
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace('/dashboard');
      return;
    }

    setIsAuth(true);
  }, [allowedRoles, isLoading, router, user]);

  useEffect(() => {
    if (isLoading) {
      setIsAuth(false);
      return;
    }

    if (user && (!allowedRoles || allowedRoles.includes(user.role))) {
      setIsAuth(true);
    }
  }, [allowedRoles, isLoading, user]);

  if (isLoading || !isAuth) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return <>{children}</>;
}
