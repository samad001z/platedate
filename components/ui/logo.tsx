import { cn } from "@/lib/cn";

export type LogoProps = {
  /** rendered pixel box; the disc is clipped to a circle */
  className?: string;
  priority?: boolean;
};

/**
 * Rhea's real Plate Date logo (berry disc, "plate" serif + "date" script +
 * heart + "by Rhea Jaitha"). Clipped to a circle so the transparent corners
 * never show on any background. This is the ONLY handwriting on the site —
 * it lives inside the logo, per the brief.
 */
export function Logo({ className, priority = false }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt="Plate Date, by Rhea Jaitha"
      width={256}
      height={256}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={cn("rounded-pill aspect-square object-cover", className)}
    />
  );
}
