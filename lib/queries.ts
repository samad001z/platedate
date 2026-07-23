/**
 * Typed server-side data access for Plate Date.
 *
 * Public functions use the anon client (RLS applies): catalogue reads,
 * availability, order creation via the create_order RPC, enquiry creation.
 * admin* functions use the service-role client (bypasses RLS) and must only
 * be called from authenticated admin routes.
 *
 * All money values are integer paise.
 */
import { createAdminClient, createPublicClient } from "@/lib/supabase";
import type { Database, Tables } from "@/types/database";

export type Category = Tables<"categories">;
export type MenuItem = Tables<"menu_items">;
export type MenuItemVariant = Tables<"menu_item_variants">;
export type DietaryTag = Tables<"dietary_tags">;
export type CapacityRow = Tables<"capacity">;
export type FestivalMenu = Tables<"festival_menus">;
export type DeliveryArea = Tables<"delivery_areas">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type Enquiry = Tables<"enquiries">;

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type EnquiryStatus = Database["public"]["Enums"]["enquiry_status"];
export type EnquiryKind = Database["public"]["Enums"]["enquiry_kind"];

export type MenuItemFull = MenuItem & {
  category: Category;
  variants: MenuItemVariant[];
  tags: DietaryTag[];
};

export type FestivalMenuFull = FestivalMenu & {
  items: (MenuItemFull & { festival_price_paise: number | null })[];
};

export type OrderFull = Order & {
  items: OrderItem[];
  area: DeliveryArea | null;
};

export type DateAvailability = {
  day: string; // yyyy-mm-dd
  is_blackout: boolean;
  max_orders: number;
  orders_booked: number;
};

const MENU_ITEM_SELECT =
  "*, category:categories(*), variants:menu_item_variants(*), tag_rows:menu_item_dietary_tags(dietary_tag:dietary_tags(*))";

type RawMenuItem = MenuItem & {
  category: Category;
  variants: MenuItemVariant[];
  tag_rows: { dietary_tag: DietaryTag | null }[];
};

function toMenuItemFull(row: RawMenuItem): MenuItemFull {
  const { tag_rows, ...rest } = row;
  return {
    ...rest,
    variants: [...row.variants].sort((a, b) => a.sort_order - b.sort_order),
    tags: tag_rows
      .map((t) => t.dietary_tag)
      .filter((t): t is DietaryTag => t !== null),
  };
}

function fail(op: string, error: { message: string }): never {
  throw new Error(`[queries.${op}] ${error.message}`);
}

/* ------------------------------------------------------------------ */
/* public: catalogue                                                  */
/* ------------------------------------------------------------------ */

export async function getCategories(): Promise<Category[]> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) fail("getCategories", error);
  return data;
}

export async function getMenuItems(options?: {
  categorySlug?: string;
  heroOnly?: boolean;
}): Promise<MenuItemFull[]> {
  const db = createPublicClient();
  let query = db
    .from("menu_items")
    .select(
      options?.categorySlug
        ? MENU_ITEM_SELECT.replace("categories(*)", "categories!inner(*)")
        : MENU_ITEM_SELECT,
    )
    .eq("is_active", true)
    .order("sort_order");
  if (options?.categorySlug) {
    query = query.eq("category.slug", options.categorySlug);
  }
  if (options?.heroOnly) {
    query = query.eq("is_hero", true);
  }
  const { data, error } = await query;
  if (error) fail("getMenuItems", error);
  return (data as unknown as RawMenuItem[]).map(toMenuItemFull);
}

export async function getMenuItemBySlug(
  slug: string,
): Promise<MenuItemFull | null> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("menu_items")
    .select(MENU_ITEM_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) fail("getMenuItemBySlug", error);
  return data ? toMenuItemFull(data as unknown as RawMenuItem) : null;
}

export async function getHeroItems(): Promise<MenuItemFull[]> {
  return getMenuItems({ heroOnly: true });
}

/* ------------------------------------------------------------------ */
/* public: dates                                                      */
/* ------------------------------------------------------------------ */

