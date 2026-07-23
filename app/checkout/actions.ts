"use server";

import { addDaysISO, longDate, todayISTISO } from "@/lib/dates";
import { formatPaise } from "@/lib/money";
import { checkoutSchema } from "@/lib/schemas";
import { createOrder, getDateAvailability } from "@/lib/queries";
import { createPublicClient } from "@/lib/supabase";

export type PlaceOrderResult =
  | { ok: true; reference: string }
  | { ok: false; message: string; nextAvailableDate?: string };

/**
 * The server never trusts the client: input is re-validated with the same
 * Zod schema, and the create_order RPC re-prices every line from database
 * prices and re-checks capacity under a lock before inserting.
 */
export async function placeOrder(input: unknown): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      message: first?.message ?? "Check the form and try again.",
    };
  }
  const data = parsed.data;

  try {
    const result = await createOrder({
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || undefined,
      deliveryDate: data.deliveryDate,
      deliverySlot: data.deliverySlot,
      areaId: data.areaId,
      address: data.address,
      notes: data.notes || undefined,
      paymentMethod: data.paymentMethod,
      items: data.items,
    });
    return { ok: true, reference: result.referenceCode };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return mapOrderError(message, data);
  }
}

async function mapOrderError(
  raw: string,
  data: { deliveryDate: string; items: { menuItemId: string }[] },
): Promise<PlaceOrderResult> {
  if (raw.includes("DATE_FULL") || raw.includes("DATE_CLOSED")) {
    const closed = raw.includes("DATE_CLOSED");
    const next = await findNextAvailableDate(data);
    return {
      ok: false,
      message: closed
        ? `The kitchen is closed on ${longDate(data.deliveryDate)}.`
        : `${longDate(data.deliveryDate)} filled up while you were ordering. Every day has a fixed number of plate dates, and the last one just went.`,
      nextAvailableDate: next ?? undefined,
    };
  }
  const minOrder = raw.match(/MIN_ORDER:(\d+)/);
  if (minOrder) {
    return {
      ok: false,
      message: `Add ${formatPaise(Number(minOrder[1]))} more to reach the minimum order.`,
    };
  }
  const leadTime = raw.match(/LEAD_TIME:(.+?)(?:"|$)/);
  if (leadTime) {
    return {
      ok: false,
      message: `${leadTime[1]} needs more notice than this date allows. Pick a later date or remove it.`,
    };
  }
  const minQty = raw.match(/MIN_QTY:(.+?)(?:"|$)/);
  if (minQty) {
    return {
      ok: false,
      message: `${minQty[1]} has a minimum quantity. Increase it in your order.`,
    };
  }
  if (raw.includes("PHONE_INVALID")) {
    return { ok: false, message: "Enter a 10-digit Indian mobile number." };
  }
  if (raw.includes("ITEM_UNAVAILABLE")) {
    return {
      ok: false,
      message:
        "Something in your order is no longer on the menu. Remove it and try again.",
    };
  }
  if (raw.includes("AREA_INVALID")) {
    return { ok: false, message: "Choose your delivery area again." };
  }
  return {
    ok: false,
    message:
      "The order did not go through. Nothing was charged, try again in a moment.",
  };
}

/** first non-blackout day with a free slot that also satisfies the cart's longest lead time */
async function findNextAvailableDate(data: {
  deliveryDate: string;
  items: { menuItemId: string }[];
}): Promise<string | null> {
  const db = createPublicClient();
  const { data: leadRows } = await db
    .from("menu_items")
    .select("lead_time_hours")
    .in(
      "id",
      data.items.map((i) => i.menuItemId),
    );
  const maxLead = Math.max(
    24,
    ...(leadRows ?? []).map((r) => r.lead_time_hours),
  );
  const today = todayISTISO();
  const from = addDaysISO(today, Math.ceil(maxLead / 24));
  const availability = await getDateAvailability(from, addDaysISO(today, 45));
  const next = availability.find(
    (d) =>
      !d.is_blackout &&
      Number(d.orders_booked) < d.max_orders &&
      d.day !== data.deliveryDate,
  );
  return next?.day ?? null;
}
