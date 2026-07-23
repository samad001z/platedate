"use client";

import { Badge, Button, Card, useToast } from "@/components/ui";
import { DateCoin } from "@/components/ui/date-coin";
import { FoodImage } from "@/components/ui/food-image";
import { Logo } from "@/components/ui/logo";
import { Reveal } from "@/components/ui/reveal";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { coinParts, shortDate } from "@/lib/dates";
import { formatPaise } from "@/lib/money";
import {
  FSSAI_LINE,
  HOURS_LINE,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  whatsappLink,
} from "@/lib/site";
import type { MenuItemFull } from "@/lib/queries";
import type { FestivalLite } from "@/types/home";
import Link from "next/link";
import { useRef } from "react";

/* ---------------------------------------------------------------- shared */

function PlateDisc({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "rounded-pill border-gold bg-berry flex items-center justify-center border",
        className,
      )}
    >
      <span className="rounded-pill border-porcelain/60 size-1/3 border" />
    </span>
  );
}

/* ------------------------------------------------------------ hero orbit */

const SATELLITES = [
  {
    label: "tiramisu",
    pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/3",
  },
  {
    label: "brownies",
    pos: "top-1/2 right-0 translate-x-1/4 -translate-y-1/2",
  },
  {
    label: "tea cake",
    pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3",
  },
  {
    label: "platters",
    pos: "top-1/2 left-0 -translate-x-1/4 -translate-y-1/2",
  },
];

export function HeroOrbit({ todayISO }: { todayISO: string }) {
  const today = coinParts(todayISO);
  return (
    <section className="px-gutter relative mx-auto max-w-6xl overflow-x-clip pt-8 pb-4 lg:pt-12">
      <div className="grid grid-cols-1 items-center gap-x-12 gap-y-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* copy */}
        <div className="relative">
          <span
            aria-hidden
            className="float-soft rounded-pill bg-blush/80 pointer-events-none absolute -top-8 -left-10 -z-10 size-28"
          />
          <h1 className="font-display text-display lg:text-display-lg tracking-tight">
            Every occasion
            <br />
            deserves its own
            <br />
            <span className="text-berry">
              plate{" "}
              <span className="relative inline-block">
                date
                <svg
                  aria-hidden
                  viewBox="0 0 120 54"
                  preserveAspectRatio="none"
                  fill="none"
                  className="absolute -inset-x-3 -inset-y-1 h-[calc(100%+0.5rem)] w-[calc(100%+1.5rem)]"
                >
                  <ellipse
                    cx="60"
                    cy="27"
                    rx="56"
                    ry="23"
                    className="stroke-gold"
                    strokeWidth="2.5"
                  />
                </svg>
              </span>
            </span>
          </h1>
          <p className="text-body text-plum-ink/70 mt-5 max-w-[46ch]">
            Eggless platters, cakes and desserts from Rhea&rsquo;s Ballygunge
            kitchen, cooked for the day that matters to you.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => scrollToId("dates")}>
              Pick your date
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => scrollToId("menu")}
            >
              Browse the menu
            </Button>
          </div>
        </div>

        {/* the plate: a giant date token with orbiting favourites */}
        <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[440px]">
          <div className="relative aspect-square">
            {/* plate body */}
            <div className="rounded-pill border-gold bg-berry shadow-overlay absolute inset-[10%] border-2">
              <div className="rounded-pill border-porcelain/25 absolute inset-[7%] border" />
              <div className="rounded-pill bg-porcelain text-plum-ink absolute inset-[16%] flex flex-col items-center justify-center">
                <span className="text-small font-semibold tracking-widest uppercase opacity-60">
                  {today.weekday}
                </span>
                <span className="font-display text-display lg:text-display-lg leading-none">
                  {today.day}
                </span>
                <span className="text-small font-semibold tracking-widest uppercase opacity-60">
                  {today.month}
                </span>
              </div>
            </div>

            {/* orbiting favourites (counter-rotated to stay upright) */}
            <div className="spin-orbit absolute inset-0">
              {SATELLITES.map((s) => (
                <div key={s.label} className={cn("absolute", s.pos)}>
                  <div className="spin-orbit-reverse rounded-pill border-plum-ink/8 bg-porcelain shadow-raised flex size-16 flex-col items-center justify-center gap-1 border sm:size-20">
                    <PlateDisc className="size-6 sm:size-7" />
                    <span className="text-plum-ink/70 text-[0.6rem] font-semibold sm:text-[0.65rem]">
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* floating fact chips */}
            <div className="float-soft border-plum-ink/8 bg-porcelain shadow-raised absolute bottom-10 -left-3 hidden items-center gap-2.5 rounded-lg border p-3 sm:flex">
              <PlateDisc className="size-9" />
              <div>
                <p className="text-small leading-tight font-semibold">
                  Ready in 24 hrs
                </p>
                <p className="text-plum-ink/60 text-[0.75rem]">
                  most desserts and bakes
                </p>
              </div>
            </div>
            <div
              style={{ animationDelay: "1.2s" }}
              className="float-soft border-plum-ink/8 bg-porcelain shadow-raised absolute top-8 -right-2 hidden items-center gap-2.5 rounded-lg border p-3 sm:flex"
            >
              <PlateDisc className="size-9" />
              <div>
                <p className="text-small leading-tight font-semibold">
                  No onion, no garlic
                </p>
                <p className="text-plum-ink/60 text-[0.75rem]">
                  Jain options on request
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* trust marquee */}
      <TrustMarquee />
    </section>
  );
}