/** Inclusive range, ISO dates (yyyy-mm-dd). Powers the hero date strip. */
export async function getDateAvailability(
  fromDate: string,
  toDate: string,
): Promise<DateAvailability[]> {
  const db = createPublicClient();
  const { data, error } = await db.rpc("get_date_availability", {
    p_from: fromDate,
    p_to: toDate,
  });
  if (error) fail("getDateAvailability", error);
  return data;
}

/* ------------------------------------------------------------------ */
/* public: festivals & delivery                                       */
/* ------------------------------------------------------------------ */

export async function getPublishedFestivals(): Promise<FestivalMenu[]> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("festival_menus")
    .select("*")
    .eq("is_published", true)
    .order("starts_on");
  if (error) fail("getPublishedFestivals", error);
  return data;
}

export async function getFestivalBySlug(
  slug: string,
): Promise<FestivalMenuFull | null> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("festival_menus")
    .select(
      `*, festival_menu_items(festival_price_paise, sort_order, menu_item:menu_items(${MENU_ITEM_SELECT}))`,
    )
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) fail("getFestivalBySlug", error);
  if (!data) return null;

  type RawFestivalItem = {
    festival_price_paise: number | null;
    sort_order: number;
    menu_item: RawMenuItem | null;
  };
  const { festival_menu_items, ...festival } =
    data as unknown as FestivalMenu & {
      festival_menu_items: RawFestivalItem[];
    };
  return {
    ...festival,
    items: festival_menu_items
      .sort((a, b) => a.sort_order - b.sort_order)
      .filter((fi): fi is RawFestivalItem & { menu_item: RawMenuItem } =>
        Boolean(fi.menu_item?.is_active),
      )
      .map((fi) => ({
        ...toMenuItemFull(fi.menu_item),
        festival_price_paise: fi.festival_price_paise,
      })),
  };
}

export async function getDeliveryAreas(): Promise<DeliveryArea[]> {
  const db = createPublicClient();
  const { data, error } = await db
    .from("delivery_areas")
    .select("*")
    .eq("is_active", true)
    .order("fee_paise");
  if (error) fail("getDeliveryAreas", error);
  return data;
}

/* ------------------------------------------------------------------ */
/* public: writes                                                     */
/* ------------------------------------------------------------------ */

export type CreateOrderInput = {
  customerName: string;
  phone: string;
  email?: string;
  /** yyyy-mm-dd */
  deliveryDate: string;
  deliverySlot: string;
  areaId: string;
  address: string;
  notes?: string;
  paymentMethod: "upi" | "cod";
  items: {
    menuItemId: string;
    variantId?: string;
    quantity: number;
    lineNote?: string;
  }[];
};

/**
 * The only public write path for orders — calls the create_order RPC, which
 * validates capacity, lead times and min quantities, prices every line from
 * the live menu, and snapshots names+prices into order_items.
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<{ orderId: string; orderNumber: string; referenceCode: string }> {
  const db = createPublicClient();
  const args = {
    p_customer_name: input.customerName,
    p_phone: input.phone,
    p_email: input.email ?? null,
    p_delivery_date: input.deliveryDate,
    p_delivery_slot: input.deliverySlot,
    p_area_id: input.areaId,
    p_address: input.address,
    p_notes: input.notes ?? null,
    p_payment_method: input.paymentMethod,
    p_items: input.items.map((item) => ({
      menu_item_id: item.menuItemId,
      variant_id: item.variantId ?? null,
      quantity: item.quantity,
      line_note: item.lineNote ?? null,
    })),
  };
  // generated Args mark every param non-null although the function accepts nulls
  const { data, error } = await db.rpc(
    "create_order",
    args as unknown as Database["public"]["Functions"]["create_order"]["Args"],
  );
  if (error) fail("createOrder", error);
  const row = data[0];
  if (!row) fail("createOrder", { message: "RPC returned no row" });
  return {
    orderId: row.order_id,
    orderNumber: row.order_number,
    referenceCode: row.reference_code,
  };
}

/** limited public shape returned by get_order_by_reference (no phone/address/email) */
export type OrderSummary = {
  reference_code: string;
  customer_name: string;
  created_at: string;
  delivery_date: string;
  delivery_slot: string | null;
  area_name: string | null;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: "upi" | "cod";
  subtotal_paise: number;
  delivery_fee_paise: number;
  total_paise: number;
  items: { name: string; quantity: number; unit_price_paise: number }[];
};

