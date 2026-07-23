import { Logo } from "@/components/ui/logo";
import Link from "next/link";

/** slim header for sub-pages (checkout, order confirmation, party, festival) */
export function PageHeader({ label }: { label?: string }) {
  return (
    <header className="px-gutter sticky top-0 z-40 pt-3">
      <div className="rounded-pill border-plum-ink/8 bg-porcelain/90 shadow-card mx-auto flex h-16 max-w-6xl items-center justify-between border px-3 backdrop-blur">
        <Link href="/" className="rounded-pill flex items-center gap-2.5">
          <Logo className="size-11" priority />
          <span className="flex flex-col justify-center leading-none">
            <span className="font-display text-[1.15rem] font-bold tracking-tight">
              plate date
            </span>
            <span className="text-plum-ink/45 mt-1 text-[0.62rem] font-semibold tracking-[0.18em] uppercase">
              by Rhea Jaitha
            </span>
          </span>
        </Link>
        {label && (
          <span className="text-small text-plum-ink/60 pr-2 font-semibold">
            {label}
          </span>
        )}
      </div>
    </header>
  );
}
