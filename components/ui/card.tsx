import { cn } from "@/lib/cn";
import type { ComponentPropsWithRef } from "react";

export type CardProps = ComponentPropsWithRef<"div"> & {
  padded?: boolean;
};

export function Card({
  padded = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "border-plum-ink/8 bg-porcelain shadow-card rounded-lg border",
        padded && "p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
