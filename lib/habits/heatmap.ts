export type HeatmapEntry = {
  date: string;
  level: number;
  status?: string;
};

export type HeatmapCell = {
  level: 0 | 1 | 2 | 3 | 4;
  off: boolean;
  skip: boolean;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isoLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildHeatmapCells(
  days: number,
  heatmap: HeatmapEntry[],
  activeWeekdays?: number[],
): HeatmapCell[] {
  const byDate = new Map(heatmap.map((entry) => [entry.date, entry]));
  const today = startOfDay(new Date());
  const first = new Date(today);
  first.setDate(first.getDate() - (days - 1));

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(first);
    date.setDate(first.getDate() + i);
    const weekday = date.getDay();
    const off = Boolean(activeWeekdays && !activeWeekdays.includes(weekday));
    const iso = isoLocal(date);
    const entry = byDate.get(iso);
    const status = entry?.status;
    const skip = status === "SKIPPED";
    let level = skip ? 0 : Math.max(0, Math.min(4, entry?.level ?? 0));
    if (
      !skip &&
      entry &&
      level === 0 &&
      (status === "DONE" || status === "PARTIAL")
    ) {
      level = status === "PARTIAL" ? 2 : 3;
    }

    return {
      level: level as HeatmapCell["level"],
      off,
      skip,
    };
  });
}
