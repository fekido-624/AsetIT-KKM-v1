'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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
} from '@/components/ui/sidebar';
import { AppLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Building, Database, LogOut, Shield, Users } from 'lucide-react';
import { useSessionUser } from '@/hooks/use-session-user';

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSessionUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <AppLogo className="h-8 w-8 text-sidebar-foreground" />
            <span className="font-headline text-lg font-semibold">AsetIT KKM</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push('/dashboard')}
                isActive={pathname === '/dashboard'}
                tooltip={{ children: 'All Staff' }}
              >
                <Users />
                <span>All Staff</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {[1, 2, 3, 4].map((wing) => (
              <SidebarMenuItem key={`test-${wing}`}>
                <SidebarMenuButton
                  onClick={() => router.push(`/dashboard/wings/${wing}-test`)}
                  isActive={pathname === `/dashboard/wings/${wing}-test`}
                  tooltip={{ children: `Wing ${wing}` }}
                >
                  <Building />
                  <span>Wing {wing}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {user?.role === 'admin' ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => router.push('/dashboard/manage-data')}
                  isActive={
                    pathname === '/dashboard/manage-data' ||
                    pathname === '/dashboard/bulk-upload' ||
                    pathname === '/dashboard/export-data'
                  }
                  tooltip={{ children: 'Manage Data' }}
                >
                  <Database />
                  <span>Manage Data</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
            {user?.role === 'admin' ? (
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => router.push('/dashboard/manage-users')}
                  isActive={pathname === '/dashboard/manage-users'}
                  tooltip={{ children: 'Manage Users' }}
                >
                  <Shield />
                  <span>Manage Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
