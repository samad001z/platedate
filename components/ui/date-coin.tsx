import { cn } from "@/lib/cn";
import { coinParts, longDate } from "@/lib/dates";

export type DateCoinProps = {
  dateISO: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-11",
  md: "size-14",
  lg: "size-20",
} as const;

/**
 * The signature element: the logo's berry disc + gold ring carrying a date.
 * The tiny day/month labels are the design system's sole all-caps exception.
 */
export function DateCoin({ dateISO, size = "md", className }: DateCoinProps) {
  const { weekday, day, month } = coinParts(dateISO);
  return (
    <span
      role="img"
      aria-label={longDate(dateISO)}
      className={cn(
        "rounded-pill border-gold bg-berry text-porcelain inline-flex shrink-0 flex-col items-center justify-center border leading-none select-none",
        sizeClasses[size],
        className,
      )}
    >
      <span
        className={cn(
          "font-semibold tracking-widest uppercase opacity-85",
          size === "lg" ? "text-[0.6rem]" : "text-[0.5rem]",
        )}
      >
        {weekday}
      </span>
      <span
        className={cn(
          "font-display font-bold",
          size === "sm" && "text-[1.05rem]",
          size === "md" && "text-[1.35rem]",
          size === "lg" && "text-[2rem]",
        )}
      >
        {day}
      </span>
      {size !== "sm" && (
        <span
          className={cn(
            "font-semibold tracking-widest uppercase opacity-85",
            size === "lg" ? "text-[0.6rem]" : "text-[0.5rem]",
          )}
        >
          {month}
        </span>
      )}
    </span>
  );
}
