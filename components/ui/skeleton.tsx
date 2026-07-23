import { cn } from "@/lib/cn";
import type { ComponentPropsWithRef } from "react";

export type SkeletonProps = ComponentPropsWithRef<"div">;

/** pulse animation is disabled globally under prefers-reduced-motion */
export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("bg-blush animate-pulse rounded-md", className)}
      {...rest}
    />
  );
}
