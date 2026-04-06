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

  const [search, setSearch] = useState(() => String(searchParams.get("q") || ""));
  const [statusFilter, setStatusFilter] = useState(() => normalizeStatus(searchParams.get("status")));

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

      const haystack = [
        staff.Nama,
        staff.Emel,
        staff.PC?.NoSiri,
        staff.PC?.NoPendaftaran,
        staff.PC?.KodSewaan,
        staff.NB?.NoSiri,
        staff.NB?.NoPendaftaran,
        staff.NB?.KodSewaan,
        staff.Printer?.NoSiri,
        staff.Printer?.NoPendaftaran,
        staff.Printer?.KodSewaan,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [search, staffList]);

  const filteredStaff = useMemo(() => {
    if (statusFilter === "all") return keywordMatchedStaff;

    return keywordMatchedStaff.filter((staff) => {
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
  }, [keywordMatchedStaff, statusFilter]);

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
            {statusFilter !== "all" ? (
              <>
                <span>untuk filter</span>
                <Badge variant="outline">{STATUS_FILTER_LABELS[statusFilter]}</Badge>
                <span>(daripada {keywordMatchedStaff.length} hasil carian)</span>
              </>
            ) : (
              <span>(semua rekod)</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Nama, Email, or No Siri (PC/NB/Printer)..."
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="complete">Aset Lengkap</SelectItem>
                <SelectItem value="incomplete">Aset Tak Lengkap</SelectItem>
                <SelectItem value="no-asset">Tiada Aset</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredStaff.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <p>No matching staff found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
