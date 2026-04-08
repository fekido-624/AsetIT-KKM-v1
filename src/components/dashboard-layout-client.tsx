'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Activity, Building, Database, LogOut, Shield, Users } from 'lucide-react';
import { useSessionUser } from '@/hooks/use-session-user';

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSessionUser();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setIsLoggingOut(false);
      router.replace('/');
      router.refresh();
    }
  };

  if (!isMounted) {
    return <div className="min-h-dvh bg-background">{children}</div>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <AppLogo className="h-8 w-8 text-sidebar-foreground" />
            <span className="font-headline text-lg font-semibold">AsetIT KKM</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="py-2">
          <SidebarMenu className="gap-1 px-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={() => router.push('/dashboard')}
                isActive={pathname === '/dashboard'}
                tooltip={{ children: 'All Staff' }}
                className="h-14 text-base md:h-10 md:text-sm"
              >
                <Users className="!h-6 !w-6 md:!h-4 md:!w-4" />
                <span>All Staff</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {[1, 2, 3, 4].map((wing) => (
              <SidebarMenuItem key={`test-${wing}`}>
                <SidebarMenuButton
                  size="lg"
                  onClick={() => router.push(`/dashboard/wings/${wing}-test`)}
                  isActive={pathname === `/dashboard/wings/${wing}-test`}
                  tooltip={{ children: `Wing ${wing}` }}
                  className="h-14 text-base md:h-10 md:text-sm"
                >
                  <Building className="!h-6 !w-6 md:!h-4 md:!w-4" />
                  <span>Wing {wing}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                onClick={() => router.push('/dashboard/activity-log')}
                isActive={pathname === '/dashboard/activity-log'}
                tooltip={{ children: 'Log Aktiviti' }}
                className="h-14 text-base md:h-10 md:text-sm"
              >
                <Activity className="!h-6 !w-6 md:!h-4 md:!w-4" />
                <span>Log Aktiviti</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {user?.role === 'admin' ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  onClick={() => router.push('/dashboard/manage-data')}
                  isActive={
                    pathname === '/dashboard/manage-data' ||
                    pathname === '/dashboard/bulk-upload' ||
                    pathname === '/dashboard/export-data'
                  }
                  tooltip={{ children: 'Manage Data' }}
                  className="h-14 text-base md:h-10 md:text-sm"
                >
                  <Database className="!h-6 !w-6 md:!h-4 md:!w-4" />
                  <span>Manage Data</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
            {user?.role === 'admin' ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  onClick={() => router.push('/dashboard/manage-users')}
                  isActive={pathname === '/dashboard/manage-users'}
                  tooltip={{ children: 'Manage Users' }}
                  className="h-14 text-base md:h-10 md:text-sm"
                >
                  <Shield className="!h-6 !w-6 md:!h-4 md:!w-4" />
                  <span>Manage Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-14 px-4 text-base md:h-10 md:text-sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-6 w-6 md:h-4 md:w-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
          <span className="font-headline font-semibold">AsetIT KKM</span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
