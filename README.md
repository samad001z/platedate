# Plate Date

Direct ordering site for Plate Date, a vegetarian and eggless cloud kitchen in Kolkata. Built to move orders off Zomato and Swiggy and save the kitchen 18 to 30 percent in commission.

## The idea

A home chef sells occasions, not a catalogue. The site is built around one question: **"When's your plate date?"** Pick a date and the menu shows what the kitchen can actually cook that day, based on capacity and advance-notice rules for each item.

## Features

- **Date-aware menu.** Every item has a lead time and daily capacity. The chosen date filters what can be ordered, without hiding the menu behind a gate.
- **Festival menus.** Dedicated pages for seasonal menus such as Paryushan, with no-onion and no-garlic options.
- **Party and bulk orders.** A separate flow for platters and event orders.
- **Checkout.** Server-validated orders with UPI (deep link plus QR code for any UPI app) or cash on delivery. Payments sit behind a provider interface so switching to Razorpay is a one-file change.
- **Order tracking.** Each order gets a reference page the customer can revisit.
- **Mobile first.** Most traffic comes from an Instagram bio link on Android, so the design prioritises large tap targets, clear pricing, and trust signals.

## Tech stack

| Layer | Tools |
| --- | --- |
| App | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Validation | Zod, server actions |
| Data | Supabase Postgres |
| Payments | UPI deep links and QR codes |

All date logic is anchored to Asia/Kolkata, so the server and every device agree on what "today" means.

## Running locally

```bash
npm install
# create .env.local with NEXT_PUBLIC_SUPABASE_URL,
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY
npm run dev
```

Apply the migrations in `supabase/migrations` and load `supabase/seed.sql` for sample menu data.
