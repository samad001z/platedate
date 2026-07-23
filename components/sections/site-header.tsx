"use client";

import { Button, Sheet } from "@/components/ui";
import { DateCoin } from "@/components/ui/date-coin";
import { Logo } from "@/components/ui/logo";
import { useCart } from "@/lib/cart";
import { shortDate } from "@/lib/dates";
import { formatPaise } from "@/lib/money";
import { MIN_ORDER_PAISE } from "@/lib/site";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#dates", label: "Dates" },
  { href: "#story", label: "Story" },
] as const;

export function SiteHeader() {
  const router = useRouter();
  const { lines, count, subtotalPaise, deliveryDate, setQuantity, remove } =
    useCart();
  const [open, setOpen] = useState(false);

  const shortfall = MIN_ORDER_PAISE - subtotalPaise;
  const canCheckout =
    lines.length > 0 && shortfall <= 0 && deliveryDate !== null;

  return (
    <>
      <header className="px-gutter sticky top-0 z-40 pt-3">
        <div className="rounded-pill border-plum-ink/8 bg-porcelain/90 shadow-card mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 border px-3 backdrop-blur">
          <a href="#top" className="rounded-pill flex items-center gap-2.5">
            <Logo className="size-11" priority />
            <span className="flex flex-col justify-center leading-none">
              <span className="font-display text-[1.15rem] font-bold tracking-tight">
                plate date
              </span>
              <span className="text-plum-ink/45 mt-1 text-[0.62rem] font-semibold tracking-[0.18em] uppercase">
                by Rhea Jaitha
              </span>
            </span>
          </a>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-pill text-small hover:bg-blush px-3.5 py-2 font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/party"
              className="rounded-pill text-small hover:bg-blush px-3.5 py-2 font-medium transition-colors"
            >
              Party orders
            </Link>
          </nav>

          <Button className="rounded-pill" onClick={() => setOpen(true)}>
            Your order{count > 0 ? ` (${count})` : ""}
          </Button>
        </div>
      </header>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Your order"
        side="right"
      >
        {lines.length === 0 ? (
          <p className="text-body text-plum-ink/70">
            Your plate is empty. Pick a date and add something you like.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {deliveryDate ? (
              <div className="bg-blush flex items-center gap-3 rounded-md p-3">
                <DateCoin dateISO={deliveryDate} size="sm" />
                <p className="text-small">
                  Delivery on <strong>{shortDate(deliveryDate)}</strong>
                </p>
              </div>
            ) : (
              <div className="bg-blush rounded-md p-3">
                <p className="text-small">
                  Pick a delivery date before checking out.{" "}
                  <a
                    href="#dates"
                    onClick={() => setOpen(false)}
                    className="text-berry font-semibold underline underline-offset-2"
                  >
                    Choose a date
                  </a>
                </p>
              </div>
            )}

            <ul className="flex flex-col gap-4">
              {lines.map((line) => (
                <li key={line.key} className="border-plum-ink/10 border-b pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-body font-semibold">{line.name}</p>
                    <p className="text-body tabular-nums">
                      {formatPaise(line.unitPricePaise * line.quantity)}
                    </p>
                  </div>
                  <p className="text-small text-plum-ink/50">
                    {formatPaise(line.unitPricePaise)} each
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.name}`}
                        disabled={line.quantity <= line.minQuantity}
                        onClick={() => setQuantity(line.key, line.quantity - 1)}
                        className="border-plum-ink/20 hover:bg-blush flex size-11 items-center justify-center rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="text-body w-8 text-center font-semibold tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.name}`}
                        onClick={() => setQuantity(line.key, line.quantity + 1)}
                        className="border-plum-ink/20 hover:bg-blush flex size-11 items-center justify-center rounded-md border transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.key)}
                      className="text-small text-plum-ink/60 hover:text-plum-ink rounded-sm underline underline-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between">
              <span className="text-body font-semibold">Subtotal</span>
              <span className="font-display text-price tabular-nums">
                {formatPaise(subtotalPaise)}
              </span>
            </div>

            {shortfall > 0 && (
              <p className="bg-blush text-small rounded-md p-3">
                Add <strong>{formatPaise(shortfall)}</strong> more to reach the{" "}
                {formatPaise(MIN_ORDER_PAISE)} minimum order.
              </p>
            )}
            <p className="text-small text-plum-ink/60">
              Delivery fee depends on your area. You will see it at checkout.
            </p>

            <Button
              size="lg"
              className="w-full"
              disabled={!canCheckout}
              onClick={() => {
                setOpen(false);
                router.push("/checkout");
              }}
            >
              Go to checkout
            </Button>
          </div>
        )}
      </Sheet>
    </>
  );
}
