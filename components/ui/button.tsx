import { cn } from "@/lib/cn";
import type { ComponentPropsWithRef } from "react";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  /** primary = berry (transactional only, per palette rule 2) */
  variant?: "primary" | "secondary" | "ghost";
  /** sm is 44px — reserved for dense admin UI; customer flows use md/lg (≥48px) */
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

const variantClasses = {
  primary: "bg-berry text-porcelain hover:bg-berry-deep active:bg-berry-deep",
  secondary: "bg-blush text-berry hover:bg-berry/15 active:bg-berry/20",
  ghost: "bg-transparent text-berry hover:bg-blush active:bg-blush",
} as const;

const sizeClasses = {
  sm: "h-11 gap-1.5 px-4 text-small",
  md: "h-12 gap-2 px-5",
  lg: "h-14 gap-2 px-6",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "text-body inline-flex items-center justify-center rounded-md font-semibold transition duration-150 select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="rounded-pill size-4 animate-spin border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
