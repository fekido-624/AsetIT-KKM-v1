import Link from "next/link";
import AuthGuard from '@/components/auth-guard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, Upload } from "lucide-react";

export default function ManageDataPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
    <main className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Manage Data</CardTitle>
          <CardDescription>
            Urus data staf melalui import pukal atau export laporan Excel dari database.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Upload className="w-7 h-7 text-primary" />
              <CardTitle>Bulk Upload</CardTitle>
            </div>
            <CardDescription>
              Import rekod staf dan aset secara pukal menggunakan template Excel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/bulk-upload">Open Bulk Upload</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-7 h-7 text-primary" />
              <CardTitle>Export Data</CardTitle>
            </div>
            <CardDescription>
              Export semua staf atau staf mengikut Wing kepada fail Excel (.xlsx).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/export-data"><Download className="mr-2 h-4 w-4" />Open Export Data</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
    </AuthGuard>
  );
}
