"use client";

import { DatePicker } from "@/components/sections/date-picker";
import { MenuSection } from "@/components/sections/menu-section";
import { SiteHeader } from "@/components/sections/site-header";
import {
  BigFooter,
  CategoryExplorer,
  DateBand,
  FestivalStrip,
  HeroOrbit,
  Reviews,
  StatsStrip,
  StorySplit,
  TrayCarousel,
  WhatsAppBand,
} from "@/components/sections/content-sections";
import { Button, Dialog } from "@/components/ui";
import { useCart } from "@/lib/cart";
import { shortDate } from "@/lib/dates";
import type { MenuItemFull } from "@/lib/queries";
import type { AvailabilityMap, FestivalLite } from "@/types/home";
import { useState } from "react";

export type HomePageProps = {
  items: MenuItemFull[];
  availability: AvailabilityMap;
  festivals: FestivalLite[];
  areaNames: string[];
  todayISO: string;
  maxISO: string;
  minLeadHours: number;
};

export function HomePage({
  items,
  availability,
  festivals,
  areaNames,
  todayISO,
  maxISO,
  minLeadHours,
}: HomePageProps) {
  const { deliveryDate, setDeliveryDate, incompatibleFor, remove } = useCart();
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  function scrollToMenu() {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document
      .getElementById("menu")
      ?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
  }

  function applyDate(iso: string) {
    setDeliveryDate(iso);
    scrollToMenu();
  }

  /** the date is locked to the cart: warn before dropping incompatible items */
  function handleSelect(iso: string) {
    if (iso === deliveryDate) return;
    const clashes = incompatibleFor(iso, todayISO);
    if (clashes.length > 0) {
      setPendingDate(iso);
      return;
    }
    applyDate(iso);
  }

  function confirmDateChange() {
    if (!pendingDate) return;
    for (const line of incompatibleFor(pendingDate, todayISO)) {
      remove(line.key);
    }
    applyDate(pendingDate);
    setPendingDate(null);
  }

  const pendingClashes = pendingDate
    ? incompatibleFor(pendingDate, todayISO)
    : [];

  return (
    <div id="top">
      <SiteHeader />
      <main>
        <HeroOrbit todayISO={todayISO} />
        <TrayCarousel items={items} />
        <CategoryExplorer items={items} />

        <DateBand>
          <DatePicker
            todayISO={todayISO}
            maxISO={maxISO}
            availability={availability}
            festivals={festivals}
            minLeadHours={minLeadHours}
            selected={deliveryDate}
            onSelect={handleSelect}
          />
        </DateBand>

        <MenuSection
          items={items}
          todayISO={todayISO}
          selectedDate={deliveryDate}
          onClearDate={() => setDeliveryDate(null)}
        />

        <StatsStrip />
        <FestivalStrip festivals={festivals} />
        <StorySplit />
        <Reviews />
        <WhatsAppBand todayISO={todayISO} />
      </main>
      <BigFooter areaNames={areaNames} festivalSlug={festivals[0]?.slug} />

      <Dialog
        open={pendingDate !== null}
        onClose={() => setPendingDate(null)}
        title="Change your delivery date?"
      >
        {pendingDate && (
          <>
            <p className="text-body text-plum-ink/80">
              Switching to <strong>{shortDate(pendingDate)}</strong> removes{" "}
              {pendingClashes.length === 1
                ? "one item that needs"
                : `${pendingClashes.length} items that need`}{" "}
              more notice than that date allows:
            </p>
            <ul className="text-small text-plum-ink/70 mt-3 list-disc space-y-1 pl-5">
              {pendingClashes.map((line) => (
                <li key={line.key}>
                  {line.name} ({line.leadTimeHours} hrs notice)
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <Button variant="ghost" onClick={() => setPendingDate(null)}>
                {deliveryDate
                  ? `Keep ${shortDate(deliveryDate)}`
                  : "Keep my items"}
              </Button>
              <Button onClick={confirmDateChange}>
                Switch and remove them
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
