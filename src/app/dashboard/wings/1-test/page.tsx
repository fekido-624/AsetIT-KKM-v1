import { getStaffByWingsForUi } from "@/lib/staff-db";
import { StaffList } from "@/components/staff-list";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building } from "lucide-react";

export default async function Wing1TestPage() {
  const staffList = await getStaffByWingsForUi(["Wing 1", "Wing 1(test)"]);
  const totalStaff = staffList.length;
  return (
    <main className="p-4 sm:p-6 md:p-8">
      <Card className="mb-8 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Building className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Wing 1 Directory</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">List of staff members in Wing 1, sorted by grade.</p>
          <p className="text-sm mt-2 font-medium">Total Staff: {totalStaff}</p>
        </CardContent>
      </Card>
      <StaffList staffList={staffList} />
    </main>
  );
}