/** public confirmation lookup; safe to call with any user-supplied string */
export async function getOrderByReference(
  reference: string,
): Promise<OrderSummary | null> {
  const db = createPublicClient();
  const { data, error } = await db.rpc("get_order_by_reference", {
    p_reference: reference,
  });
  if (error) fail("getOrderByReference", error);
  return (data as OrderSummary | null) ?? null;
}

export type CreateEnquiryInput = {
  kind: EnquiryKind;
  name: string;
  phone: string;
  /** yyyy-mm-dd */
  eventDate?: string;
  headcount?: number;
  budgetPaise?: number;
  message?: string;
};

export async function createEnquiry(input: CreateEnquiryInput): Promise<void> {
  const db = createPublicClient();
  // no .select(): anon may insert enquiries but never read them back
  const { error } = await db.from("enquiries").insert({
    kind: input.kind,
    name: input.name,
    phone: input.phone,
    event_date: input.eventDate ?? null,
    headcount: input.headcount ?? null,
    budget_paise: input.budgetPaise ?? null,
    message: input.message ?? null,
  });
  if (error) fail("createEnquiry", error);
}

/* ------------------------------------------------------------------ */
/* admin (service role — authenticated admin routes only)             */
/* ------------------------------------------------------------------ */

const ORDER_SELECT = "*, items:order_items(*), area:delivery_areas(*)";

export async function adminGetOrders(filter?: {
  status?: OrderStatus;
  deliveryDate?: string;
}): Promise<OrderFull[]> {
  const db = createAdminClient();
  let query = db
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });
  if (filter?.status) query = query.eq("order_status", filter.status);
  if (filter?.deliveryDate)
    query = query.eq("delivery_date", filter.deliveryDate);
  const { data, error } = await query;
  if (error) fail("adminGetOrders", error);
  return data as unknown as OrderFull[];
}

export async function adminGetOrderByNumber(
  orderNumber: string,
): Promise<OrderFull | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) fail("adminGetOrderByNumber", error);
  return data as unknown as OrderFull | null;
}

export async function adminUpdateOrder(
  orderId: string,
  patch: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    notes?: string;
  },
): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("orders")
    .update({
      ...(patch.orderStatus && { order_status: patch.orderStatus }),
      ...(patch.paymentStatus && { payment_status: patch.paymentStatus }),
      ...(patch.notes !== undefined && { notes: patch.notes }),
    })
    .eq("id", orderId);
  if (error) fail("adminUpdateOrder", error);
}

export async function adminUpsertCapacity(
  date: string,
  patch: { maxOrders?: number; isBlackout?: boolean; note?: string | null },
): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from("capacity").upsert({
    date,
    ...(patch.maxOrders !== undefined && { max_orders: patch.maxOrders }),
    ...(patch.isBlackout !== undefined && { is_blackout: patch.isBlackout }),
    ...(patch.note !== undefined && { note: patch.note }),
  });
  if (error) fail("adminUpsertCapacity", error);
}

export async function adminGetEnquiries(
  status?: EnquiryStatus,
): Promise<Enquiry[]> {
  const db = createAdminClient();
  let query = db
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) fail("adminGetEnquiries", error);
  return data;
}

export async function adminUpdateEnquiryStatus(
  enquiryId: string,
  status: EnquiryStatus,
): Promise<void> {
  const db = createAdminClient();
  const { error } = await db
    .from("enquiries")
    .update({ status })
    .eq("id", enquiryId);
  if (error) fail("adminUpdateEnquiryStatus", error);
}
