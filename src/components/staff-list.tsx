"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Staff } from "@/lib/types";
import { StaffCard } from "./staff-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStaffAssetSummary } from "@/lib/asset-status";
import { getCanonicalCawanganList, normalizeCawangan } from "@/lib/cawangan-utils";

interface StaffListProps {
  staffList: Staff[];
}

const ALLOWED_STATUS_FILTERS = new Set(["all", "complete", "incomplete", "no-asset"]);
const STATUS_FILTER_LABELS: Record<string, string> = {
  all: "Semua",
  complete: "Aset Lengkap",
  incomplete: "Aset Tak Lengkap",
  "no-asset": "Tiada Aset",
};

function normalizeStatus(value: string | null): string {
  const raw = String(value || "all").trim();
  return ALLOWED_STATUS_FILTERS.has(raw) ? raw : "all";
}

export function StaffList({ staffList }: StaffListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState(() => String(searchParams.get("q") || ""));
  const [statusFilter, setStatusFilter] = useState(() => normalizeStatus(searchParams.get("status")));
  const [cawanganFilter, setCawanganFilter] = useState("all");

  const canonicalCawanganList = useMemo(
    () => getCanonicalCawanganList(staffList.map((s) => s.Cawangan)),
    [staffList]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setSearch(String(searchParams.get("q") || ""));
    setStatusFilter(normalizeStatus(searchParams.get("status")));
  }, [searchParams]);

  const buildListPath = (nextSearch: string, nextStatus: string) => {
    const params = new URLSearchParams();
    const q = nextSearch.trim();
    if (q) {
      params.set("q", q);
    }
    if (nextStatus && nextStatus !== "all") {
      params.set("status", nextStatus);
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const keywordMatchedStaff = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return staffList.filter((staff) => {
      if (!keyword) {
        return true;
      }

      // Prefix match for NoPendaftaran fields (e.g., "KKM/BKKM09/R/23" matches "KKM/BKKM09/R/23/190")
      const noPendaftaranMatch = [
        staff.PC?.NoPendaftaran,
        staff.NB?.NoPendaftaran,
        staff.Printer?.NoPendaftaran,
      ].some((np) => np?.toLowerCase().startsWith(keyword));

      if (noPendaftaranMatch) {
        return true;
      }

      // Partial match for other fields (Nama, Emel, NoSiri, KodSewaan)
      const haystack = [
        staff.Nama,
        staff.Emel,
        staff.PC?.NoSiri,
        staff.PC?.KodSewaan,
        staff.NB?.NoSiri,
        staff.NB?.KodSewaan,
        staff.Printer?.NoSiri,
        staff.Printer?.KodSewaan,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [search, staffList]);

  const cawanganFilteredStaff = useMemo(() => {
    if (cawanganFilter === "all") return keywordMatchedStaff;
    return keywordMatchedStaff.filter(
      (staff) => normalizeCawangan(staff.Cawangan) === normalizeCawangan(cawanganFilter)
    );
  }, [keywordMatchedStaff, cawanganFilter]);

  const filteredStaff = useMemo(() => {
    if (statusFilter === "all") return cawanganFilteredStaff;

    return cawanganFilteredStaff.filter((staff) => {
      const summary = getStaffAssetSummary(staff);
      if (statusFilter === "complete") {
        return summary.totalExisting > 0 && summary.incompleteCount === 0;
      }
      if (statusFilter === "incomplete") {
        return summary.totalExisting > 0 && summary.incompleteCount > 0;
      }
      if (statusFilter === "no-asset") {
        return summary.totalExisting === 0;
      }
      return true;
    });
  }, [cawanganFilteredStaff, statusFilter]);

  if (staffList.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-16">
        <p>No staff members found for this wing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="space-y-3 pt-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Dipaparkan:</span>
            <Badge variant="secondary" className="font-medium">
              {filteredStaff.length} staf
            </Badge>
            {cawanganFilter !== "all" && (
              <>
                <span>|</span>
                <Badge variant="outline">{cawanganFilter}</Badge>
              </>
            )}
            {statusFilter !== "all" ? (
              <>
                <span>|</span>
                <Badge variant="outline">{STATUS_FILTER_LABELS[statusFilter]}</Badge>
                <span>(daripada {keywordMatchedStaff.length} hasil carian)</span>
              </>
            ) : (
              <span>(semua rekod)</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
            <div className="xl:col-span-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Nama, Email, or No Siri (PC/NB/Printer)..."
              />
            </div>
            {isMounted ? (
              <>
                <Select value={cawanganFilter} onValueChange={setCawanganFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter Cawangan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Cawangan</SelectItem>
                    {canonicalCawanganList.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="complete">Aset Lengkap</SelectItem>
                    <SelectItem value="incomplete">Aset Tak Lengkap</SelectItem>
                    <SelectItem value="no-asset">Tiada Aset</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <div className="h-10 rounded-md border border-input bg-background" aria-hidden="true" />
                <div className="h-10 rounded-md border border-input bg-background" aria-hidden="true" />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {filteredStaff.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <p>No matching staff found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredStaff.map((staff) => (
              <StaffCard
                key={staff.Emel}
                staff={staff}
                highlightTerm={search}
                detailHref={`/dashboard/staff/${encodeURIComponent(staff.Emel)}?back=${encodeURIComponent(
                  buildListPath(search, statusFilter)
                )}`}
              />
          ))}
        </div>
      )}
    </div>
  );
}