function scrollToId(id: string) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

const TRUST_FACTS = [
  "100% vegetarian",
  "fully eggless",
  "Jain options on request",
  "made to order in Ballygunge",
  "delivery across south Kolkata",
];

function TrustMarquee() {
  return (
    <div className="relative mt-12 overflow-hidden" role="presentation">
      <p className="sr-only">
        100% vegetarian, fully eggless, Jain options on request, made to order
        in Ballygunge, delivery across south Kolkata.
      </p>
      <div aria-hidden className="marquee-track flex w-max gap-10">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center gap-10">
            {TRUST_FACTS.map((fact) => (
              <span
                key={fact}
                className="text-small text-plum-ink/70 flex items-center gap-2.5 font-medium whitespace-nowrap"
              >
                <span className="rounded-pill border-gold size-2.5 shrink-0 border" />
                {fact}
              </span>
            ))}
          </div>
        ))}
      </div>
      <span
        aria-hidden
        className="from-porcelain absolute inset-y-0 left-0 w-10 bg-gradient-to-r to-transparent"
      />
      <span
        aria-hidden
        className="from-porcelain absolute inset-y-0 right-0 w-10 bg-gradient-to-l to-transparent"
      />
    </div>
  );
}

/* ----------------------------------------------------------- tray carousel */

const TRAY_VARIANTS = [
  "bg-blush text-plum-ink",
  "bg-plum-ink text-porcelain",
  "border border-plum-ink/10 bg-porcelain text-plum-ink",
] as const;

