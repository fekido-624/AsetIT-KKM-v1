import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayoutClient from '@/components/dashboard-layout-client';
import { parseSessionToken, SESSION_COOKIE } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  const sessionUser = parseSessionToken(sessionToken);

  if (!sessionUser) {
    redirect('/');
  }

  return (
    <DashboardLayoutClient>{children}</DashboardLayoutClient>
  );
}
