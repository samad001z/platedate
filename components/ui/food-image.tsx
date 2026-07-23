import { cn } from "@/lib/cn";

export type FoodImageProps = {
  name: string;
  imageUrl: string | null;
  className?: string;
};

/** deterministic 0..n-1 from a string, so a dish always gets the same look */
function hash(str: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % mod;
}

const TINTS = ["bg-blush", "bg-cream", "bg-butter/70", "bg-berry/8"] as const;

/**
 * Real photograph when image_url exists; otherwise a branded "plated dish"
 * placeholder — a gold-rimmed plate over a warm tint, with a berry portion
 * and a small gold garnish. The tint and garnish position vary per dish so a
 * grid of placeholders reads as a set of plates, not 14 identical discs.
 * We never fake food photography for a trust-first brand.
 */
export function FoodImage({ name, imageUrl, className }: FoodImageProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  const tint = TINTS[hash(name, TINTS.length)];
  const garnish = hash(name + "g", 4); // which quadrant the garnish sits in

  return (
    <div
      aria-hidden
      className={cn(
        "flex h-full w-full items-center justify-center",
        tint,
        className,
      )}
    >
      <span className="rounded-pill border-gold bg-porcelain relative flex aspect-square w-[46%] items-center justify-center border-2 shadow-[inset_0_2px_8px_rgba(38,7,26,0.06)]">
        <span className="rounded-pill bg-berry size-[46%]" />
        <span
          className={cn(
            "rounded-pill bg-gold absolute size-[9%]",
            garnish === 0 && "top-[20%] right-[24%]",
            garnish === 1 && "top-[24%] left-[22%]",
            garnish === 2 && "right-[26%] bottom-[22%]",
            garnish === 3 && "bottom-[24%] left-[24%]",
          )}
        />
      </span>
    </div>
  );
}
