/**
 * Payment layer. Everything the UI knows about payments goes through
 * PaymentProvider, so swapping ManualUpiProvider for a Razorpay provider
 * later is a one-line change here, not a rewrite.
 */
import { UPI_PAYEE_NAME, UPI_VPA } from "@/lib/site";

export type PaymentMethod = "upi" | "cod";

export type PaymentInstruction =
  | {
      kind: "upi";
      vpa: string;
      payeeName: string;
      /** upi:// deep link, openable by any UPI app; also the QR payload */
      upiLink: string;
    }
  | { kind: "cod"; note: string };

export interface PaymentProvider {
  id: string;
  methods: readonly PaymentMethod[];
  /** what to show the customer for a chosen method and amount */
  instructionsFor(
    method: PaymentMethod,
    order: { totalPaise: number; reference?: string },
  ): PaymentInstruction;
}

class ManualUpiProvider implements PaymentProvider {
  id = "manual-upi";
  methods = ["upi", "cod"] as const;

  instructionsFor(
    method: PaymentMethod,
    order: { totalPaise: number; reference?: string },
  ): PaymentInstruction {
    if (method === "cod") {
      return {
        kind: "cod",
        note: "Pay in cash when your order arrives. Exact change helps.",
      };
    }
    const amount = (order.totalPaise / 100).toFixed(2);
    const params = new URLSearchParams({
      pa: UPI_VPA,
      pn: UPI_PAYEE_NAME,
      am: amount,
      cu: "INR",
    });
    if (order.reference) params.set("tn", order.reference);
    return {
      kind: "upi",
      vpa: UPI_VPA,
      payeeName: UPI_PAYEE_NAME,
      upiLink: `upi://pay?${params.toString()}`,
    };
  }
}

export const paymentProvider: PaymentProvider = new ManualUpiProvider();
