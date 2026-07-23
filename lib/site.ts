/**
 * Site-wide contact facts. Placeholders are marked — collect the real
 * values from Rhea before launch (Phase 8 checklist).
 */

// TODO(launch): Rhea's real WhatsApp business number (country code, no +)
export const WHATSAPP_NUMBER = "919830000000";

// TODO(launch): confirm handle
export const INSTAGRAM_URL = "https://instagram.com/platedate.kolkata";
export const INSTAGRAM_HANDLE = "@platedate.kolkata";

// TODO(launch): add the licence number to this line once Rhea shares it
export const FSSAI_LINE = "FSSAI-registered home kitchen";

export const HOURS_LINE =
  "Wednesday to Monday, 10 am to 7 pm · closed Tuesdays";

/** keep in sync with v_min_order_paise in the create_order RPC */
export const MIN_ORDER_PAISE = 50000;

export const DELIVERY_SLOTS = ["11 am to 2 pm", "4 pm to 7 pm"] as const;
export type DeliverySlot = (typeof DELIVERY_SLOTS)[number];

// TODO(launch): Rhea's real UPI VPA
export const UPI_VPA = "rheajaitha@okhdfcbank";
export const UPI_PAYEE_NAME = "Plate Date";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
