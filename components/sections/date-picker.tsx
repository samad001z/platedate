"use client";

import { cn } from "@/lib/cn";
import {
  addDaysISO,
  buildMonthGrid,
  daysBetween,
  isoOf,
  longDate,
  monthLabel,
  shortDate,
} from "@/lib/dates";
import type { AvailabilityMap, FestivalLite } from "@/types/home";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Badge } from "@/components/ui";

export type DatePickerProps = {
  todayISO: string;
  /** inclusive last date we have availability for */
  maxISO: string;
  availability: AvailabilityMap;
  festivals: FestivalLite[];
  minLeadHours: number;
  selected: string | null;
  onSelect: (iso: string) => void;
};

type DayState =
  "past" | "tooSoon" | "closed" | "full" | "filling" | "available";

const WEEKDAYS = [
  ["Su", "Sunday"],
  ["Mo", "Monday"],
  ["Tu", "Tuesday"],
  ["We", "Wednesday"],
  ["Th", "Thursday"],
  ["Fr", "Friday"],
  ["Sa", "Saturday"],
] as const;

export function DatePicker({
  todayISO,
  maxISO,
  availability,
  festivals,
  minLeadHours,
  selected,
  onSelect,
}: DatePickerProps) {
  const noticeDays = Math.ceil(minLeadHours / 24);

  const stateOf = (iso: string): DayState => {
    const ahead = daysBetween(todayISO, iso);
    if (ahead < 0) return "past";
    if (ahead * 24 < minLeadHours) return "tooSoon";
    const a = availability[iso];
    if (!a) return "available";
    if (a.isBlackout) return "closed";
    const remaining = a.maxOrders - a.ordersBooked;
    if (remaining <= 0) return "full";
    if (remaining <= 2) return "filling";
    return "available";
  };

  const remainingOf = (iso: string): number | null => {
    const a = availability[iso];
    return a ? a.maxOrders - a.ordersBooked : null;
  };

  const festivalOf = (iso: string): FestivalLite | undefined =>
    festivals.find((f) => iso >= f.startsOn && iso <= f.endsOn);

  const stateText = (iso: string): string => {
    switch (stateOf(iso)) {
      case "past":
        return "already past";
      case "tooSoon":
        return `too soon, Rhea needs at least ${minLeadHours} hours' notice`;
      case "closed":
        return "the kitchen is closed that day";
      case "full":
        return "fully booked";
      case "filling": {
        const r = remainingOf(iso);
        return r === 1 ? "1 slot left" : `filling up, ${r} slots left`;
      }
      case "available":
        return "open";
    }
  };

  const firstSelectable = useMemo(() => {
    for (let i = 0; i <= daysBetween(todayISO, maxISO); i++) {
      const iso = addDaysISO(todayISO, i);
      const s = stateOf(iso);
      if (s === "available" || s === "filling") return iso;
    }
    return todayISO;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayISO, maxISO]);

  const [view, setView] = useState(() => ({
    year: Number(todayISO.slice(0, 4)),
    month: Number(todayISO.slice(5, 7)) - 1,
  }));
  const [focusedISO, setFocusedISO] = useState(firstSelectable);
  const [detail, setDetail] = useState<string>(
    "Tap a date to see what Rhea can make in time for it.",
  );
  const cellRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingFocus = useRef(false);

  useEffect(() => {
    if (pendingFocus.current) {
      cellRefs.current.get(focusedISO)?.focus();
      pendingFocus.current = false;
    }
  }, [focusedISO, view]);

  const todayY = Number(todayISO.slice(0, 4));
  const todayM = Number(todayISO.slice(5, 7)) - 1;
  const maxY = Number(maxISO.slice(0, 4));
  const maxM = Number(maxISO.slice(5, 7)) - 1;
  const monthIndex = (y: number, m: number) => y * 12 + m;
  const atMinMonth =
    monthIndex(view.year, view.month) <= monthIndex(todayY, todayM);
  const atMaxMonth =
    monthIndex(view.year, view.month) >= monthIndex(maxY, maxM);

  function shiftMonth(delta: number) {
    setView((v) => {
      const idx = Math.min(
        Math.max(
          monthIndex(v.year, v.month) + delta,
          monthIndex(todayY, todayM),
        ),
        monthIndex(maxY, maxM),
      );
      return { year: Math.floor(idx / 12), month: idx % 12 };
    });
  }

  function clampISO(iso: string): string {
    if (iso < todayISO) return todayISO;
    if (iso > maxISO) return maxISO;
    return iso;
  }

  function moveFocus(iso: string) {
    const next = clampISO(iso);
    setFocusedISO(next);
    setView({
      year: Number(next.slice(0, 4)),
      month: Number(next.slice(5, 7)) - 1,
    });
    setDetail(`${shortDate(next)}: ${stateText(next)}`);
    pendingFocus.current = true;
  }

  function trySelect(iso: string) {
    const s = stateOf(iso);
    if (s === "available" || s === "filling") {
      onSelect(iso);
      setDetail(`${shortDate(iso)} selected. The menu below shows what fits.`);
    } else {
      setDetail(`${shortDate(iso)} is not available: ${stateText(iso)}.`);
    }
  }

  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const handlers: Record<string, () => void> = {
      ArrowRight: () => moveFocus(addDaysISO(focusedISO, 1)),
      ArrowLeft: () => moveFocus(addDaysISO(focusedISO, -1)),
      ArrowDown: () => moveFocus(addDaysISO(focusedISO, 7)),
      ArrowUp: () => moveFocus(addDaysISO(focusedISO, -7)),
      Home: () =>
        moveFocus(
          addDaysISO(
            focusedISO,
            -new Date(`${focusedISO}T00:00:00Z`).getUTCDay(),
          ),
        ),
      End: () =>
        moveFocus(
          addDaysISO(
            focusedISO,
            6 - new Date(`${focusedISO}T00:00:00Z`).getUTCDay(),
          ),
        ),
      PageDown: () => moveFocus(addDaysISO(focusedISO, 30)),
      PageUp: () => moveFocus(addDaysISO(focusedISO, -30)),
      Enter: () => trySelect(focusedISO),
      " ": () => trySelect(focusedISO),
    };
    const handler = handlers[e.key];
    if (handler) {
      e.preventDefault();
      handler();
    }
  }

  const weeks = buildMonthGrid(view.year, view.month);
  const monthStart = isoOf(view.year, view.month, 1);
  const monthEnd = isoOf(view.year, view.month + 1, 0);
  const viewFestivals = festivals.filter(
    (f) => f.startsOn <= monthEnd && f.endsOn >= monthStart,
  );

  return (
    <div className="border-plum-ink/10 bg-porcelain shadow-card rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={atMinMonth}
          onClick={() => shiftMonth(-1)}
          className="rounded-pill text-plum-ink hover:bg-blush flex size-11 items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-30"
        >
          <svg aria-hidden className="size-5" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <p aria-live="polite" className="font-display text-heading">
          {monthLabel(view.year, view.month)}
        </p>
        <button
          type="button"
          aria-label="Next month"
          disabled={atMaxMonth}
          onClick={() => shiftMonth(1)}
          className="rounded-pill text-plum-ink hover:bg-blush flex size-11 items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-30"
        >
          <svg aria-hidden className="size-5" viewBox="0 0 20 20" fill="none">
            <path
              d="M8 4l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {viewFestivals.map((f) => (
        <Link
          key={f.slug}
          href={`/festival/${f.slug}`}
          className="text-small text-plum-ink/80 hover:text-plum-ink mb-2 flex flex-wrap items-center gap-2 rounded-md"
        >
          <Badge variant="ring">{f.name}</Badge>
          <span>
            {shortDate(f.startsOn)} to {shortDate(f.endsOn)}, see the menu
          </span>
        </Link>
      ))}

      <div
        role="grid"
        aria-label={`Delivery dates, ${monthLabel(view.year, view.month)}`}
        onKeyDown={onGridKeyDown}
      >
        <div role="row" className="grid grid-cols-7">
          {WEEKDAYS.map(([short, full]) => (
            <div
              key={full}
              role="columnheader"
              aria-label={full}
              className="text-small text-plum-ink/50 py-1.5 text-center font-semibold"
            >
              {short}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div role="row" key={wi} className="grid grid-cols-7">
            {week.map((iso, di) => {
              if (!iso) {
                return (
                  <div
                    key={di}
                    role="gridcell"
                    aria-hidden="true"
                    className="size-11"
                  />
                );
              }
              const st = stateOf(iso);
              const selectable = st === "available" || st === "filling";
              const isSelected = selected === iso;
              const fest = festivalOf(iso);
              const isToday = iso === todayISO;
              const label = [
                longDate(iso),
                isToday ? "today" : null,
                stateText(iso),
                fest ? fest.name : null,
                isSelected ? "selected" : null,
              ]
                .filter(Boolean)
                .join(", ");
              return (
                <div key={iso} className="flex justify-center py-0.5">
                  <div
                    role="gridcell"
                    ref={(el) => {
                      if (el) cellRefs.current.set(iso, el);
                      else cellRefs.current.delete(iso);
                    }}
                    tabIndex={iso === focusedISO ? 0 : -1}
                    aria-selected={isSelected}
                    aria-disabled={!selectable || undefined}
                    aria-label={label}
                    onClick={() => {
                      setFocusedISO(iso);
                      trySelect(iso);
                    }}
                    onFocus={() => setFocusedISO(iso)}
                    className={cn(
                      "rounded-pill text-body relative flex size-11 items-center justify-center tabular-nums transition-colors",
                      selectable && "hover:bg-blush cursor-pointer",
                      isSelected &&
                        "pop-in bg-berry text-porcelain hover:bg-berry font-semibold",
                      st === "full" && "text-plum-ink/35 line-through",
                      st === "closed" &&
                        "text-plum-ink/35 underline decoration-dotted underline-offset-4",
                      (st === "past" || st === "tooSoon") && "text-plum-ink/25",
                      fest && "border-gold border",
                      isToday &&
                        !isSelected &&
                        "decoration-plum-ink/40 font-semibold underline underline-offset-4",
                    )}
                  >
                    {Number(iso.slice(8, 10))}
                    {st === "filling" && !isSelected && (
                      <span
                        aria-hidden
                        className="rounded-pill bg-plum-ink/60 absolute bottom-1 size-1"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p
        aria-live="polite"
        className="text-small text-plum-ink/70 mt-2 min-h-11"
      >
        {detail}
      </p>

      <ul className="text-small text-plum-ink/50 mt-1 flex flex-wrap gap-x-4 gap-y-1">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="rounded-pill bg-plum-ink/60 size-1" />
          almost full
        </li>
        <li>
          <s>26</s> full
        </li>
        <li>
          <span className="underline decoration-dotted underline-offset-4">
            26
          </span>{" "}
          closed
        </li>
        <li>
          <span className="text-plum-ink/30">26</span> too soon ({noticeDays}{" "}
          {noticeDays === 1 ? "day" : "days"} min)
        </li>
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="rounded-pill border-gold inline-block size-3 border"
          />
          festival day
        </li>
      </ul>
    </div>
  );
}
