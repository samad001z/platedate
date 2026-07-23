import { cn } from "@/lib/cn";
import type { ComponentPropsWithRef } from "react";

export type InputProps = ComponentPropsWithRef<"input"> & {
  /** visual error state; pair with your own error message + aria-describedby */
  error?: boolean;
};

export function Input({ error = false, className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={error || undefined}
      className={cn(
        "border-plum-ink/20 bg-porcelain text-body text-plum-ink placeholder:text-plum-ink/40 h-12 w-full rounded-md border px-4 transition-colors",
        "disabled:bg-blush/40 disabled:pointer-events-none disabled:opacity-60",
        error && "border-berry",
        className,
      )}
      {...rest}
    />
  );
}
