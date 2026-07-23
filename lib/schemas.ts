import { DELIVERY_SLOTS } from "@/lib/site";
import { z } from "zod";

/** accepts 98300 12345, +91 98300 12345, 09830012345; normalises to 10 digits */
export const indianMobile = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)/, ""))
  .pipe(
    z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number"),
  );

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Tell us your name")
    .max(80, "That name looks too long"),
  phone: indianMobile,
  email: z
    .string()
    .trim()
    .max(120)
    .email("That email does not look right")
    .optional()
    .or(z.literal("")),
  areaId: z.string().uuid("Choose your delivery area"),
  address: z
    .string()
    .trim()
    .min(10, "Give us the full address, landmark included")
    .max(400),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a delivery date"),
  deliverySlot: z.enum(DELIVERY_SLOTS, { message: "Pick a delivery slot" }),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(["upi", "cod"], {
    message: "Choose how you want to pay",
  }),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1, "Your plate is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const enquirySchema = z.object({
  kind: z.enum(["party", "bulk"], { message: "Pick what this is for" }),
  name: z.string().trim().min(2, "Tell us your name").max(80),
  phone: indianMobile,
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick the event date")
    .optional()
    .or(z.literal("")),
  headcount: z.number().int().min(1).max(2000).optional(),
  budgetPaise: z.number().int().min(0).optional(),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
