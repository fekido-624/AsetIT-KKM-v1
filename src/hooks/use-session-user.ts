'use client';

import { useEffect, useState } from 'react';
import type { SessionUser } from '@/lib/types';

type SessionState = {
  user: SessionUser | null;
  isLoading: boolean;
};

export function useSessionUser(): SessionState {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!isMounted) {
          return;
        }

        if (!res.ok) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const body = await res.json();
        setUser(body?.user || null);
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();
    return () => {
      isMounted = false;
    };
  }, []);

  return { user, isLoading };
}