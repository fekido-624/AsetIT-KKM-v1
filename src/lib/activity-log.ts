import { mkdir, readFile, appendFile } from 'fs/promises';
import path from 'path';

export type ActivityLogAction = 'staff_created' | 'staff_updated' | 'staff_deleted' | 'staff_completed';

export type ActivityLogEntry = {
  timestamp: string;
  actor: string;
  action: ActivityLogAction;
  targetEmail: string;
  targetName?: string;
  note?: string;
};

export type ActivitySummary = {
  actor: string;
  date: string;
  totalActions: number;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
  completedCount: number;
  entries: ActivityLogEntry[];
};

function getLogFilePath() {
  return path.join(process.cwd(), 'data', 'activity-log.jsonl');
}

function getLocalDayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function appendActivityLog(entry: ActivityLogEntry) {
  const filePath = getLogFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(entry)}\n`, 'utf8');
}

async function readAllActivityLogs(): Promise<ActivityLogEntry[]> {
  const filePath = getLogFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const rows = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as ActivityLogEntry;
        } catch {
          return null;
        }
      })
      .filter((entry): entry is ActivityLogEntry => Boolean(entry));

    return rows;
  } catch {
    return [];
  }
}

export async function getTodayActivitySummary(actor: string, limit = 150): Promise<ActivitySummary> {
  const logs = await readAllActivityLogs();
  const { start, end } = getLocalDayRange();

  const todayLogs = logs
    .filter((entry) => {
      if (entry.actor !== actor) {
        return false;
      }

      const date = new Date(entry.timestamp);
      return date >= start && date < end;
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const visibleEntries = todayLogs.slice(0, limit);
  const completedTargets = new Set(todayLogs.filter((e) => e.action === 'staff_completed').map((e) => e.targetEmail));

  return {
    actor,
    date: start.toISOString().slice(0, 10),
    totalActions: todayLogs.length,
    createdCount: todayLogs.filter((e) => e.action === 'staff_created').length,
    updatedCount: todayLogs.filter((e) => e.action === 'staff_updated').length,
    deletedCount: todayLogs.filter((e) => e.action === 'staff_deleted').length,
    completedCount: completedTargets.size,
    entries: visibleEntries,
  };
}
