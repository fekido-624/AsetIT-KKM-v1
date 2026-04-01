import { getAllStaffForUi } from "@/lib/staff-db";
import { StaffList } from "@/components/staff-list";
import { Button } from "@/components/ui/button";
import { RoleContent } from '@/components/role-content';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const staffList = await getAllStaffForUi();
  const totalStaff = staffList.length;

  return (
    <main className="p-4 sm:p-6 md:p-8">
       <Card className="mb-8 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-primary" />
              <CardTitle className="text-3xl font-headline">All Staff Directory</CardTitle>
            </div>
            <RoleContent allowedRoles={['admin']}>
              <Button asChild>
                <Link href="/dashboard/add-staff"><UserPlus className="mr-2 h-4 w-4" />Add Staff</Link>
              </Button>
            </RoleContent>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A comprehensive list of all staff members across all wings, sorted by grade.
          </p>
          <p className="text-sm mt-2 font-medium">Total Staff: {totalStaff}</p>
        </CardContent>
      </Card>
      
      <StaffList staffList={staffList} />
    </main>
  );
}
