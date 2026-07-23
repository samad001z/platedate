"use server";

import { enquirySchema } from "@/lib/schemas";
import { createEnquiry } from "@/lib/queries";

export type EnquiryResult = { ok: true } | { ok: false; message: string };

export async function submitEnquiry(input: unknown): Promise<EnquiryResult> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      message: first?.message ?? "Check the form and try again.",
    };
  }
  const data = parsed.data;
  try {
    await createEnquiry({
      kind: data.kind,
      name: data.name,
      phone: data.phone,
      eventDate: data.eventDate || undefined,
      headcount: data.headcount,
      budgetPaise: data.budgetPaise,
      message: data.message || undefined,
    });
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "The enquiry did not go through. Try again, or message us on WhatsApp.",
    };
  }
}