export function TrayCarousel({ items }: { items: MenuItemFull[] }) {
  const { add } = useCart();
  const { toast } = useToast();
  const trackRef = useRef<HTMLDivElement>(null);

  const trayItems = [
    ...items.filter((i) => i.is_hero),
    ...items.filter((i) => !i.is_hero),
  ].slice(0, 6);

  function scrollTray(direction: 1 | -1) {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    trackRef.current?.scrollBy({
      left: direction * 520,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  function quickAdd(item: MenuItemFull) {
    add({
      menuItemId: item.id,
      name: item.name,
      unitPricePaise: item.price_paise,
      quantity: Math.max(1, item.min_quantity),
      minQuantity: Math.max(1, item.min_quantity),
      leadTimeHours: item.lead_time_hours,
    });
    toast(`Added ${item.name} to your order`);
  }

  return (
    <section
      aria-label="Favourites"
      className="px-gutter pt-section mx-auto max-w-6xl"
    >
      <Reveal>
        <div className="bg-cream relative rounded-[2rem] p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between px-2">
            <h2 className="text-title">The favourites</h2>
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scrollTray(-1)}
                className="rounded-pill bg-porcelain shadow-card hover:bg-blush flex size-11 items-center justify-center transition duration-150 active:scale-[0.95]"
              >
                <svg
                  aria-hidden
                  className="size-5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M12 4l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scrollTray(1)}
                className="rounded-pill bg-porcelain shadow-card hover:bg-blush flex size-11 items-center justify-center transition duration-150 active:scale-[0.95]"
              >
                <svg
                  aria-hidden
                  className="size-5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M8 4l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-2"
          >
            {trayItems.map((item, i) => {
              const variant = TRAY_VARIANTS[i % TRAY_VARIANTS.length];
              const onPlum = variant.includes("bg-plum-ink");
              return (
                <div
                  key={item.id}
                  className={cn(
                    "shadow-card hover:shadow-raised flex w-[230px] shrink-0 snap-start flex-col items-center rounded-[1.5rem] p-5 text-center transition duration-200 hover:-translate-y-1",
                    variant,
                  )}
                >
                  <div className="rounded-pill border-gold size-28 overflow-hidden border-2">
                    <FoodImage name={item.name} imageUrl={item.image_url} />
                  </div>
                  <h3 className="text-body mt-3 line-clamp-1 font-semibold">
                    {item.name}
                  </h3>
                  <p
                    className={cn(
                      "text-small",
                      onPlum ? "text-porcelain/60" : "text-plum-ink/60",
                    )}
                  >
                    {item.lead_time_hours} hrs notice
                  </p>
                  <p
                    className={cn(
                      "font-display text-price mt-2 tabular-nums",
                      onPlum && "text-gold",
                    )}
                  >
                    {item.variants.length > 0 && (
                      <span className="text-small font-normal opacity-70">
                        from{" "}
                      </span>
                    )}
                    {formatPaise(item.price_paise)}
                  </p>
                  <button
                    type="button"
                    onClick={() => quickAdd(item)}
                    className={cn(
                      "rounded-pill text-small mt-3 inline-flex h-11 w-full items-center justify-center font-semibold transition duration-150 active:scale-[0.97]",
                      onPlum
                        ? "bg-porcelain text-berry hover:bg-blush"
                        : "bg-berry text-porcelain hover:bg-berry-deep",
                    )}
                  >
                    Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------- category explorer */

export function CategoryExplorer({ items }: { items: MenuItemFull[] }) {
  const categories = [
    ...new Map(items.map((i) => [i.category.slug, i.category])).values(),
  ].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section
      aria-label="Categories"
      className="px-gutter pt-section mx-auto max-w-6xl"
    >
      <div className="gap-gutter grid grid-cols-1 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <div className="bg-blush relative h-full overflow-hidden rounded-[2rem] p-8">
            <span
              aria-hidden
              className="rounded-pill border-gold absolute -top-14 -right-14 size-48 border-2"
            />
            <span
              aria-hidden
              className="rounded-pill bg-porcelain/70 absolute -bottom-20 -left-10 size-56"
            />
            <p className="font-display text-display relative max-w-[12ch] tracking-tight">
              Made for the family table
            </p>
            <p className="text-body text-plum-ink/70 relative mt-3 max-w-[28ch]">
              Five kinds of plates, one kitchen, no eggs anywhere.
            </p>
          </div>
        </Reveal>
        <div className="flex flex-col gap-3 lg:col-span-3">
          {categories.map((cat, i) => {
            const count = items.filter(
              (it) => it.category.slug === cat.slug,
            ).length;
            return (
              <Reveal key={cat.slug} delay={i * 60}>
                <a
                  href="#menu"
                  className="group border-plum-ink/8 bg-porcelain shadow-card hover:shadow-raised flex items-center gap-4 rounded-[1.25rem] border p-4 transition duration-200 hover:-translate-y-0.5"
                >
                  <PlateDisc className="size-11 shrink-0" />
                  <span className="flex-1">
                    <span className="text-body block font-semibold">
                      {cat.name}
                    </span>
                    <span className="text-small text-plum-ink/60 block">
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                  </span>
                  <svg
                    aria-hidden
                    className="text-plum-ink/40 size-5 transition-transform duration-200 group-hover:translate-x-1"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M8 4l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- date band */

export function DateBand({ children }: { children: React.ReactNode }) {
  return (
    <section
      id="dates"
      className="px-gutter pt-section mx-auto max-w-6xl scroll-mt-20"
    >
      <div className="bg-plum-ink grid grid-cols-1 items-center gap-8 rounded-[2rem] p-6 sm:p-10 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-display text-porcelain tracking-tight">
            When&rsquo;s your plate date?
          </h2>
          <p className="text-body text-porcelain/70 mt-3 max-w-[38ch]">
            Pick a day. The menu narrows to what can be ready in time, given
            each item&rsquo;s notice period and how full the kitchen already is.
          </p>
          <p className="text-small text-porcelain/60 mt-4 flex items-center gap-2.5">
            <span
              aria-hidden
              className="rounded-pill border-gold size-2.5 border"
            />
            gold-ringed days carry a festival menu
          </p>
        </Reveal>
        <Reveal delay={100}>{children}</Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ stats strip */

const STATS = [
  { value: "100%", label: "eggless, since day one" },
  { value: "6", label: "plate dates a day, never more" },
  { value: "0", label: "app commission on your bill" },
];

export function StatsStrip() {
  return (
    <section
      aria-label="Kitchen facts"
      className="px-gutter pt-section mx-auto max-w-6xl"
    >
      <div className="bg-blush grid grid-cols-1 gap-6 rounded-[2rem] px-6 py-10 sm:grid-cols-3 sm:gap-4">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 90} className="text-center">
            <p className="font-display text-display text-plum-ink tabular-nums">
              {stat.value}
            </p>
            <p className="text-small text-plum-ink/70 mt-1">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- festival strip */

export function FestivalStrip({ festivals }: { festivals: FestivalLite[] }) {
  if (festivals.length === 0) return null;
  return (
    <section
      className="px-gutter pt-section mx-auto max-w-6xl"
      aria-label="Festival menus"
    >
      {festivals.map((f) => (
        <Reveal key={f.slug}>
          <Card className="border-gold rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Badge variant="ring">Festival menu</Badge>
              <span className="text-small text-plum-ink/60">
                {shortDate(f.startsOn)} to {shortDate(f.endsOn)}
              </span>
            </div>
            <h2 className="text-title mt-2">{f.name}</h2>
            {f.heroCopy && (
              <p className="text-body text-plum-ink/70 mt-2 max-w-prose">
                {f.heroCopy}
              </p>
            )}
            <Link
              href={`/festival/${f.slug}`}
              className="text-body text-berry mt-3 inline-block rounded-sm font-semibold underline underline-offset-4"
            >
              See the{" "}
              {f.name.toLowerCase().includes("menu")
                ? f.name
                : `${f.name} menu`}
            </Link>
          </Card>
        </Reveal>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------ story split */

export function StorySplit() {
  return (
    <section
      id="story"
      className="px-gutter pt-section mx-auto max-w-6xl scroll-mt-20"
    >
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-display tracking-tight">
            From my kitchen in Ballygunge
          </h2>
          <div className="text-body text-plum-ink/80 mt-4 max-w-prose space-y-4">
            <p>
              Plate Date began at my dining table, with a tiramisu I made for my
              sister&rsquo;s birthday and forty DM requests by the next weekend.
              I still cook from that same kitchen, I still go to the market
              myself, and I still fold the mascarpone by hand.
            </p>
            <p>
              Everything I make is vegetarian and eggless, because that is how
              my family has always eaten. It is why Jain households trust me
              with their festival tables. When you order here, you are telling
              me the date that matters to you, and I am keeping that day for
              you.
            </p>
            <p className="text-plum-ink font-semibold">Rhea Jaitha</p>
          </div>
        </Reveal>

        <Reveal delay={120} className="relative mx-auto w-full max-w-[380px]">
          <div className="relative aspect-square">
            {/* portrait slot: swaps to Rhea's photo in Phase 8 */}
            <div className="rounded-pill bg-blush absolute inset-[6%] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <PlateDisc className="size-24" />
              </div>
            </div>
            <span
              aria-hidden
              className="rounded-pill border-gold absolute inset-[2%] border-2"
            />
            <div className="float-soft border-plum-ink/8 bg-porcelain shadow-raised absolute bottom-8 -left-2 w-44 rounded-lg border p-3.5">
              <p className="text-small font-semibold">0% commission</p>
              <p className="text-plum-ink/60 mt-0.5 text-[0.75rem]">
                ordering direct keeps app margins off your bill
              </p>
            </div>
            <div
              style={{ animationDelay: "1.1s" }}
              className="float-soft border-plum-ink/8 bg-porcelain shadow-raised absolute top-6 -right-2 w-44 rounded-lg border p-3.5"
            >
              <p className="text-small font-semibold">
                Orders apps can&rsquo;t take
              </p>
              <p className="text-plum-ink/60 mt-0.5 text-[0.75rem]">
                a platter for forty, strictly no onion or garlic
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- reviews */

const REVIEWS = [
  {
    name: "Ritu",
    ordered: "Jain celebration platter",
    quote:
      "The Jain platter for my mother-in-law's birthday was the first outside food she has ever finished.",
    tilt: "sm:-rotate-1",
    offset: "",
  },
  {
    name: "Sanjana",
    ordered: "Tiramisu tub",
    quote:
      "I stopped ordering tiramisu anywhere else. It tastes like it was made an hour ago, because it was.",
    tilt: "sm:rotate-[1.25deg]",
    offset: "sm:mt-10",
  },
  {
    name: "Mehul",
    ordered: "Brownie party box",
    quote:
      "Thirty brownie bites for the office, gone in eleven minutes. Three people asked me for her number.",
    tilt: "sm:-rotate-[0.75deg]",
    offset: "sm:mt-4",
  },
];

export function Reviews() {
  return (
    <section
      className="px-gutter pt-section mx-auto max-w-6xl"
      aria-labelledby="reviews-heading"
    >
      <h2 id="reviews-heading" className="text-title">
        What people say
      </h2>
      <ul className="gap-gutter mt-6 grid grid-cols-1 sm:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <li key={r.name} className={r.offset}>
            <Reveal delay={i * 90}>
              <Card
                className={cn(
                  "hover:shadow-raised h-full transition duration-200 hover:rotate-0",
                  r.tilt,
                )}
              >
                <blockquote className="text-body text-plum-ink/80">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <p className="text-small mt-3 font-semibold">{r.name}</p>
                <p className="text-small text-plum-ink/60">{r.ordered}</p>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------- WhatsApp band */

export function WhatsAppBand({ todayISO }: { todayISO: string }) {
  return (
    <section
      id="party"
      className="px-gutter pt-section mx-auto max-w-6xl scroll-mt-20"
    >
      <Reveal>
        <div className="bg-berry relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
          <span
            aria-hidden
            className="rounded-pill border-gold/70 absolute -right-16 -bottom-24 size-64 border-2"
          />
          <span
            aria-hidden
            className="absolute -right-8 -bottom-16 hidden sm:block"
          >
            <DateCoin dateISO={todayISO} size="lg" className="opacity-90" />
          </span>
          <h2 className="font-display text-display text-porcelain max-w-[18ch] tracking-tight">
            Skip the apps. Talk to the kitchen.
          </h2>
          <p className="text-body text-porcelain/80 mt-3 max-w-[46ch]">
            Send your order on WhatsApp and Rhea confirms it herself, usually
            within the hour. Feeding a crowd, planning a pujo, or keeping it
            strictly Jain: say so and she will build the plate around it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappLink(
                "Hello Rhea, I found you through the website.",
              )}
              target="_blank"
              rel="noreferrer"
              className="bg-porcelain text-body text-berry hover:bg-blush inline-flex h-14 items-center justify-center rounded-md px-6 font-semibold transition duration-150 active:scale-[0.98]"
            >
              Message Rhea on WhatsApp
            </a>
            <Link
              href="/party"
              className="border-porcelain/50 text-body text-porcelain hover:bg-berry-deep inline-flex h-14 items-center justify-center rounded-md border px-6 font-semibold transition duration-150 active:scale-[0.98]"
            >
              Start a party enquiry
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ footer */

export function BigFooter({
  areaNames,
  festivalSlug,
}: {
  areaNames: string[];
  festivalSlug?: string;
}) {
  return (
    <footer className="mt-section bg-plum-ink text-porcelain/80">
      <div className="px-gutter py-section mx-auto max-w-6xl">
        <div className="flex items-center gap-4">
          <Logo className="ring-porcelain/15 size-16 ring-1" />
          <div>
            <p className="font-display text-display text-porcelain tracking-tight">
              plate date
            </p>
            <p className="text-small text-porcelain/60">by Rhea Jaitha</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-small text-porcelain font-semibold">
              The kitchen
            </h3>
            <p className="text-small mt-2 max-w-[30ch]">
              A one-woman cloud kitchen in Ballygunge. Custom platters, cakes
              and desserts, all vegetarian, all eggless.
            </p>
          </div>
          <div>
            <h3 className="text-small text-porcelain font-semibold">
              Find your way
            </h3>
            <ul className="text-small mt-2 space-y-1.5">
              <li>
                <a
                  href="#menu"
                  className="rounded-sm underline-offset-2 hover:underline"
                >
                  The menu
                </a>
              </li>
              <li>
                <a
                  href="#dates"
                  className="rounded-sm underline-offset-2 hover:underline"
                >
                  Pick a date
                </a>
              </li>
              {festivalSlug && (
                <li>
                  <Link
                    href={`/festival/${festivalSlug}`}
                    className="rounded-sm underline-offset-2 hover:underline"
                  >
                    Festival menu
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/party"
                  className="rounded-sm underline-offset-2 hover:underline"
                >
                  Party and bulk orders
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-small text-porcelain font-semibold">
              Delivery areas
            </h3>
            <p className="text-small mt-2">{areaNames.join(", ")}</p>
          </div>
          <div>
            <h3 className="text-small text-porcelain font-semibold">
              Talk to us
            </h3>
            <ul className="text-small mt-2 space-y-1.5">
              <li>
                <a
                  href={whatsappLink(
                    "Hello Rhea, I found you through the website.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold rounded-sm underline underline-offset-2"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold rounded-sm underline underline-offset-2"
                >
                  {INSTAGRAM_HANDLE}
                </a>
              </li>
              <li>{HOURS_LINE}</li>
              <li>{FSSAI_LINE}</li>
            </ul>
          </div>
        </div>

        <p className="border-porcelain/10 text-small text-porcelain/50 mt-10 border-t pt-6">
          © 2026 Plate Date · Rhea Jaitha · Ballygunge, Kolkata
        </p>
      </div>
    </footer>
  );
}
