"use client";

import { placeOrder } from "@/app/checkout/actions";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { DateCoin } from "@/components/ui/date-coin";
import { UpiQr } from "@/components/ui/upi-qr";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { shortDate } from "@/lib/dates";
import { formatPaise } from "@/lib/money";
import { paymentProvider } from "@/lib/payments";
import { checkoutSchema } from "@/lib/schemas";
import { DELIVERY_SLOTS, MIN_ORDER_PAISE } from "@/lib/site";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Area = { id: string; name: string; feePaise: number };

export function CheckoutClient({ areas }: { areas: Area[] }) {
  const router = useRouter();
  const { lines, subtotalPaise, deliveryDate, clear } = useCart();
  const [isPending, startTransition] = useTransition();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [areaId, setAreaId] = useState("");
  const [address, setAddress] = useState("");
  const [deliverySlot, setDeliverySlot] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<{
    message: string;
    nextAvailableDate?: string;
  } | null>(null);
  const [placed, setPlaced] = useState(false);

  const area = areas.find((a) => a.id === areaId) ?? null;
  const feePaise = area?.feePaise ?? 0;
  const totalPaise = subtotalPaise + feePaise;
  const shortfall = MIN_ORDER_PAISE - subtotalPaise;

  const upi = paymentProvider.instructionsFor("upi", { totalPaise });

  if (!placed && (lines.length === 0 || !deliveryDate || shortfall > 0)) {
    return (
      <main className="px-gutter py-section mx-auto max-w-xl">
        <Card>
          <h1 className="text-title">Almost there</h1>
          <p className="text-body text-plum-ink/70 mt-2">
            {lines.length === 0
              ? "Your plate is empty. Add something from the menu first."
              : !deliveryDate
                ? "Pick a delivery date first, the whole order hangs on it."
                : `Add ${formatPaise(shortfall)} more to reach the ${formatPaise(MIN_ORDER_PAISE)} minimum order.`}
          </p>
          <Link
            href={lines.length === 0 ? "/#menu" : "/#dates"}
            className="bg-berry text-body text-porcelain hover:bg-berry-deep mt-4 inline-flex h-12 items-center justify-center rounded-md px-5 font-semibold transition duration-150"
          >
            {lines.length === 0 ? "Browse the menu" : "Pick a date"}
          </Link>
        </Card>
      </main>
    );
  }

  function submit() {
    setServerError(null);
    const input = {
      customerName,
      phone,
      email,
      areaId,
      address,
      deliveryDate: deliveryDate ?? "",
      deliverySlot,
      notes,
      paymentMethod,
      items: lines.map((l) => ({
        menuItemId: l.menuItemId,
        variantId: l.variantId,
        quantity: l.quantity,
      })),
    };
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      document
        .getElementById("checkout-errors")
        ?.scrollIntoView({ block: "center" });
      return;
    }
    setFieldErrors({});
    startTransition(async () => {
      const result = await placeOrder(parsed.data);
      if (result.ok) {
        setPlaced(true);
        clear();
        router.push(`/order/${result.reference}`);
      } else {
        setServerError({
          message: result.message,
          nextAvailableDate: result.nextAvailableDate,
        });
      }
    });
  }

  const err = (key: string) =>
    fieldErrors[key] ? (
      <p className="text-small text-berry mt-1 font-medium">
        {fieldErrors[key]}
      </p>
    ) : null;

  return (
    <main className="px-gutter mx-auto max-w-6xl py-10">
      <h1 className="text-hero">Checkout</h1>
      <p className="text-small text-plum-ink/60 mt-1">
        One page, no account, Rhea confirms on WhatsApp.
      </p>

      <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_minmax(320px,0.6fr)]">
        {/* form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          noValidate
          className="flex flex-col gap-8"
        >
          <section aria-labelledby="who-heading">
            <h2 id="who-heading" className="text-heading">
              Who is this for
            </h2>
            <div className="mt-3 flex flex-col gap-4">
              <div>
                <label
                  htmlFor="co-name"
                  className="text-small mb-1.5 block font-semibold"
                >
                  Your name
                </label>
                <Input
                  id="co-name"
                  autoComplete="name"
                  value={customerName}
                  error={!!fieldErrors.customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                {err("customerName")}
              </div>
              <div>
                <label
                  htmlFor="co-phone"
                  className="text-small mb-1.5 block font-semibold"
                >
                  Mobile number
                </label>
                <Input
                  id="co-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="98300 12345"
                  value={phone}
                  error={!!fieldErrors.phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {err("phone")}
              </div>
              <div>
                <label
                  htmlFor="co-email"
                  className="text-small mb-1.5 block font-semibold"
                >
                  Email (optional)
                </label>
                <Input
                  id="co-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  error={!!fieldErrors.email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {err("email")}
              </div>
            </div>
          </section>

          <section aria-labelledby="where-heading">
            <h2 id="where-heading" className="text-heading">
              Where it goes
            </h2>
            <div className="mt-3 flex flex-col gap-4">
              <div>
                <label
                  htmlFor="co-area"
                  className="text-small mb-1.5 block font-semibold"
                >
                  Delivery area
                </label>
                <Select
                  id="co-area"
                  value={areaId}
                  error={!!fieldErrors.areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                >
                  <option value="" disabled>
                    Choose your area
                  </option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                      {a.feePaise > 0
                        ? ` (delivery ${formatPaise(a.feePaise)})`
                        : " (free delivery)"}
                    </option>
                  ))}
                </Select>
                {err("areaId")}
              </div>
              <div>
                <label
                  htmlFor="co-address"
                  className="text-small mb-1.5 block font-semibold"
                >
                  Full address
                </label>
                <Textarea
                  id="co-address"
                  autoComplete="street-address"
                  placeholder="Flat, building, street, landmark"
                  value={address}
                  error={!!fieldErrors.address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {err("address")}
              </div>
            </div>
          </section>

          <section aria-labelledby="when-heading">
            <h2 id="when-heading" className="text-heading">
              When
            </h2>
            <div className="bg-blush mt-3 flex items-center gap-3 rounded-md p-3">
              {deliveryDate && <DateCoin dateISO={deliveryDate} size="sm" />}
              <p className="text-small flex-1">
                Delivery on{" "}
                <strong>{deliveryDate && shortDate(deliveryDate)}</strong>
              </p>
              <Link
                href="/#dates"
                className="text-small text-berry rounded-sm font-semibold underline underline-offset-2"
              >
                Change date
              </Link>
            </div>
            <div className="mt-3">
              <p className="text-small mb-1.5 font-semibold">Delivery slot</p>
              <div className="flex flex-wrap gap-2">
                {DELIVERY_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={deliverySlot === slot}
                    onClick={() => setDeliverySlot(slot)}
                    className={cn(
                      "rounded-pill text-body h-12 border px-5 font-medium transition-colors",
                      deliverySlot === slot
                        ? "border-berry bg-blush text-plum-ink font-semibold"
                        : "border-plum-ink/20 bg-porcelain hover:bg-blush/50",
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {err("deliverySlot")}
            </div>
          </section>

          <section aria-labelledby="notes-heading">
            <h2 id="notes-heading" className="text-heading">
              Anything we should know
            </h2>
            <div className="mt-3">
              <label htmlFor="co-notes" className="sr-only">
                Notes for the kitchen
              </label>
              <Textarea
                id="co-notes"
                placeholder="Allergies, the occasion, a gate code, a message for the cake"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </section>

          <section aria-labelledby="pay-heading">
            <h2 id="pay-heading" className="text-heading">
              Payment
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={paymentMethod === "upi"}
                onClick={() => setPaymentMethod("upi")}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  paymentMethod === "upi"
                    ? "border-berry bg-blush"
                    : "border-plum-ink/20 hover:bg-blush/40",
                )}
              >
                <p className="text-body font-semibold">UPI</p>
                <p className="text-small text-plum-ink/60 mt-0.5">
                  Pay now, any UPI app
                </p>
              </button>
              <button
                type="button"
                aria-pressed={paymentMethod === "cod"}
                onClick={() => setPaymentMethod("cod")}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  paymentMethod === "cod"
                    ? "border-berry bg-blush"
                    : "border-plum-ink/20 hover:bg-blush/40",
                )}
              >
                <p className="text-body font-semibold">Cash on delivery</p>
                <p className="text-small text-plum-ink/60 mt-0.5">
                  Pay when it arrives
                </p>
              </button>
            </div>
            {paymentMethod === "upi" && upi.kind === "upi" && (
              <div className="border-plum-ink/10 bg-porcelain mt-3 flex flex-col items-start gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
                <UpiQr
                  link={upi.upiLink}
                  label={`UPI payment of ${formatPaise(totalPaise)} to ${upi.vpa}`}
                />
                <div className="text-small">
                  <p className="font-semibold">
                    Scan to pay {formatPaise(totalPaise)}
                  </p>
                  <p className="text-plum-ink/70 mt-1">
                    UPI ID: <span className="font-semibold">{upi.vpa}</span> (
                    {upi.payeeName})
                  </p>
                  <p className="text-plum-ink/60 mt-1">
                    You can also pay after placing the order, the QR appears
                    again with your order reference.
                  </p>
                </div>
              </div>
            )}
          </section>

          <div id="checkout-errors" aria-live="polite">
            {serverError && (
              <Card className="border-berry/40 bg-blush">
                <p className="text-body">{serverError.message}</p>
                {serverError.nextAvailableDate && (
                  <p className="text-small text-plum-ink/70 mt-2">
                    Next open day:{" "}
                    <strong>{shortDate(serverError.nextAvailableDate)}</strong>.
                    Change your date from the{" "}
                    <Link
                      href="/#dates"
                      className="text-berry font-semibold underline underline-offset-2"
                    >
                      calendar
                    </Link>{" "}
                    and try again.
                  </p>
                )}
              </Card>
            )}
            {Object.keys(fieldErrors).length > 0 && (
              <p className="text-small text-berry font-medium">
                Check the highlighted fields above.
              </p>
            )}
          </div>

          <Button
            size="lg"
            type="submit"
            loading={isPending}
            className="sm:self-start"
          >
            Place order · {formatPaise(totalPaise)}
          </Button>
        </form>

        {/* summary */}
        <Card className="lg:sticky lg:top-24">
          <h2 className="text-heading">Your order</h2>
          {deliveryDate && (
            <p className="text-small text-plum-ink/60 mt-1 flex items-center gap-2">
              <DateCoin dateISO={deliveryDate} size="sm" />
              {shortDate(deliveryDate)}
              {deliverySlot ? `, ${deliverySlot}` : ""}
            </p>
          )}
          <ul className="mt-4 flex flex-col gap-2.5">
            {lines.map((line) => (
              <li
                key={line.key}
                className="text-small flex justify-between gap-3"
              >
                <span>
                  {line.name} ×{line.quantity}
                </span>
                <span className="tabular-nums">
                  {formatPaise(line.unitPricePaise * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-plum-ink/10 text-small mt-4 space-y-1.5 border-t pt-3">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPaise(subtotalPaise)}</span>
            </p>
            <p className="flex justify-between">
              <span>Delivery{area ? ` (${area.name})` : ""}</span>
              <span className="tabular-nums">
                {area ? formatPaise(feePaise) : "choose area"}
              </span>
            </p>
          </div>
          <p className="border-plum-ink/10 mt-3 flex items-baseline justify-between border-t pt-3">
            <span className="text-body font-semibold">Total</span>
            <span className="font-display text-price tabular-nums">
              {formatPaise(totalPaise)}
            </span>
          </p>
        </Card>
      </div>
    </main>
  );
}
