import { getStaffByWing } from "@/lib/data";
import { StaffList } from "@/components/staff-list";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building } from "lucide-react";

interface WingPageProps {
  params: {
    id: string;
  };
}

export default function WingPage({ params }: WingPageProps) {
  const staffList = getStaffByWing(params.id);

  return (
    <main className="p-4 sm:p-6 md:p-8">
       <Card className="mb-8 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Building className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-headline">Wing {params.id} Directory</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            List of staff members in Wing {params.id}, sorted by grade.
          </p>
        </CardContent>
      </Card>
      
      <StaffList staffList={staffList} />
    </main>
  );
}
