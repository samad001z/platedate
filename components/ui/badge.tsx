import { cn } from "@/lib/cn";
import type { ComponentPropsWithRef } from "react";

export type BadgeProps = ComponentPropsWithRef<"span"> & {
  /**
   * tag   — dietary tags ("100% eggless", "Jain-friendly")
   * ring  — gold-ring outline (festival, "few slots") per palette rule 1
   * muted — de-emphasised ("contains nuts", closed states)
   */
  variant?: "tag" | "ring" | "muted";
};

const variantClasses = {
  tag: "bg-blush text-berry",
  ring: "border border-gold bg-transparent text-plum-ink",
  muted: "bg-plum-ink/8 text-plum-ink/60",
} as const;

export function Badge({
  variant = "tag",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "rounded-pill text-small inline-flex items-center gap-1 px-3 py-1 font-medium",
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
