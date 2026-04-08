"use client";

import Link from "next/link";
import { useState } from "react";
import AuthGuard from '@/components/auth-guard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Download, FileSpreadsheet, Trash2, Upload } from "lucide-react";

const CLEAR_DATA_KEYWORD = "PADAM SEMUA DATA STAF";

export default function ManageDataPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmationKeyword, setConfirmationKeyword] = useState("");
  const [isClearingData, setIsClearingData] = useState(false);
  const isKeywordMatched = confirmationKeyword.trim() === CLEAR_DATA_KEYWORD;

  const handleClearData = async () => {
    if (!isKeywordMatched) {
      toast({
        variant: "destructive",
        title: "Pengesahan gagal",
        description: "Kata kunci tidak tepat.",
      });
      return;
    }

    setIsClearingData(true);
    try {
      const res = await fetch("/api/admin/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationKeyword: confirmationKeyword.trim() }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(String(body?.message || "Gagal clear data staff."));
      }

      toast({
        title: "Clear data berjaya",
        description: `Padam ${body?.deletedStaffCount || 0} rekod staff. Akaun user kekal.`,
      });
      setConfirmationKeyword("");
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Clear data gagal",
        description: (error as Error).message,
      });
    } finally {
      setIsClearingData(false);
    }
  };

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

        <Card className="border-destructive/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-destructive" />
              <CardTitle>Clear Data Staff</CardTitle>
            </div>
            <CardDescription>
              Padam semua data staff dan rekod berkaitan. Akaun user login tidak dipadam.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog
              open={isDialogOpen}
              onOpenChange={(nextOpen) => {
                setIsDialogOpen(nextOpen);
                if (!nextOpen) {
                  setConfirmationKeyword("");
                }
              }}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Semua Data Staff
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Amaran: Tindakan Ini Tidak Boleh Diundur</AlertDialogTitle>
                  <AlertDialogDescription>
                    Untuk teruskan, taip kata kunci pengesahan dengan tepat.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Kata kunci: <span className="font-mono font-semibold">{CLEAR_DATA_KEYWORD}</span>
                  </p>
                  <Input
                    value={confirmationKeyword}
                    onChange={(e) => setConfirmationKeyword(e.target.value)}
                    placeholder="Taip kata kunci pengesahan"
                    autoComplete="off"
                  />
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isClearingData}>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(event) => {
                      event.preventDefault();
                      handleClearData();
                    }}
                    disabled={!isKeywordMatched || isClearingData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isClearingData ? "Sedang clear..." : "Ya, Padam Semua Data Staff"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </main>
    </AuthGuard>
  );
}
