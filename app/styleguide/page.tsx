"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Input,
  Select,
  Sheet,
  Skeleton,
  Textarea,
  useToast,
} from "@/components/ui";

/* ----------------------------------------------------------------- */
/* helpers                                                           */
/* ----------------------------------------------------------------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-section">
      <h2 className="mb-stack border-plum-ink/10 text-title border-b pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** renders a token swatch and reads its computed value at runtime,
 *  so no hex ever appears in this file */
function ColorSwatch({ token, note }: { token: string; note?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("…");

  useEffect(() => {
    if (ref.current) {
      setValue(getComputedStyle(ref.current).getPropertyValue(token).trim());
    }
  }, [token]);

  return (
    <div>
      <div
        ref={ref}
        style={{ background: `var(${token})` }}
        className="border-plum-ink/10 h-16 rounded-md border"
      />
      <p className="text-small mt-1.5 font-medium">{token}</p>
      <p className="text-small text-plum-ink/60">{value}</p>
      {note && <p className="text-small text-plum-ink/60">{note}</p>}
    </div>
  );
}

function SpacingBar({ token }: { token: string }) {
  return (
    <div className="flex items-center gap-4">
      <code className="text-small text-plum-ink/70 w-40 shrink-0">{token}</code>
      <div
        className="bg-berry/20 h-4 rounded-sm"
        style={{ width: `var(${token})` }}
      />
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* page                                                              */
/* ----------------------------------------------------------------- */

export default function Styleguide() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetBottomOpen, setSheetBottomOpen] = useState(false);
  const [sheetRightOpen, setSheetRightOpen] = useState(false);

  return (
    <main className="px-gutter py-section mx-auto max-w-3xl">
      <header className="mb-section">
        <h1 className="text-hero">Plate Date styleguide</h1>
        <p className="text-body text-plum-ink/70 mt-2">
          Every token and primitive in every state. Tab through the page to see
          the gold focus ring on all interactive elements.
        </p>
      </header>

      <Section title="Colour tokens">
        <div className="gap-gutter grid grid-cols-2 sm:grid-cols-3">
          <ColorSwatch token="--color-porcelain" note="page bg, cards" />
          <ColorSwatch token="--color-plum-ink" note="all text" />
          <ColorSwatch token="--color-berry" note="money actions only" />
          <ColorSwatch token="--color-berry-deep" note="pressed berry" />
          <ColorSwatch token="--color-blush" note="tints, chips" />
          <ColorSwatch token="--color-gold" note="rings only, never fills" />
        </div>
        <Card className="mt-stack bg-blush/50">
          <ul className="text-small list-disc space-y-1 pl-5">
            <li>
              Gold is a ring, never a fill — and never text on light
              backgrounds.
            </li>
            <li>Berry appears only on elements that move an order forward.</li>
            <li>Status is always worded, never colour-only.</li>
          </ul>
        </Card>
      </Section>

      <Section title="Type scale">
        <div className="space-y-stack">
          <div>
            <code className="text-small text-plum-ink/50">
              --text-hero · Bricolage 700 · 32/38
            </code>
            <p className="font-display text-hero">When’s your plate date?</p>
          </div>
          <div>
            <code className="text-small text-plum-ink/50">
              --text-title · Bricolage 600 · 24/30
            </code>
            <p className="font-display text-title">Kolkata’s best tiramisu</p>
          </div>
          <div>
            <code className="text-small text-plum-ink/50">
              --text-heading · Bricolage 600 · 20/26
            </code>
            <p className="font-display text-heading">Savoury bakes</p>
          </div>
          <div>
            <code className="text-small text-plum-ink/50">
              --text-body · Hanken 400 · 17/26 (base)
            </code>
            <p className="text-body">
              Custom platters, cakes and desserts made to order in Ballygunge.
              100% vegetarian and eggless, with Jain-friendly options.
            </p>
          </div>
          <div>
            <code className="text-small text-plum-ink/50">
              --text-small · Hanken 400 · 15/22
            </code>
            <p className="text-small">
              Needs 2 days’ notice — earliest Mon 28 Jul.
            </p>
          </div>
          <div>
            <code className="text-small text-plum-ink/50">
              --text-price · Bricolage 600 · 20/24 · tabular-nums
            </code>
            <p className="font-display text-price tabular-nums">₹1,250</p>
          </div>
        </div>
        <p className="mt-stack text-small text-plum-ink/60">
          Headings are sentence case only. The sole all-caps exception is the
          day/month labels inside the Date Coin (Phase 4).
        </p>
      </Section>

      <Section title="Spacing steps">
        <div className="space-y-2">
          <SpacingBar token="--spacing-gutter" />
          <SpacingBar token="--spacing-stack" />
          <SpacingBar token="--spacing-section" />
          <SpacingBar token="--spacing-hero" />
        </div>
        <p className="mt-stack text-small text-plum-ink/60">
          The numeric scale (p-1, gap-2 …) derives from the base
          <code> --spacing</code> token (0.25rem).
        </p>
      </Section>

      <Section title="Radius & shadows">
        <div className="gap-gutter grid grid-cols-2 sm:grid-cols-4">
          {(["sm", "md", "lg", "pill"] as const).map((r) => (
            <div key={r} className="text-center">
              <div
                className="border-plum-ink/15 bg-blush mx-auto h-16 w-full border"
                style={{ borderRadius: `var(--radius-${r})` }}
              />
              <code className="text-small text-plum-ink/60">--radius-{r}</code>
            </div>
          ))}
        </div>
        <div className="mt-stack gap-gutter grid grid-cols-1 sm:grid-cols-3">
          {(["card", "raised", "overlay"] as const).map((s) => (
            <div key={s} className="text-center">
              <div
                className="bg-porcelain mx-auto h-20 rounded-lg"
                style={{ boxShadow: `var(--shadow-${s})` }}
              />
              <code className="text-small text-plum-ink/60">--shadow-{s}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Button">
        <div className="space-y-stack">
          {(["primary", "secondary", "ghost"] as const).map((variant) => (
            <div key={variant}>
              <code className="text-small text-plum-ink/50">{variant}</code>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <Button variant={variant} size="sm">
                  Small 44px
                </Button>
                <Button variant={variant} size="md">
                  Medium 48px
                </Button>
                <Button variant={variant} size="lg">
                  Large 56px
                </Button>
                <Button variant={variant} disabled>
                  Disabled
                </Button>
                <Button variant={variant} loading>
                  Loading
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-stack text-small text-plum-ink/60">
          sm (44px) is for dense admin UI only; customer-facing flows use md/lg
          (≥48px tap targets).
        </p>
      </Section>

      <Section title="Form controls">
        <div className="space-y-stack">
          <div>
            <label
              htmlFor="sg-input"
              className="text-small mb-1.5 block font-semibold"
            >
              Input — default
            </label>
            <Input id="sg-input" placeholder="e.g. 98300 12345" />
          </div>
          <div>
            <label
              htmlFor="sg-input-err"
              className="text-small mb-1.5 block font-semibold"
            >
              Input — error
            </label>
            <Input
              id="sg-input-err"
              defaultValue="98"
              error
              aria-describedby="sg-input-err-msg"
            />
            <p
              id="sg-input-err-msg"
              className="text-small text-berry mt-1 font-medium"
            >
              Please enter a 10-digit phone number.
            </p>
          </div>
          <div>
            <label
              htmlFor="sg-input-dis"
              className="text-small mb-1.5 block font-semibold"
            >
              Input — disabled
            </label>
            <Input id="sg-input-dis" disabled value="Ballygunge" readOnly />
          </div>
          <div>
            <label
              htmlFor="sg-select"
              className="text-small mb-1.5 block font-semibold"
            >
              Select
            </label>
            <Select id="sg-select" defaultValue="">
              <option value="" disabled>
                Choose a delivery slot
              </option>
              <option>12 – 3 pm</option>
              <option>4 – 7 pm</option>
            </Select>
          </div>
          <div>
            <label
              htmlFor="sg-textarea"
              className="text-small mb-1.5 block font-semibold"
            >
              Textarea
            </label>
            <Textarea
              id="sg-textarea"
              placeholder="Anything Rhea should know? e.g. strictly no onion or garlic."
            />
          </div>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>100% eggless</Badge>
          <Badge>Jain-friendly</Badge>
          <Badge variant="ring">Few slots left</Badge>
          <Badge variant="ring">Paryushan special</Badge>
          <Badge variant="muted">Contains nuts</Badge>
          <Badge variant="muted">Closed</Badge>
        </div>
      </Section>

      <Section title="Card">
        <Card className="max-w-sm">
          <h3 className="text-heading">Brownie bites box</h3>
          <p className="text-small text-plum-ink/70 mt-1">
            Box of 9 · fudgy, eggless, dangerous.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-price tabular-nums">₹550</span>
            <Button size="md">Add</Button>
          </div>
        </Card>
      </Section>

      <Section title="Dialog, Sheet & Toast">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            Open Dialog
          </Button>
          <Button variant="secondary" onClick={() => setSheetBottomOpen(true)}>
            Open bottom Sheet
          </Button>
          <Button variant="secondary" onClick={() => setSheetRightOpen(true)}>
            Open right Sheet
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast("Order PD-260726-001 confirmed.")}
          >
            Toast — default
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast("Couldn’t reach the kitchen. Try again.", {
                variant: "error",
              })
            }
          >
            Toast — error
          </Button>
        </div>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Remove from order?"
        >
          <p className="text-body text-plum-ink/80">
            Take the chocolate almond tea cake off this order?
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Keep it
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Remove</Button>
          </div>
        </Dialog>

        <Sheet
          open={sheetBottomOpen}
          onClose={() => setSheetBottomOpen(false)}
          title="Pick a delivery slot"
          side="bottom"
        >
          <div className="space-y-3">
            <Button className="w-full" variant="secondary">
              12 – 3 pm
            </Button>
            <Button className="w-full" variant="secondary">
              4 – 7 pm
            </Button>
          </div>
        </Sheet>

        <Sheet
          open={sheetRightOpen}
          onClose={() => setSheetRightOpen(false)}
          title="Your order"
          side="right"
        >
          <p className="text-body text-plum-ink/70">
            Cart contents render here in Phase 5.
          </p>
        </Sheet>
      </Section>

      <Section title="Skeleton">
        <Card className="max-w-sm">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="mt-3 h-5 w-2/3" />
          <Skeleton className="mt-2 h-4 w-full" />
          <div className="mt-3 flex items-center justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-12 w-24 rounded-md" />
          </div>
        </Card>
      </Section>

      <Section title="Focus & motion">
        <p className="text-body">
          Every interactive element shows a 2px <code>--gold</code> outline on
          keyboard focus (Tab through this page to verify). All animations —
          overlay entrances, spinner, skeleton pulse — collapse to ~0ms under
          <code> prefers-reduced-motion: reduce</code>.
        </p>
      </Section>
    </main>
  );
}
