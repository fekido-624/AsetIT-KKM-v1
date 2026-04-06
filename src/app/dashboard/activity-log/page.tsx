'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Pencil, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { ActivityLogAction } from '@/lib/activity-log';

type ActivityLogEntry = {
  timestamp: string;
  actor: string;
  action: ActivityLogAction;
  targetEmail: string;
  targetName?: string;
  note?: string;
};

type ActivitySummary = {
  actor: string;
  date: string;
  totalActions: number;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
  completedCount: number;
  entries: ActivityLogEntry[];
};

const ACTION_LABEL: Record<ActivityLogAction, string> = {
  staff_created: 'Tambah Staff',
  staff_updated: 'Kemaskini Staff',
  staff_deleted: 'Padam Staff',
  staff_completed: 'Staff Siap',
};

function formatTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ActivityLogPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);

  const loadSummary = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetch('/api/activity-log/today', { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok || !body?.ok) {
        throw new Error(String(body?.message || 'Gagal ambil log aktiviti hari ini.'));
      }
      setSummary(body.summary);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Log aktiviti gagal dimuatkan',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSummary(false);
  }, []);

  const statCards = useMemo(() => {
    return [
      {
        title: 'Staff Siap Hari Ini',
        value: summary?.completedCount ?? 0,
        icon: CheckCircle2,
      },
      {
        title: 'Tambah Staff',
        value: summary?.createdCount ?? 0,
        icon: UserPlus,
      },
      {
        title: 'Kemaskini Staff',
        value: summary?.updatedCount ?? 0,
        icon: Pencil,
      },
      {
        title: 'Padam Staff',
        value: summary?.deletedCount ?? 0,
        icon: Trash2,
      },
    ];
  }, [summary]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 md:p-8">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl font-headline">Log Aktiviti Hari Ini</CardTitle>
                <CardDescription>
                  Rekod tindakan anda hari ini dan ringkasan berapa staff telah disiapkan.
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => loadSummary(true)} disabled={isRefreshing || isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {summary ? (
            <p>
              User: <span className="font-medium text-foreground">{summary.actor}</span> | Tarikh: {summary.date} |
              Jumlah Aktiviti: <span className="font-medium text-foreground"> {summary.totalActions}</span>
            </p>
          ) : (
            <p>Sedang memuatkan ringkasan...</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader className="pb-2">
                <CardDescription>{item.title}</CardDescription>
                <CardTitle className="text-2xl">{item.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <Icon className="h-5 w-5 text-primary" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Senarai Aktiviti</CardTitle>
          <CardDescription>Aktiviti terbaru berada di atas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Memuatkan...</p> : null}
          {!isLoading && summary && summary.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tiada aktiviti direkodkan setakat ini.</p>
          ) : null}

          {!isLoading && summary?.entries.map((entry) => (
            <div
              key={`${entry.timestamp}-${entry.action}-${entry.targetEmail}`}
              className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">{formatTime(entry.timestamp)}</Badge>
                <Badge>{ACTION_LABEL[entry.action]}</Badge>
                <span className="font-medium text-foreground">{entry.targetName || entry.targetEmail}</span>
                <span className="text-muted-foreground">({entry.targetEmail})</span>
              </div>
              {entry.note ? <p className="mt-1 text-xs text-muted-foreground">{entry.note}</p> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
