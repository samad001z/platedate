/**
 * All date logic is anchored to Asia/Kolkata and works on ISO strings
 * (yyyy-mm-dd) so server and client agree regardless of device timezone.
 */

export function todayISTISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** whole days from `fromISO` to `toISO` (positive when toISO is later) */
export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round(
    (Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) /
      86_400_000,
  );
}

const asUTC = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** "Sat", "26", "Jul" — for the Date Coin */
export function coinParts(iso: string): {
  weekday: string;
  day: string;
  month: string;
} {
  const d = asUTC(iso);
  return {
    weekday: d.toLocaleDateString("en-IN", {
      weekday: "short",
      timeZone: "UTC",
    }),
    day: String(d.getUTCDate()),
    month: d.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
  };
}

/** "Sat 26 Jul" */
export function shortDate(iso: string): string {
  const p = coinParts(iso);
  return `${p.weekday} ${p.day} ${p.month}`;
}

/** "Saturday 26 July" — for aria labels */
export function longDate(iso: string): string {
  const d = asUTC(iso);
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/** "September 2026" */
export function monthLabel(year: number, monthIndex: number): string {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function isoOf(year: number, monthIndex: number, day: number): string {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
}

/** Sunday-first month grid; null = cell outside the month */
export function buildMonthGrid(
  year: number,
  monthIndex: number,
): (string | null)[][] {
  const firstDow = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      isoOf(year, monthIndex, i + 1),
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
