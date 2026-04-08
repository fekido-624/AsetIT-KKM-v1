'use client';
import { Fragment } from "react";
import type { Staff } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { resolveAvatarSrc } from "@/lib/avatar-utils";
import { getStaffAssetSummary } from "@/lib/asset-status";


interface StaffCardProps {
    staff: Staff;
    highlightTerm?: string;
    detailHref?: string;
}

function hasMeaningfulNote(value: string | undefined): boolean {
    const note = String(value || '').trim().toUpperCase();
    return !['', 'N/A', 'NA', '-'].includes(note);
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query?: string) {
    const q = (query || "").trim();
    if (!q) return text;

    const regex = new RegExp(`(${escapeRegExp(q)})`, "ig");
    const parts = text.split(regex);
    return parts.map((part, idx) => (
        part.toLowerCase() === q.toLowerCase() ? (
            <mark key={`${part}-${idx}`} className="bg-yellow-200 text-black px-0.5 rounded-sm">{part}</mark>
        ) : (
            <Fragment key={`${part}-${idx}`}>{part}</Fragment>
        )
    ));
}

export function StaffCard({ staff, highlightTerm, detailHref }: StaffCardProps) {
    const avatarSrc = resolveAvatarSrc(staff.Avatar);
    const summary = getStaffAssetSummary(staff);
    const href = detailHref || `/dashboard/staff/${encodeURIComponent(staff.Emel)}`;
    const notes = [
        { label: 'PC', value: staff.PC?.Catatan },
        { label: 'NB', value: staff.NB?.Catatan },
        { label: 'Printer', value: staff.Printer?.Catatan },
    ].filter((item) => hasMeaningfulNote(item.value));

    return (
        <Card className="w-full transition-all hover:shadow-lg">
            <CardHeader>
                <div className="flex items-start gap-3 md:gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary md:h-16 md:w-16">
                        <AvatarImage src={avatarSrc} alt={staff.Nama} />
                        <AvatarFallback>{staff.Nama.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-headline md:text-xl">{highlightText(staff.Nama, highlightTerm)}</CardTitle>
                            <Badge variant={staff.Gred.startsWith('JUSA') ? "destructive" : "secondary"}>{staff.Gred}</Badge>
                        </div>
                        <CardDescription className="mt-1 flex items-center gap-2 text-xs md:text-sm">
                            <Briefcase className="w-4 h-4"/> {highlightText(staff.Jawatan, highlightTerm)}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground md:text-sm">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Aset: {summary.totalExisting}/3</Badge>
                        <Badge variant={summary.incompleteCount === 0 ? "default" : "destructive"}>
                            Lengkap: {summary.completeCount}/{summary.totalExisting || 0}
                        </Badge>
                        <Badge variant="secondary">{summary.completionPercent}%</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4"/>
                        <span>{highlightText(staff.Emel, highlightTerm)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <MapPin className="w-4 h-4"/>
                        <span>{highlightText(`${staff.Cawangan} - ${staff.Wing}`, highlightTerm)}</span>
                    </div>
                    {notes.length > 0 ? (
                        <div className="pt-1 text-[11px] md:text-xs">
                            {notes.map((item) => (
                                <p key={item.label} className="truncate" title={item.value}>
                                    <span className="font-medium">{item.label}:</span> {item.value}
                                </p>
                            ))}
                        </div>
                    ) : null}
                </div>
                 <Button asChild className="mt-4 w-full text-sm md:w-auto md:text-base float-right">
                    <Link href={href}>
                        View Details <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
