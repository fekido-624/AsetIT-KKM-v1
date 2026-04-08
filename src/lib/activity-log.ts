import { mkdir, readFile, appendFile, readdir, writeFile } from 'fs/promises';
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

function getArchiveDirPath() {
  return path.join(process.cwd(), 'data', 'activity-log-archive');
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

async function readLogFile(filePath: string): Promise<ActivityLogEntry[]> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return raw
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
  } catch {
    return [];
  }
}

async function getArchivedLogFilePaths() {
  const archiveDir = getArchiveDirPath();

  try {
    const names = await readdir(archiveDir);
    return names
      .filter((name) => name.endsWith('.jsonl'))
      .map((name) => path.join(archiveDir, name));
  } catch {
    return [];
  }
}

async function readAllActivityLogs(options?: { includeArchive?: boolean }): Promise<ActivityLogEntry[]> {
  const includeArchive = options?.includeArchive !== false;

  const currentLogs = await readLogFile(getLogFilePath());
  if (!includeArchive) {
    return currentLogs;
  }

  const archiveFilePaths = await getArchivedLogFilePaths();
  const archiveLogs = (
    await Promise.all(archiveFilePaths.map(async (filePath) => readLogFile(filePath)))
  ).flat();

  return [...currentLogs, ...archiveLogs];
}

export async function archiveCurrentActivityLog(actor: string) {
  const currentFilePath = getLogFilePath();
  const currentLogs = await readLogFile(currentFilePath);
  if (!currentLogs.length) {
    return null;
  }

  const archiveDir = getArchiveDirPath();
  await mkdir(archiveDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archiveName = `activity-log-archive-${stamp}.jsonl`;
  const archivePath = path.join(archiveDir, archiveName);

  await writeFile(archivePath, `${currentLogs.map((entry) => JSON.stringify(entry)).join('\n')}\n`, 'utf8');
  await writeFile(currentFilePath, '', 'utf8');

  return {
    fileName: archiveName,
    archivedCount: currentLogs.length,
    archivedBy: actor,
  };
}

export async function getArchiveAvailableDates(actor: string): Promise<string[]> {
  const logs = await readAllActivityLogs({ includeArchive: true });

  return Array.from(
    new Set(
      logs
        .filter((entry) => entry.actor === actor)
        .map((entry) => {
          const date = new Date(entry.timestamp);
          if (Number.isNaN(date.getTime())) {
            return '';
          }
          return date.toISOString().slice(0, 10);
        })
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a));
}

function getLocalDayRangeForDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function getTodayActivitySummary(actor: string, limit = 150): Promise<ActivitySummary> {
  const logs = await readAllActivityLogs({ includeArchive: false });
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

export async function getActivitySummaryByDate(actor: string, dateStr: string, limit = 150): Promise<ActivitySummary> {
  const logs = await readAllActivityLogs({ includeArchive: false });
  const { start, end } = getLocalDayRangeForDate(dateStr);

  const filteredLogs = logs
    .filter((entry) => {
      if (entry.actor !== actor) {
        return false;
      }

      const date = new Date(entry.timestamp);
      return date >= start && date < end;
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const visibleEntries = filteredLogs.slice(0, limit);
  const completedTargets = new Set(filteredLogs.filter((e) => e.action === 'staff_completed').map((e) => e.targetEmail));

  return {
    actor,
    date: dateStr,
    totalActions: filteredLogs.length,
    createdCount: filteredLogs.filter((e) => e.action === 'staff_created').length,
    updatedCount: filteredLogs.filter((e) => e.action === 'staff_updated').length,
    deletedCount: filteredLogs.filter((e) => e.action === 'staff_deleted').length,
    completedCount: completedTargets.size,
    entries: visibleEntries,
  };
}

export async function getArchivedActivitySummaryByDate(actor: string, dateStr: string, limit = 150): Promise<ActivitySummary> {
  const logs = await readAllActivityLogs({ includeArchive: true });
  const { start, end } = getLocalDayRangeForDate(dateStr);

  const filteredLogs = logs
    .filter((entry) => {
      if (entry.actor !== actor) {
        return false;
      }

      const date = new Date(entry.timestamp);
      return date >= start && date < end;
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const visibleEntries = filteredLogs.slice(0, limit);
  const completedTargets = new Set(filteredLogs.filter((e) => e.action === 'staff_completed').map((e) => e.targetEmail));

  return {
    actor,
    date: dateStr,
    totalActions: filteredLogs.length,
    createdCount: filteredLogs.filter((e) => e.action === 'staff_created').length,
    updatedCount: filteredLogs.filter((e) => e.action === 'staff_updated').length,
    deletedCount: filteredLogs.filter((e) => e.action === 'staff_deleted').length,
    completedCount: completedTargets.size,
    entries: visibleEntries,
  };
}
