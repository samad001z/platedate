"use client";

import { Badge, Button, Card, Sheet, useToast } from "@/components/ui";
import { DateCoin } from "@/components/ui/date-coin";
import { FoodImage } from "@/components/ui/food-image";
import { Reveal } from "@/components/ui/reveal";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { addDaysISO, daysBetween, shortDate } from "@/lib/dates";
import { formatPaise } from "@/lib/money";
import type { MenuItemFull } from "@/lib/queries";
import { useMemo, useState } from "react";

export type MenuSectionProps = {
  items: MenuItemFull[];
  todayISO: string;
  selectedDate: string | null;
  onClearDate: () => void;
};

const TAG_LABELS: Record<string, string> = {
  eggless: "Eggless",
  jain_no_onion_garlic: "Jain option",
  vegan: "Vegan",
  gluten_free: "Gluten-free",
  contains_nuts: "Contains nuts",
};

/** "no_nuts" is synthetic — it excludes items tagged contains_nuts */
const CHIP_ORDER = [
  "eggless",
  "jain_no_onion_garlic",
  "gluten_free",
  "vegan",
  "no_nuts",
];
const CHIP_LABELS: Record<string, string> = {
  ...TAG_LABELS,
  no_nuts: "No nuts",
};

function earliestFor(item: MenuItemFull, todayISO: string): string {
  return addDaysISO(todayISO, Math.ceil(item.lead_time_hours / 24));
}

function fitsDate(
  item: MenuItemFull,
  todayISO: string,
  dateISO: string,
): boolean {
  return item.lead_time_hours <= daysBetween(todayISO, dateISO) * 24;
}

