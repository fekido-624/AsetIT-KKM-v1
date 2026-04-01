"use client";

import { useMemo, useState } from "react";
import type { Staff } from "@/lib/types";
import { StaffCard } from "./staff-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStaffAssetSummary } from "@/lib/asset-status";

interface StaffListProps {
  staffList: Staff[];
}

export function StaffList({ staffList }: StaffListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredStaff = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const byKeyword = staffList.filter((staff) => {
      if (!keyword) {
        return true;
      }

      const haystack = [
        staff.Nama,
        staff.Emel,
        staff.PC?.NoSiri,
        staff.NB?.NoSiri,
        staff.Printer?.NoSiri,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });

    if (statusFilter === "all") return byKeyword;

    return byKeyword.filter((staff) => {
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
  }, [search, staffList, statusFilter]);

  if (staffList.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-16">
        <p>No staff members found for this wing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

      {filteredStaff.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <p>No matching staff found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staff) => (
            <StaffCard key={staff.Emel} staff={staff} highlightTerm={search} />
          ))}
        </div>
      )}
    </div>
  );
}
