# Plate Date — plate.date site

Cloud-kitchen ordering site for **Plate Date**, chef Rhea Jaitha, Ballygunge, Kolkata.
This file is the source of truth for brief, design tokens, IA, schema, and phased plan.

---

## 1. Client brief

- 100% vegetarian, almost certainly all-eggless. **Eggless is a selling point, not an apology.**
- Sells: custom platters, party orders, bulk orders, cakes, desserts, savoury bakes.
- Hero items: tiramisu (marketed as "Kolkata's Best"), brownie bites box, chocolate almond tea cake.
- Currently sells via Zomato, Swiggy, Instagram DMs. **This site exists to pull orders off the aggregators and save 18–30% commission.** Success metric = direct orders, not page views.
- Core customer: Jain and Marwari families in south Kolkata. Publishes a Paryushan festival menu. No-onion/no-garlic options matter.
- Typical buyer: a 40–60-year-old woman ordering a platter for a family event, arriving via Instagram bio link on Android (>85% of traffic). Prioritise clarity, large tap targets, obvious pricing, and trust signals over visual novelty.
- Brand assets: logo is a berry-magenta disc with "plate" in white sans and "date" in white script with a small heart, ringed in a gold gradient. **The logo is the only script/handwriting allowed anywhere — never add a second script typeface.**
- Design thesis: she sells occasions, not a catalogue. The site's central object is a DATE. "When's your plate date?" — the chosen date reveals what she can actually cook that day given capacity and advance-notice rules.
- Hard bans: the default AI-design look (cream #F4F1EA bg, high-contrast serif display, terracotta accent); second script typeface; date picker acting as a gate that hides the menu (see Decisions log).

---

## 2. Design tokens (final, post-critique)

### Color

```css
--porcelain:  #FFFCF9;  /* page background, card fills */
--plum-ink:   #26071A;  /* all text, headings, footer bg */
--berry:      #A00D4C;  /* transactional actions ONLY — see rule 2 */
--berry-deep: #7C0A3B;  /* pressed/hover state of berry */
--blush:      #F6E6EC;  /* section tints, chips, selected-date panel */
--gold:       #E0A24C;  /* rings/rules/borders ONLY — see rule 1 */
--cream:      #FBEFDA;  /* v3.1: warm premium neutral (breaks pink monotony) */
--butter:     #F7E4C4;  /* v3.1: soft gold wash for tinted plate placeholders */
```

**v3.1 palette refinement (client "colours feel off, make it playful + premium"):** `cream`/`butter` are warm neutrals (not new accents) so sections and food-placeholders stop being blush-on-blush. Cream carries the favourites tray + featured menu banner; placeholders cycle four tints (blush/cream/butter/faint-berry) with a gold-rimmed plate + berry portion + gold garnish, reading as plated dishes not identical discs. Gold leaned into as the premium signal (menu tab underline, price-coin ring, Chef's-pick badge). Rules 1–3 below unchanged.

**Palette rules (load-bearing, do not violate):**
1. **Gold is a ring, never a fill.** Gold appears only as 1–2px rings, hairline rules, and outlines (Date Coin ring, dividers, festival badge outline). No gold buttons, panels, or fills. Gold is NEVER text on light backgrounds (~2.2:1 contrast); gold text is permitted on `--plum-ink` only.
2. **Berry is spent only on money.** Berry appears exclusively on actions that move an order forward: date selection, Add, Checkout, WhatsApp-to-order, links into the order flow. Never decorative. On any screen, the berry things are the tappable things.
3. **Capacity states never rely on hue.** Open = blush bg + berry text chip; Few slots = gold-ring outline + plum text; Closed = 8% plum bg + struck plum text. Always worded, never colour-only. No greens/reds.

### Type

Two typefaces, no more. No second script — the logo owns handwriting.

- **Bricolage Grotesque** — display. Weights 600/700 only. Sentence case only (no all-caps headings). Roles: hero question, section heads, card prices, Date Coin numerals. Sole all-caps exception: the tiny day/month labels inside the Date Coin.
- **Hanken Grotesk** — body/UI. Weights 400/600. Roles: body copy, forms, labels, buttons, chips.

```
--type-hero:     32/38  Bricolage 700
--type-title:    24/30  Bricolage 600
--type-heading:  20/26  Bricolage 600
--type-body:     17/26  Hanken 400      /* base is 17px, not 16 — older readers */
--type-strong:   17/26  Hanken 600
--type-small:    15/22  Hanken 400
--type-price:    20/24  Bricolage 600, tabular-nums
```

Minimum tap target: 48×48px. Prices always visible on cards — never "tap to see price".

### Motion layer (Phase 3 polish)

CSS-first, zero new dependencies (Android IG-browser budget). Utilities in `globals.css`: `float-soft` (tilted idle float, `--tilt` var), `spin-slow` (brand sticker ring), `pop-in` (Date Coin feedback), `rise-in` (hero entrance), `marquee-track` (the single marquee, trust facts). Scroll reveals via `<Reveal>` (`components/ui/reveal.tsx`, IntersectionObserver — **never scroll listeners**). Every animation collapses under `prefers-reduced-motion`; the marquee's duplicated track means its reduced fallback still reads as a full row. Motion rules: each animation must be motivated (hierarchy, feedback, storytelling, state change); max one marquee per page.

**Copy rules (tightened via design-taste skill, 2026-07-23):** no em-dashes (`—`) or en-dashes anywhere user-visible — restructure with periods, commas, colons, or "to" for ranges. Middle-dot separators rationed to one per line. These extend the original rules (sentence case, active voice, no exclamation marks, no emoji in body copy; the sticker's ♥ is the logo's heart mark, not an emoji).

### Brand logo (real asset, added v3.1)

Rhea's actual logo is at `public/logo.png` (1080×1080, transparent corners): berry disc, "plate" in a high-contrast serif, "date" in white script with a heart, "by Rhea Jaitha" beneath. Rendered via `components/ui/logo.tsx` (`<Logo>`), always circle-clipped (`rounded-pill`) so the transparent corners never show. It appears in the header (40px + wordmark) and footer (64px + wordmark + "by Rhea Jaitha"). **This is the site's only handwriting** — it lives inside the logo image, so the no-second-script rule holds; body/display type stays Bricolage + Hanken. The geometric `PlateDisc` motif and Date Coin still echo the disc elsewhere.

### Signature element: the Date Coin

A berry disc with a thin gold ring (the logo's exact geometry) containing a date — "Sat · 26 Jul". Appears: selected day in the hero strip; on product cards ("earliest ready ◉ Sat 26"); in cart; largest on the order confirmation. The confirmation renders a screenshot-friendly square sticker (Date Coin + order number + items + "Plate Date · Ballygunge") designed to be forwarded on WhatsApp/Instagram.

---

## 3. Homepage layout (final, post-critique)

The date is a **filter, not a gate**. Food and trust are visible on the first screen; picking a date re-annotates the menu in place, never hides it.

```
┌──────────────────────────────┐
│ ◉ plate date        [Order]  │  sticky header, logo + one berry action
├──────────────────────────────┤
│ [photo band — tiramisu,      │  real food photography first
│  platter, tea cake]          │
│ 100% eggless · Jain-friendly │  trust strip ABOVE the interaction
│ · No onion/garlic on request │
│ · FSSAI no. · Ballygunge     │
├──────────────────────────────┤
│ When's your plate date?      │  --type-hero
│ ‹ Th24 Fr25 Sa26 Su27 … ›    │  14-day horizontal strip, 48px+ targets
│  Open Open Few   ✕           │  worded capacity chips (rule 3)
├──────────────────────────────┤
│ Kolkata's Best Tiramisu      │  hero items, then categories
│ [photo] ₹—— ◉Sat26  [Add]    │  every card: price + earliest-ready coin
│ Brownie bites box …          │
│ Chocolate almond tea cake …  │
├──────────────────────────────┤
│ ✦ Paryushan menu banner ✦   │  gold-ring outline (rule 1)
├──────────────────────────────┤
│ Platters & party orders →    │  → /party enquiry, not cart
│ Rhea's story · FAQ           │
│ [WhatsApp us] (berry)        │
└──────────────────────────────┘
```

With a date selected, cards gain either "✓ Can be ready Sat 26" or "Needs 2 days' notice — earliest ◉ Mon 28" (still addable for the later date).

---

## 4. Sitemap & routes

### Public
| Route | Purpose |
|---|---|
| `/` | Home per wireframe above |
| `/date/[yyyy-mm-dd]` | Everything cookable for that date; shareable — Rhea can DM it |
| `/menu` | Full catalogue |
| `/menu/[category]` | platters / cakes / desserts / savoury-bakes |
| `/item/[slug]` | Item detail: photos, variants, dietary tags, notice period, date-aware Add |
| `/festival/[slug]` | Time-boxed menus, e.g. `paryushan-2026` |
| `/party` | Party & bulk orders — guide + enquiry form (no cart; converts via conversation) |
| `/about` | Rhea's story, kitchen, FSSAI |
| `/faq` | Delivery areas, notice rules, Jain policy, payment |
| `/cart` → `/checkout` → `/order/[orderNumber]` | Order flow; confirmation shows the sticker |

### Admin (`/kitchen`, auth — Rhea only)
`/kitchen` (today's board) · `/kitchen/orders` · `/kitchen/orders/[id]` · `/kitchen/calendar` (capacity editor) · `/kitchen/menu` · `/kitchen/enquiries`

---

## 5. Postgres schema — AS BUILT (live)

**Supabase project `plate-date`** · ref `jvtrvfhufqkunmsxhand` · region `ap-south-1` (Mumbai) · Postgres 17.
Migration: `supabase/migrations/20260723150000_initial_schema.sql` (applied). Seed: `supabase/seed.sql` (applied — 5 categories, 14 items, 6 variants, 5 tags, 7 delivery areas, Paryushan 2026 festival).
Generated types: `types/database.ts` — **regenerate after every migration** (Supabase MCP `generate_typescript_types`).

**Money is integer paise everywhere** (`price_paise`, `fee_paise`, `*_paise`). Never floats, never rupees. ₹550 = 55000. The only ÷100 in the codebase is `formatPaise()` in `lib/money.ts`.

### Enums
`order_status`: new → confirmed → preparing → out_for_delivery → delivered | cancelled
`payment_status`: pending | paid | refunded · `enquiry_status`: new | replied | converted | closed · `enquiry_kind`: party | bulk | custom

### Tables (columns as deployed)
| Table | Columns |
|---|---|
| `categories` | id, name, slug ᵁ, sort_order, is_active |
| `menu_items` | id, category_id → categories, name, slug ᵁ, description, **price_paise**, image_url, is_active, is_hero, sort_order, **lead_time_hours** (default 24), **min_quantity** (default 1), serves_count |
| `menu_item_variants` | id, menu_item_id ⇒ menu_items, label, price_paise, sort_order |
| `dietary_tags` | id, slug ᵁ, name — seeded: `eggless`, `jain_no_onion_garlic`, `vegan`, `gluten_free`, `contains_nuts` |
| `menu_item_dietary_tags` | (menu_item_id, dietary_tag_id) PK, both cascade |
| `capacity` | **date PK**, max_orders (default 6), **is_blackout**, note — override rows only; absent date = open with default 6 (constant lives in the two RPCs) |
| `festival_menus` | id, name, slug ᵁ, starts_on, ends_on, hero_copy, **is_published** |
| `festival_menu_items` | (festival_id, menu_item_id) PK, festival_price_paise (null = regular), sort_order |
| `delivery_areas` | id, name, fee_paise, is_active — Ballygunge ₹0 … New Alipore ₹90 |
| `orders` | id, order_number ᵁ (`PD-YYMMDD-nnnn`), customer_name, phone, email, delivery_date, delivery_slot, area_id → delivery_areas, address, order_status, payment_status, subtotal_paise, delivery_fee_paise, total_paise, notes, created_at |
| `order_items` | id, order_id ⇒ orders, menu_item_id (SET NULL on menu delete), **item_name SNAPSHOT**, **unit_price_paise SNAPSHOT**, quantity, line_note — history never joins live to the menu |
| `enquiries` | id, kind, name, phone, event_date, headcount, budget_paise, message, status, created_at |

ᵁ unique · → FK · ⇒ FK cascade delete

### RPCs (both `security definer`)
- **`create_order(p_customer_name, p_phone, p_email, p_delivery_date, p_delivery_slot, p_area_id, p_address, p_notes, p_items jsonb) → (order_id, order_number)`** — the ONLY public write path for orders. Validates non-empty fields, date not past, blackout, capacity (with a per-date advisory lock against double-booking the last slot), per-item lead time and min quantity; prices every line from the live menu (client-sent prices are never trusted); snapshots name+price into order_items; generates the order number. Raises typed errors: `ORDER_EMPTY`, `DATE_IN_PAST`, `DATE_CLOSED`, `DATE_FULL`, `ITEM_UNAVAILABLE`, `LEAD_TIME:<slug>`, `MIN_QTY:<slug>`, `VARIANT_INVALID`, `AREA_INVALID`.
- **`get_date_availability(p_from, p_to) → (day, is_blackout, max_orders, orders_booked)`** — public capacity per day (counts non-cancelled orders) without exposing any order rows. Powers the hero date strip.

### RLS summary (verified live with the anon key)
| Table(s) | anon | authenticated (admin = Rhea only) |
|---|---|---|
| categories, menu_items, variants, item_tags | SELECT active rows only | ALL |
| dietary_tags, capacity | SELECT | ALL |
| festival_menus, festival_menu_items | SELECT published only | ALL |
| delivery_areas | SELECT active only | ALL |
| orders, order_items | **nothing** — no read, no direct insert (RPC only) | ALL |
| enquiries | INSERT only (`status = 'new'`), no read-back | ALL |

Smoke-tested 2026-07-23: nested selects, category filter, both RPCs, order maths (subtotal/fee/total, variant labels, line notes), lead-time + blackout + min-qty rejections, and all six RLS denials — all pass; test rows deleted.

### Data access layer — `lib/queries.ts` (all server-side, all typed)

Public (anon client, RLS applies):
```ts
getCategories(): Promise<Category[]>
getMenuItems(options?: { categorySlug?: string; heroOnly?: boolean }): Promise<MenuItemFull[]>
getMenuItemBySlug(slug: string): Promise<MenuItemFull | null>
getHeroItems(): Promise<MenuItemFull[]>
getDateAvailability(fromDate: string, toDate: string): Promise<DateAvailability[]>   // ISO dates, inclusive
getPublishedFestivals(): Promise<FestivalMenu[]>
getFestivalBySlug(slug: string): Promise<FestivalMenuFull | null>
getDeliveryAreas(): Promise<DeliveryArea[]>
createOrder(input: CreateOrderInput): Promise<{ orderId: string; orderNumber: string }>
createEnquiry(input: CreateEnquiryInput): Promise<void>
```

Admin (service-role client — bypasses RLS; call only from authenticated admin routes; needs `SUPABASE_SECRET_KEY` in env, currently unset):
```ts
adminGetOrders(filter?: { status?: OrderStatus; deliveryDate?: string }): Promise<OrderFull[]>
adminGetOrderByNumber(orderNumber: string): Promise<OrderFull | null>
adminUpdateOrder(orderId: string, patch: { orderStatus?; paymentStatus?; notes? }): Promise<void>
adminUpsertCapacity(date: string, patch: { maxOrders?; isBlackout?; note? }): Promise<void>
adminGetEnquiries(status?: EnquiryStatus): Promise<Enquiry[]>
adminUpdateEnquiryStatus(enquiryId: string, status: EnquiryStatus): Promise<void>
```

Shapes: `MenuItemFull` = row + `category` + `variants[]` + flattened `tags[]` · `FestivalMenuFull` = row + `items[]` (each with `festival_price_paise`) · `OrderFull` = row + `items[]` + `area`. Clients come from `lib/supabase.ts` (`createPublicClient` / `createAdminClient`); env in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`).

---

## 6. Phase checklist

- [x] **Phase 0 — Scaffold**: Next.js 15.5 (App Router, TS strict) + Tailwind v4, tokens as CSS variables in `app/globals.css`, fonts via `next/font` (Bricolage Grotesque, Hanken Grotesk), ESLint + Prettier, folder structure (`app/`, `components/ui/`, `components/sections/`, `lib/`, `types/`, `supabase/`). Vercel project still pending.
- [x] **Phase 1 — Design system**: tokens + primitives built and rendered at **`/styleguide`** (all states). Date Coin, capacity chips, product card and date strip are composites deferred to Phase 4 where their data shape exists — the atoms they compose (Badge, Card, type/price styles) are done. See §7 Component inventory.
- [~] **Phase 2 — Static site**: **homepage DONE** (live data, all seven sections, real copy) + minimal `/festival/[slug]` built early so the festival strip never 404s. Still pending: `/menu`, `/item/[slug]`, `/about`, `/faq`. **Real food photography is now the single highest-leverage visual task** — `FoodImage` renders branded plate placeholders until `image_url` is set, then swaps automatically.
- [x] **Phase 3 — Database**: Supabase project `plate-date` (ap-south-1) live; migration + RLS + RPCs applied and smoke-tested with the anon key; realistic 14-item seed loaded; generated types in `types/database.ts`; typed query layer in `lib/queries.ts`. Outstanding for Phase 7: `SUPABASE_SECRET_KEY` in `.env.local` (dashboard → API keys); create Rhea's admin auth user; **disable public signups in Supabase Auth settings (dashboard → Auth → Providers)** — RLS treats every authenticated user as admin, so this is mandatory before launch. Security advisors reviewed 2026-07-23: all WARNs are the intentional single-admin policies + the two deliberately-public RPCs.
- [~] **Phase 4 — Date engine**: **calendar + filtering DONE** — month-view ARIA-grid calendar reading live capacity (four day states + festival gold rings + explained disabled dates), date-filtered menu with hidden-item count, Date Coin shipped everywhere (calendar selection, menu header, cards, qty sheet). Keyboard + SR behaviour verified by scripted Playwright test. Still pending: shareable `/date/[yyyy-mm-dd]` pages.
- [x] **Phase 5 — Ordering**: session-scoped date-locked cart, one-page Zod-validated checkout, hardened `create_order` RPC v2 (short `PD-XXXXX` reference, payment method, ₹500 minimum, capacity recheck under advisory lock), UPI (VPA + QR) / cash payment behind a `PaymentProvider` interface, public confirmation page at `/order/[reference]` via a limited RPC (no PII), and the `/party` bulk/party enquiry flow. Full happy-path + privacy verified by scripted Playwright e2e. See §9 Ordering flow. Pending: real UPI VPA + WhatsApp number before launch.
- [ ] **Phase 6 — Occasions**: festival menus (`/festival/[slug]`), Paryushan content, `/party` enquiry flow.
- [ ] **Phase 7 — Kitchen admin**: auth, today's board, order status flow, capacity calendar editor, menu editor, enquiries inbox.
- [ ] **Phase 8 — Launch polish**: Android/IG-in-app-browser performance pass, image optimisation, local SEO + LocalBusiness/Product schema, analytics, WhatsApp deep links, swap Instagram bio link.

---

## 7. Component inventory (Phase 1)

All in `components/ui/` (barrel export from `components/ui/index.ts`); `cn()` helper in `lib/cn.ts`. Every component extends the native element's props (`ComponentPropsWithRef`) unless noted. Focus ring is global (`:focus-visible` → 2px gold, offset 2). All animation collapses under `prefers-reduced-motion`.

| Component | Props beyond native | Notes |
|---|---|---|
| `Button` | `variant?: "primary" \| "secondary" \| "ghost"` (default `primary`) · `size?: "sm" \| "md" \| "lg"` (default `md`) · `loading?: boolean` | Heights 44/48/56px. `sm` is dense-admin only; customer flows use md/lg (≥48px). `loading` disables + spinner + `aria-busy`. Primary is berry → berry-deep on hover/active. |
| `Input` | `error?: boolean` | 48px tall. `error` sets berry border + `aria-invalid`; pair with your own message via `aria-describedby`. |
| `Select` | `error?: boolean` | Native select, custom chevron (currentColor SVG), 48px tall. |
| `Textarea` | `error?: boolean` | min-height 7rem. |
| `Badge` | `variant?: "tag" \| "ring" \| "muted"` (default `tag`) | `tag` = blush/berry (dietary tags) · `ring` = gold outline (festival, few-slots) · `muted` = 8% plum (contains-nuts, closed). Pill radius. |
| `Card` | `padded?: boolean` (default `true`) | Porcelain, `--radius-lg`, `--shadow-card`, hairline plum border. |
| `Dialog` | `open: boolean` · `onClose: () => void` · `title?: string` · `className?` (not native-extending) | Native `<dialog>.showModal()` — platform focus trap, Esc, focus return. Backdrop click closes. Scrim + entrance animation from globals. |
| `Sheet` | Same as Dialog + `side?: "bottom" \| "right"` (default `bottom`) | Bottom sheet (mobile) / right drawer (desktop). Built-in close button (44px). |
| `ToastProvider` / `useToast()` | `toast(message, { variant?: "default" \| "error", duration? })` | Provider mounted in root layout. Plum bg + gold hairline ring; error = `role="alert"` + ⚠ glyph — wording, not hue (palette rule 3). Auto-dismiss 4s + manual dismiss. |
| `Skeleton` | — | Blush pulse, `aria-hidden`; pulse stops under reduced motion. |

### Homepage additions (Phase 2/4)

| Component | Props | Notes |
|---|---|---|
| `DateCoin` (`ui/`) | `dateISO` · `size?: "sm" \| "md" \| "lg"` | **The signature element** — berry disc + 1px gold ring + date. `role="img"` with full-date label. Sole all-caps exception (day/month labels). |
| `FoodImage` (`ui/`) | `name` · `imageUrl: string \| null` | Real photo when set; branded plate placeholder otherwise. Never AI-faked food. |
| `DatePicker` (`sections/`) | `todayISO, maxISO, availability, festivals, minLeadHours, selected, onSelect` | Month-view ARIA grid: roving tabindex, arrows/Home/End/PageUp/Down/Enter, `aria-selected`/`aria-disabled`, live detail line that explains disabled dates on tap. States: available / almost-full dot / full strikethrough / closed dotted / too-soon faded / festival gold ring / selected berry disc. |
| `MenuSection` (`sections/`) | `items, todayISO, selectedDate, onClearDate` | Date-filtered, grouped by category; dietary chips (incl. exclusionary "No nuts"); hidden-by-date count; quantity Sheet with variant picker + stepper + Date Coin. |
| `SiteHeader` (`sections/`) | `selectedDate` | Sticky, cart count, right-Sheet cart with steppers + **"Send this order on WhatsApp"** handoff (pre-Phase-5 checkout). |
| `content-sections.tsx` (v3 landing redesign) | — | `HeroOrbit` (display headline with gold-ellipse accent + giant plate-as-date-token with orbiting counter-rotated favourites, floating fact chips, trust marquee), `TrayCarousel` (scroll-snap favourites tray, alternating blush/plum/porcelain cards, quick-add to cart, arrow controls), `CategoryExplorer` (blush promo tile + category rows with counts), `DateBand` (dark plum panel hosting the DatePicker, id `dates`), `StatsStrip`, `FestivalStrip`, `StorySplit` (copy + circular portrait slot with floating mini fact cards, id `story`), `Reviews` (tilted stagger), `WhatsAppBand` (berry CTA band, order + party enquiry, id `party`), `BigFooter` (display wordmark + 4 columns). Header now carries a 4-link anchor nav (md+). |
| `Reveal` (`ui/`) | `delay?: number` (ms stagger) | IntersectionObserver scroll reveal; fires once; instant under reduced motion. |
| `CartProvider` / `useCart` (`lib/cart.tsx`) | `add, setQuantity, remove, lines, count, subtotalPaise` | localStorage-persisted, min-quantity clamped. |
| `lib/dates.ts` | — | IST-anchored ISO date helpers (server and client agree regardless of device TZ). |
| `lib/site.ts` | — | WhatsApp number (**placeholder**), Instagram handle (**placeholder**), FSSAI line (number pending), hours. Collect real values before launch. |

## 9. Ordering flow (Phase 5)

**Routes**: `/checkout` (one page), `/order/[reference]` (public confirmation, `force-dynamic`, `noindex`), `/party` (enquiry). Sub-pages use the shared floating `PageHeader` (`components/sections/page-header.tsx`).

**Cart** (`lib/cart.tsx`, in root layout): **sessionStorage** `plate-date-cart-v2` (order intent should not survive a week). Holds lines + the single `deliveryDate` the order is locked to. `incompatibleFor(iso, today)` returns lines whose lead time a date can't meet; the homepage warns in a Dialog before dropping them on a date change (never silently). Header cart sheet shows steppers, running total, the ₹500 shortfall message ("add ₹X more"), and gates "Go to checkout" on non-empty + minimum met + date chosen.

**Checkout** (`app/checkout/`): client form + `placeOrder` server action. Both validate with the **same Zod schema** (`lib/schemas.ts`, `checkoutSchema`) — Indian-mobile normalisation (+91/0 stripped, `[6-9]\d{9}`), area/slot/address/payment. The server **never trusts the client**: it re-parses, then `create_order` re-prices every line from DB, re-checks the ₹500 minimum, and re-checks capacity under the per-date advisory lock before insert. On `DATE_FULL`/`DATE_CLOSED` it fails gracefully and offers the next open date (`findNextAvailableDate`). Totals are recomputed server-side; the browser's total is display-only.

**Payments** (`lib/payments.ts`): `PaymentProvider` interface, current impl `ManualUpiProvider` (UPI via `upi://pay` deep link + QR from `qrcode`, or cash). Razorpay drops in as a new provider with no UI rewrite. UPI VPA/payee in `lib/site.ts` (**placeholder**).

**Reference codes**: `create_order` generates `PD-` + 5 chars from a no-ambiguous alphabet (`23456789ABCDEFGHJKMNPQRSTUVWXYZ`), collision-retried. Internal `order_number` (`PD-YYMMDD-nnnn`) still exists for Rhea's own sequencing.

**Confirmation privacy**: `/order/[reference]` reads via `get_order_by_reference` RPC (security definer) which returns only summary fields — **no phone, email, or street address**. Anyone with the reference (including Rhea) sees the order; nobody sees another customer's PII. Verified: e2e confirmed phone/address absent from the page HTML. The page's primary CTA is the prefilled `wa.me` link carrying reference + item summary — Rhea's real confirmation loop.

**Party/bulk** (`app/party/`): separate `enquirySchema`, `submitEnquiry` action → `enquiries` table (anon INSERT only). Never touches the cart.

## 10. Product images & Vercel deployment

**Images**: Rhea's 13 product photos (2048² PNGs, source in `Images/` which is **gitignored**) were converted to **1200² WebP q80** in `public/menu/<slug>.webp` (~127 KB avg, 1.7 MB total) via `convert-images.mjs` (also gitignored). `menu_items.image_url` points at `/menu/<slug>.webp` (set in DB and appended to `seed.sql`). `FoodImage` shows the photo when `image_url` is set, else the branded plate placeholder. **All 14 items now have photos** (High-Tea Platter added 2026-07-24). Regenerate after new photos: put PNGs in `Images/`, run `node convert-images.mjs`, then re-run the image UPDATE from `seed.sql`.

**Note on local ISR cache**: the homepage/menu are `revalidate = 300`, so after changing `image_url` (or any menu data) in the DB, a *local* `npm run build` may serve stale cached data — `rm -rf .next` before rebuilding. Vercel builds fresh every deploy, so this never affects production.

**Deploy (Vercel)**:
- Secrets are clean: `.env*` is gitignored; source only reads env via `required(...)` — no key value is hardcoded anywhere (verified). The `NEXT_PUBLIC_*` values (project URL + publishable key) are public by design; the **`SUPABASE_SECRET_KEY` is server-only** and must never be `NEXT_PUBLIC_`.
- **Set these 3 env vars in the Vercel project** (Production + Preview), values from `.env.local`:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
- Framework auto-detected (Next.js 15, App Router); build `next build`, no `images.remotePatterns` needed (photos are local `/public`, served via plain `<img>`).
- Before go-live also set the real values in `lib/site.ts` (WhatsApp number, Instagram, FSSAI, UPI VPA) and `metadataBase` in `app/layout.tsx`; disable public signups in Supabase Auth (see §5).

## 8. Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-07-23 | **Date is a filter, not a gate.** Original hero made the date picker the front door; revised so food + trust render first and the date re-annotates the menu in place. | The 40–60 buyer came from an Instagram food photo; an empty calendar before food kills conversion. Thesis survives — the date still drives IA and availability. |
| 2026-07-23 | **Gold is a ring, never a fill; never text on light bg.** | Derived from the logo (gold exists only as the disc's ring); also fails contrast as text (~2.2:1). |
| 2026-07-23 | **Berry only on transactional elements.** | Makes "what is tappable" legible to a less web-native buyer; keeps the brand colour meaningful. |
| 2026-07-23 | Body face Inter → **Hanken Grotesk**, base 17px. | Inter was a default reflex; Hanken is warmer, same legibility class, better at 17px for older readers. |
| 2026-07-23 | Display face **Bricolage Grotesque**, 2 weights, sentence case only. | Round counters echo the logo disc; serif display is both the banned AI-default look and wrong for the audience. |
| 2026-07-23 | **No payment gateway in v1** — UPI instructions + WhatsApp confirmation. | Zero gateway fees (the whole site exists to escape commission); matches how her customers already pay. Revisit if manual reconciliation hurts. |
| 2026-07-23 | **No customer accounts in v1.** | Friction must be below Zomato's; her CRM is WhatsApp. Phone number on the order is enough. |
| 2026-07-23 | **Snapshot item name + price on order lines.** | Menu edits and festival pricing must never rewrite order history. |
| 2026-07-23 | Party/bulk = **enquiry form, not cart**. | Those orders are negotiated (menu, budget, delivery); a form → WhatsApp conversation converts better than a forced checkout. |
| 2026-07-23 | Capacity table stores **overrides only**; slots-used always computed. | Rhea shouldn't have to seed 365 rows; counters drift, counts don't. |
| 2026-07-23 | **Default Tailwind palettes wiped** (`--color-*: initial`, `--text-*`, `--shadow-*`, `--radius-*`, sans/serif/mono in `@theme`). | Structurally enforces "no hardcoded hex / no untokened styles" — `bg-red-500` or `text-xl` literally don't compile. Tokens in `globals.css` are the only vocabulary. |
| 2026-07-23 | **No UI library** — Dialog/Sheet ride native `<dialog>`; Toast is a ~90-line context. | Platform gives focus trap, Esc, inert background and focus-return for free; keeps first-load JS small for Android/IG in-app browser (styleguide page: 129 kB total). |
| 2026-07-23 | **Named spacing tokens** `--spacing-gutter/stack/section/hero` on top of the numeric scale. | Section rhythm stays consistent across pages without magic numbers. |
| 2026-07-23 | **Toasts carry no status hue** — plum bg + gold hairline for all; error = `role="alert"` + ⚠ glyph. | Extends palette rule 3 (worded, never colour-only) and keeps berry reserved for transactional elements. |
| 2026-07-23 | **Button `sm` is 44px** and documented as dense-admin-only. | Keeps three sizes as briefed without licensing sub-48px targets in customer flows. |
| 2026-07-23 | `tailwind-merge` extended with the custom type scale (`text-hero` … `text-price`). | Otherwise it can't tell `text-body` (size) from `text-berry` (colour) and silently drops classes on merge. |
| 2026-07-23 | Styleguide lives at **`/styleguide`** (checklist originally said `/dev/kit`). | Matches the client's requested route name. |
| 2026-07-23 | **Money moved from whole rupees to integer paise** (`price_paise` etc.), per client instruction. | Integer paise can represent any future price (₹12.50 delivery split, partial refunds) with zero float risk; ÷100 happens only in `formatPaise()`. |
| 2026-07-23 | **Postgres enums** for order/payment/enquiry status instead of text + CHECK. | Client asked for enums; generated TS types become string unions for free. |
| 2026-07-23 | **Orders are created ONLY via the `create_order` RPC** — no direct anon INSERT policy on orders/order_items. | Stronger than the brief: capacity, lead time, min-qty and pricing are enforced in one transaction server-side; a tampered client can't invent prices or overbook a date. Also sidesteps PostgREST's need for SELECT policies on INSERT…RETURNING. |
| 2026-07-23 | **Advisory lock per delivery date** inside `create_order`. | Two simultaneous checkouts must not both take the last slot; a per-date `pg_advisory_xact_lock` serialises just that date. |
| 2026-07-23 | **Default daily capacity = 6** lives as a constant in the two RPCs, not a config table. | One number, two call sites, changes with a migration; a config table for one value is ceremony. Revisit if Rhea needs to tune it herself. |
| 2026-07-23 | Supabase region **ap-south-1 (Mumbai)**, free tier ($0/month confirmed). | Closest region to Kolkata customers; org's other projects sit in ap-northeast but latency matters more than co-location. |
| 2026-07-23 | `menu_item_variants` kept (not in the client's column list, was in the original schema). | Cakes genuinely sell as ½kg/1kg and tiramisu as two tub sizes; order lines snapshot "name — variant label" so history stays flat. |
| 2026-07-23 | Enquiry `budget` stored as `budget_paise` int. | The money rule has no exceptions. |

| 2026-07-23 | **Month-view calendar supersedes the planned 14-day strip**, per client instruction. | Client called it the signature interaction and asked for a full month view. Cost: the first visible week is mostly muted past days — mitigated by auto-focusing the first selectable date and a worded legend. |
| 2026-07-23 | **"Filling up" = ≤ 2 slots remaining** (computed live from `get_date_availability`). | Matches Rhea's own phrasing on her capacity note ("only 2 slots left"); one constant in `DatePicker`. |
| 2026-07-23 | **Nuts chip is exclusionary ("No nuts")** rather than filtering *to* nut items. | Nobody filters a menu to find allergens; they filter to avoid them. Other chips require the tag; this one excludes it. |
| 2026-07-23 | **Cart hands off to WhatsApp** ("Send this order on WhatsApp") until Phase 5 checkout; party CTA likewise points to WhatsApp until `/party` exists (Phase 6). | Functional today and matches how her customers already buy; no dead buttons, no fake checkout. |
| 2026-07-23 | **No AI-generated food photography.** Cards render a branded plate placeholder until Rhea's real photos land. | Fake photos of "her" tiramisu on a trust-first brand would be dishonest; the placeholder is clearly a brand mark, not a dish. |
| 2026-07-23 | **OG share image generated via Canva MCP** (`public/og.png`, design DAHQOXjFxME in the connected Canva account). Magic/21st.dev MCP excluded per client; its endpoint was also erroring. | Canva used where it genuinely fits (brand art), not for UI code — the token system stays authoritative. Set `metadataBase` when the domain exists (Phase 8). |

| 2026-07-23 | **Motion layer is CSS-first with zero new dependencies** (IO reveals, keyframe floats/pops, one marquee); no Motion/GSAP. | The audience is Android IG-in-app browsers; homepage stays at 140 kB first-load. Every animation is motivated and collapses under reduced motion. |
| 2026-07-23 | **Client asked for cute/aesthetic motion referencing a cream-multicolor food template + bytesofjoy.vercel.app.** Adopted the *patterns* (tilted floating tiles, sticker, marquee, stats row, staggered reveals, tilted testimonials) while keeping the locked berry/blush/gold palette. | The reference's cream+multicolor look is the exact aesthetic the brief bans; energy translated, palette held. |
| 2026-07-23 | **design-taste skill constraints adopted**: em/en-dashes purged from all visible copy (including the festival hero copy in the DB and seed), separators rationed, hero cut to headline + one ≤20-word sub, equal-card trios replaced (WhyDirect → 1+2 bento; Reviews → tilted stagger). | The skill's AI-tell audit caught real templated patterns in v1; CLAUDE.md copy rules updated to match (§2). |
| 2026-07-23 | **Brand sticker** = spinning circular text ("plate date ♥") around today's Date Coin, overlapping the hero band. | The reference's "20% off" sticker energy, rebuilt from the logo's own geometry and heart mark; aria-hidden decoration. |
| 2026-07-23 | **Stats strip claims are all literally true** (100% eggless; 6 plates/day = the capacity default; 0 app commission). | Cute numbers only work for a trust-first brand if none of them are invented. |

| 2026-07-23 | **v3 full structural redesign of the homepage** on client instruction ("complete redesign, don't follow CLAUDE.md layout, keep the colors"): new anatomy is header-nav → orbit hero → favourites tray → category explorer → dark date band → menu → stats → festival → story split → reviews → berry WhatsApp band → big footer. §3's original wireframe is superseded for the homepage; tokens, palette rules, copy rules, and the date-engine components all carried over unchanged. | Client wanted full landing-page energy (Foody template + bytesofjoy references). The date picker remains the centrepiece, now staged in its own dark band; the hero's giant plate literally renders today as a date token, restating the thesis visually. |
| 2026-07-23 | **Display type tokens added** (`--text-display` 42px, `--text-display-lg` 68px) for the redesign's headline scale. | The original 32px hero cap was right for a utility page, too quiet for a landing hero; tokens extended rather than hardcoding sizes. |
| 2026-07-23 | **Tray quick-add uses base price/variant** (no sheet); full variant/quantity flow stays on menu cards. | One-tap add suits a favourites carousel; anything configurable is one scroll away in the menu. |

| 2026-07-23 | **v3.1 polish on client feedback** — real logo integrated (`public/logo.png`, `<Logo>`), palette warmed with cream/butter neutrals, food placeholders varied (4 tints + garnish), and the **menu rebuilt from a uniform grid into an explorer**: sticky-feel category tabs (gold underline), a full-width "Chef's pick" featured banner (the top hero of the active view), and richer cards (image zoom on hover, overhanging gold-ringed price coin, Chef's-pick badge, earliest-ready Date Coin). | Client: "colours feel off, make it playful + premium; menu shouldn't feel like a list." The tabs + featured banner + tinted plates kill the list/grid monotony; cream + gold add the premium warmth; logo makes it unmistakably Rhea's. |
| 2026-07-23 | **Em-dashes purged from menu/product copy too** (DB `menu_items.description`, `dietary_tags.name`, `capacity.note`, and `seed.sql`), not just marketing microcopy. | Consistency with the no-em-dash rule; the tiramisu description rendered one in the new featured banner. |

| 2026-07-24 | **Header redesigned to a floating pill** (rounded, shadowed, backdrop-blur) with a two-line logo lockup (real logo + "plate date" / "BY RHEA JAITHA"), nav as hover-pills. | Client: old nav "looks so old" and logo text felt off. The pill + lockup reads premium and matches the rounded-2rem section language. Shared as `PageHeader` across sub-pages. |
| 2026-07-24 | **Cart is sessionStorage, not localStorage**, and is **date-locked**: one `deliveryDate` for the whole order; changing it warns before dropping lead-time-incompatible items. | Per brief. Order intent is a session thing, not a week-long thing; silent item removal on a date change would lose orders and trust. |
| 2026-07-24 | **Orders created only via `create_order` RPC; total is recomputed server-side from DB prices** and the ₹500 minimum + capacity are re-checked under an advisory lock at insert time. The browser total is display-only. | Never trust the client. Also closes the "filled up while typing" race with a real "next open date" message. |
| 2026-07-24 | **Payments behind a `PaymentProvider` interface** (`ManualUpiProvider` now: UPI deep-link + QR, or cash). | Razorpay becomes a new provider later with zero UI rewrite, as the brief requires. |
| 2026-07-24 | **Short public reference `PD-XXXXX`** (ambiguity-free alphabet) is the confirmation key; a dedicated security-definer RPC returns summary-only fields. | Human-readable for WhatsApp; the page is publicly reachable by reference (so Rhea can open it too) but exposes no phone/email/address. |
| 2026-07-24 | **Minimum order = ₹500** (`MIN_ORDER_PAISE` / `v_min_order_paise`), duplicated in TS and SQL by necessity, each commented to keep in sync. | A cloud kitchen can't profitably deliver a single ₹250 item; enforced in both the cart UI and the RPC. |

| 2026-07-24 | **Real product photos wired**: 13 client PNGs → 1200² WebP q80 in `public/menu/`, `image_url` set in DB + `seed.sql`. Source `Images/` + `convert-images.mjs` gitignored (100 MB of PNGs must not ship). | WebP at ~127 KB each (vs ~8 MB PNGs) keeps the Android/IG-browser load fast; plain `<img>` + lazy is enough, no next/image needed for local assets. High-Tea Platter has no photo → placeholder. |
| 2026-07-24 | **Header/footer logo → crisp 256² `logo-mark.png`**; hero copy no longer uses opacity-0 entrance (guaranteed visible); hero grid top-aligned. | The 1080² master at 44px was a ~24× downscale (blurry); the fade-in could strand the headline invisible on a stale build. |
| 2026-07-24 | **Deploy-readiness verified**: `.env*` gitignored, zero hardcoded secrets in source, 3 env vars documented for Vercel. | Prevents the classic `SUPABASE_SECRET_KEY` leak; publishable/anon key is intentionally public. |

Add a dated row here for every non-obvious decision made in later sessions.