export function MenuSection({
  items,
  todayISO,
  selectedDate,
  onClearDate,
}: MenuSectionProps) {
  const { add } = useCart();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set());
  const [sheetItem, setSheetItem] = useState<MenuItemFull | null>(null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const categories = useMemo(
    () =>
      [
        ...new Map(items.map((i) => [i.category.slug, i.category])).values(),
      ].sort((a, b) => a.sort_order - b.sort_order),
    [items],
  );

  const presentTagSlugs = useMemo(
    () => new Set(items.flatMap((i) => i.tags.map((t) => t.slug))),
    [items],
  );
  const chips = CHIP_ORDER.filter((slug) =>
    slug === "no_nuts"
      ? presentTagSlugs.has("contains_nuts")
      : presentTagSlugs.has(slug),
  );

  function toggleChip(slug: string) {
    setActiveChips((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  const passesChips = (item: MenuItemFull) =>
    [...activeChips].every((slug) =>
      slug === "no_nuts"
        ? !item.tags.some((t) => t.slug === "contains_nuts")
        : item.tags.some((t) => t.slug === slug),
    );

  const dietaryFiltered = items.filter(passesChips);
  const categoryFiltered =
    activeCategory === "all"
      ? dietaryFiltered
      : dietaryFiltered.filter((i) => i.category.slug === activeCategory);
  const visible = selectedDate
    ? categoryFiltered.filter((i) => fitsDate(i, todayISO, selectedDate))
    : categoryFiltered;
  const hiddenByDate = selectedDate
    ? categoryFiltered.length - visible.length
    : 0;

  const featured = visible.find((i) => i.is_hero) ?? visible[0] ?? null;
  const rest = visible.filter((i) => i.id !== featured?.id);

  const groups = useMemo(() => {
    if (activeCategory !== "all") {
      return rest.length ? [{ name: "", items: rest }] : [];
    }
    const map = new Map<
      string,
      { name: string; sort: number; items: MenuItemFull[] }
    >();
    for (const item of rest) {
      const g = map.get(item.category.slug) ?? {
        name: item.category.name,
        sort: item.category.sort_order,
        items: [],
      };
      g.items.push(item);
      map.set(item.category.slug, g);
    }
    return [...map.values()].sort((a, b) => a.sort - b.sort);
  }, [rest, activeCategory]);

  function openSheet(item: MenuItemFull) {
    setSheetItem(item);
    setVariantId(item.variants[0]?.id ?? null);
    setQuantity(Math.max(1, item.min_quantity));
  }

  const sheetVariant =
    sheetItem?.variants.find((v) => v.id === variantId) ?? null;
  const sheetUnitPaise =
    sheetVariant?.price_paise ?? sheetItem?.price_paise ?? 0;
  const sheetDeliveryISO =
    sheetItem &&
    (selectedDate && fitsDate(sheetItem, todayISO, selectedDate)
      ? selectedDate
      : earliestFor(sheetItem, todayISO));

  function confirmAdd() {
    if (!sheetItem) return;
    add({
      menuItemId: sheetItem.id,
      variantId: sheetVariant?.id,
      name: sheetVariant
        ? `${sheetItem.name} (${sheetVariant.label})`
        : sheetItem.name,
      unitPricePaise: sheetUnitPaise,
      quantity,
      minQuantity: Math.max(1, sheetItem.min_quantity),
      leadTimeHours: sheetItem.lead_time_hours,
    });
    toast(`Added ${sheetItem.name} to your order`);
    setSheetItem(null);
  }

  return (
    <section
      id="menu"
      className="px-gutter pt-section mx-auto max-w-6xl scroll-mt-20"
    >
      {/* header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {selectedDate ? (
          <>
            <span key={selectedDate} className="pop-in inline-flex">
              <DateCoin dateISO={selectedDate} size="md" />
            </span>
            <div className="min-w-0">
              <h2 className="text-title">For {shortDate(selectedDate)}</h2>
              <p className="text-small text-plum-ink/60">
                Everything below can be ready in time.
              </p>
            </div>
            <Button variant="ghost" onClick={onClearDate}>
              Show the full menu
            </Button>
          </>
        ) : (
          <div>
            <h2 className="text-title">The menu</h2>
            <p className="text-small text-plum-ink/60">
              Browse by kind, or pick a date above to see what fits it.
            </p>
          </div>
        )}
      </div>

      {/* category tabs */}
      <div className="no-scrollbar border-plum-ink/10 mt-5 flex gap-6 overflow-x-auto border-b">
        {[{ slug: "all", name: "All" }, ...categories].map((cat) => {
          const active = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveCategory(cat.slug)}
              className={cn(
                "text-body -mb-px shrink-0 border-b-2 pb-2.5 font-semibold whitespace-nowrap transition-colors",
                active
                  ? "border-gold text-plum-ink"
                  : "text-plum-ink/45 hover:text-plum-ink/70 border-transparent",
              )}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* dietary chips */}
      {chips.length > 0 && (
        <div
          role="group"
          aria-label="Dietary filters"
          className="mt-4 flex flex-wrap gap-2"
        >
          {chips.map((slug) => {
            const active = activeChips.has(slug);
            return (
              <button
                key={slug}
                type="button"
                aria-pressed={active}
                onClick={() => toggleChip(slug)}
                className={cn(
                  "rounded-pill text-small h-10 border px-4 font-medium transition-colors",
                  active
                    ? "border-plum-ink bg-plum-ink text-porcelain"
                    : "border-plum-ink/20 bg-porcelain text-plum-ink hover:bg-blush",
                )}
              >
                {CHIP_LABELS[slug]}
              </button>
            );
          })}
        </div>
      )}

      {hiddenByDate > 0 && (
        <p className="text-small text-plum-ink/60 mt-3">
          {hiddenByDate} {hiddenByDate === 1 ? "item needs" : "items need"} more
          notice than {shortDate(selectedDate as string)} allows. Pick a later
          date to see {hiddenByDate === 1 ? "it" : "them"}.
        </p>
      )}

      {visible.length === 0 && (
        <Card className="mt-6">
          <p className="text-body">
            Nothing fits this combination. Clear a filter or pick a later date.
          </p>
        </Card>
      )}

      {/* featured chef's pick banner */}
      {featured && (
        <Reveal className="mt-6">
          <FeaturedCard
            item={featured}
            todayISO={todayISO}
            selectedDate={selectedDate}
            onAdd={() => openSheet(featured)}
          />
        </Reveal>
      )}

      {/* the rest, grouped by category when viewing all */}
      {groups.map((group) => (
        <div key={group.name || "single"} className="mt-8">
          {group.name && <h3 className="text-heading mb-3">{group.name}</h3>}
          <div className="gap-x-gutter grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item, idx) => (
              <Reveal key={item.id} delay={(idx % 3) * 80}>
                <ItemCard
                  item={item}
                  todayISO={todayISO}
                  selectedDate={selectedDate}
                  onAdd={() => openSheet(item)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      ))}

      {/* quantity + variant sheet */}
      <Sheet
        open={sheetItem !== null}
        onClose={() => setSheetItem(null)}
        title={sheetItem?.name ?? ""}
        side="bottom"
      >
        {sheetItem && (
          <div className="mx-auto w-full max-w-md">
            {sheetItem.variants.length > 0 && (
              <fieldset className="mb-5">
                <legend className="text-small mb-2 font-semibold">Size</legend>
                <div className="flex flex-col gap-2">
                  {sheetItem.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      aria-pressed={v.id === variantId}
                      onClick={() => setVariantId(v.id)}
                      className={cn(
                        "text-body flex h-12 items-center justify-between rounded-md border px-4 transition-colors",
                        v.id === variantId
                          ? "border-berry bg-blush font-semibold"
                          : "border-plum-ink/20 hover:bg-blush/50",
                      )}
                    >
                      <span>{v.label}</span>
                      <span className="tabular-nums">
                        {formatPaise(v.price_paise)}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="mb-5 flex items-center justify-between">
              <span className="text-small font-semibold">
                Quantity
                {sheetItem.min_quantity > 1 &&
                  ` (minimum ${sheetItem.min_quantity})`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= Math.max(1, sheetItem.min_quantity)}
                  onClick={() => setQuantity((q) => q - 1)}
                  className="border-plum-ink/20 text-body hover:bg-blush flex size-11 items-center justify-center rounded-md border transition-colors disabled:pointer-events-none disabled:opacity-30"
                >
                  −
                </button>
                <span
                  aria-live="polite"
                  className="text-body w-10 text-center font-semibold tabular-nums"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="border-plum-ink/20 text-body hover:bg-blush flex size-11 items-center justify-center rounded-md border transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {sheetDeliveryISO && (
              <p className="text-small text-plum-ink/60 mb-5 flex items-center gap-2">
                <DateCoin dateISO={sheetDeliveryISO} size="sm" />
                {selectedDate && fitsDate(sheetItem, todayISO, selectedDate)
                  ? `Ready by ${shortDate(selectedDate)}`
                  : `Needs ${sheetItem.lead_time_hours} hrs notice, earliest ${shortDate(sheetDeliveryISO)}`}
              </p>
            )}

            <Button size="lg" className="w-full" onClick={confirmAdd}>
              Add to order · {formatPaise(sheetUnitPaise * quantity)}
            </Button>
          </div>
        )}
      </Sheet>
    </section>
  );
}

/* -------------------------------------------------------------- sub-cards */

function ChefPick() {
  return (
    <span className="rounded-pill bg-plum-ink text-gold inline-flex items-center gap-1 px-2.5 py-1 text-[0.7rem] font-semibold">
      Chef&rsquo;s pick
    </span>
  );
}

function PriceCoin({
  item,
  className,
}: {
  item: MenuItemFull;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-pill border-gold bg-porcelain font-display text-price shadow-card inline-flex items-center gap-1 border px-3 py-1 tabular-nums",
        className,
      )}
    >
      {item.variants.length > 0 && (
        <span className="text-small text-plum-ink/50 font-normal">from</span>
      )}
      {formatPaise(item.price_paise)}
    </span>
  );
}

function DietaryBadges({ item }: { item: MenuItemFull }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {item.tags.map((tag) => (
        <Badge
          key={tag.id}
          variant={tag.slug === "contains_nuts" ? "muted" : "tag"}
        >
          {TAG_LABELS[tag.slug] ?? tag.name}
        </Badge>
      ))}
    </div>
  );
}

function metaLine(item: MenuItemFull): string {
  return [
    item.serves_count ? `Serves ${item.serves_count}` : null,
    `${item.lead_time_hours} hrs notice`,
    item.min_quantity > 1 ? `minimum ${item.min_quantity}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function FeaturedCard({
  item,
  todayISO,
  selectedDate,
  onAdd,
}: {
  item: MenuItemFull;
  todayISO: string;
  selectedDate: string | null;
  onAdd: () => void;
}) {
  const ready =
    selectedDate && fitsDate(item, todayISO, selectedDate)
      ? selectedDate
      : earliestFor(item, todayISO);
  return (
    <div className="group border-plum-ink/8 bg-cream shadow-card grid overflow-hidden rounded-[2rem] border md:grid-cols-2">
      <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto">
        <FoodImage
          name={item.name}
          imageUrl={item.image_url}
          className="transition duration-500 group-hover:scale-105"
        />
        <span className="absolute top-4 left-4">
          <ChefPick />
        </span>
      </div>
      <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
        <span className="text-small text-plum-ink/50 font-medium">
          {item.category.name}
        </span>
        <h3 className="font-display text-title">{item.name}</h3>
        {item.description && (
          <p className="text-body text-plum-ink/70 max-w-prose">
            {item.description}
          </p>
        )}
        <DietaryBadges item={item} />
        <p className="text-small text-plum-ink/60 flex items-center gap-2">
          <DateCoin dateISO={ready} size="sm" />
          {metaLine(item)}
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <PriceCoin item={item} />
          <Button size="lg" onClick={onAdd}>
            Add to order
          </Button>
        </div>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  todayISO,
  selectedDate,
  onAdd,
}: {
  item: MenuItemFull;
  todayISO: string;
  selectedDate: string | null;
  onAdd: () => void;
}) {
  return (
    <Card
      padded={false}
      className="group hover:shadow-raised flex h-full flex-col transition duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        <FoodImage
          name={item.name}
          imageUrl={item.image_url}
          className="transition duration-500 group-hover:scale-105"
        />
        {item.is_hero && (
          <span className="absolute top-3 left-3">
            <ChefPick />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-3">
        <PriceCoin
          item={item}
          className="relative z-10 -mt-9 mb-1 self-start"
        />
        <h4 className="text-heading">{item.name}</h4>
        {item.description && (
          <p className="text-small text-plum-ink/70 line-clamp-2">
            {item.description}
          </p>
        )}
        <DietaryBadges item={item} />
        <p className="text-small text-plum-ink/60">{metaLine(item)}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {!selectedDate ? (
            <span className="flex items-center gap-1.5">
              <span className="text-small text-plum-ink/50">earliest</span>
              <DateCoin dateISO={earliestFor(item, todayISO)} size="sm" />
            </span>
          ) : (
            <span className="text-small text-plum-ink/50">
              ready {shortDate(selectedDate)}
            </span>
          )}
          <Button onClick={onAdd}>Add</Button>
        </div>
      </div>
    </Card>
  );
}
