export const dynamic = 'force-dynamic';

import { getStaffByEmailForUi } from "@/lib/staff-db";
import { StaffDetailClient } from "@/components/staff-detail-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserX } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User as UserIcon } from "lucide-react";

interface StaffDetailPageProps {
  params: {
    email: string;
  };
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const staff = await getStaffByEmailForUi(decodeURIComponent(params.email));

  if (!staff) {
    return (
      <main className="p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-lg">
            <UserX className="h-4 w-4" />
          <AlertTitle>Staff Not Found</AlertTitle>
          <AlertDescription>
            The staff member with email "{decodeURIComponent(params.email)}" could not be found.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 md:p-8">
        <div className="mb-8">
            <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
                <UserIcon className="w-8 h-8 text-primary" /> Staff Profile
            </h1>
            <p className="text-muted-foreground mt-1">View and manage asset information for {staff.Nama}.</p>
        </div>
        <StaffDetailClient initialStaff={staff} />
    </main>
  );
}
