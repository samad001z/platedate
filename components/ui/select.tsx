import { cn } from "@/lib/cn";
import type { ComponentPropsWithRef } from "react";

export type SelectProps = ComponentPropsWithRef<"select"> & {
  error?: boolean;
};

export function Select({
  error = false,
  className,
  children,
  ...rest
}: SelectProps) {
  return (
    <span className="relative block w-full">
      <select
        aria-invalid={error || undefined}
        className={cn(
          "border-plum-ink/20 bg-porcelain text-body text-plum-ink h-12 w-full appearance-none rounded-md border pr-10 pl-4 transition-colors",
          "disabled:bg-blush/40 disabled:pointer-events-none disabled:opacity-60",
          error && "border-berry",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        aria-hidden
        className="text-plum-ink/50 pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M5 8l5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
