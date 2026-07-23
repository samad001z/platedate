import { cn } from "@/lib/cn";
import type { ComponentPropsWithRef } from "react";

export type TextareaProps = ComponentPropsWithRef<"textarea"> & {
  error?: boolean;
};

export function Textarea({ error = false, className, ...rest }: TextareaProps) {
  return (
    <textarea
      aria-invalid={error || undefined}
      className={cn(
        "border-plum-ink/20 bg-porcelain text-body text-plum-ink placeholder:text-plum-ink/40 min-h-28 w-full rounded-md border px-4 py-3 transition-colors",
        "disabled:bg-blush/40 disabled:pointer-events-none disabled:opacity-60",
        error && "border-berry",
        className,
      )}
      {...rest}
    />
  );
}
