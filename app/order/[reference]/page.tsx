import { PageHeader } from "@/components/sections/page-header";
import { Badge, Card } from "@/components/ui";
import { DateCoin } from "@/components/ui/date-coin";
import { longDate, shortDate } from "@/lib/dates";
import { formatPaise } from "@/lib/money";
import { paymentProvider } from "@/lib/payments";
import { getOrderByReference } from "@/lib/queries";
import { whatsappLink } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order · Plate Date",
  robots: { index: false },
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  new: "Waiting for Rhea to confirm",
  confirmed: "Confirmed by Rhea",
  preparing: "In the kitchen",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);
  if (!order) notFound();

  const payment = paymentProvider.instructionsFor(order.payment_method, {
    totalPaise: order.total_paise,
    reference: order.reference_code,
  });
  const qrDataUrl =
    payment.kind === "upi"
      ? await QRCode.toDataURL(payment.upiLink, { width: 260, margin: 1 })
      : null;

  const waMessage = [
    `Hello Rhea, I placed order ${order.reference_code}.`,
    ...order.items.map(
      (i) =>
        `• ${i.name} ×${i.quantity} - ${formatPaise(i.unit_price_paise * i.quantity)}`,
    ),
    `Total: ${formatPaise(order.total_paise)} (${order.payment_method === "upi" ? "paying by UPI" : "cash on delivery"})`,
    `Delivery: ${shortDate(order.delivery_date)}${order.delivery_slot ? `, ${order.delivery_slot}` : ""}${order.area_name ? `, ${order.area_name}` : ""}`,
    `${order.customer_name}`,
  ].join("\n");

  return (
    <div>
      <PageHeader label="Order placed" />
      <main className="px-gutter mx-auto max-w-3xl py-10">
        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-small text-plum-ink/60">Order reference</p>
              <h1 className="font-display text-display tracking-tight">
                {order.reference_code}
              </h1>
            </div>
            <DateCoin dateISO={order.delivery_date} size="lg" />
          </div>

          <p className="text-body text-plum-ink/70 mt-2">
            For {order.customer_name}, delivering on{" "}
            <strong>{longDate(order.delivery_date)}</strong>
            {order.delivery_slot ? `, ${order.delivery_slot}` : ""}
            {order.area_name ? `, ${order.area_name}` : ""}.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="ring">
              {ORDER_STATUS_LABEL[order.order_status] ?? order.order_status}
            </Badge>
            <Badge variant={order.payment_status === "paid" ? "tag" : "muted"}>
              {order.payment_status === "paid"
                ? "Payment received"
                : order.payment_method === "cod"
                  ? "Cash on delivery"
                  : "Payment pending"}
            </Badge>
          </div>

          <ul className="border-plum-ink/10 mt-6 flex flex-col gap-2.5 border-t pt-4">
            {order.items.map((item) => (
              <li
                key={item.name}
                className="text-body flex justify-between gap-3"
              >
                <span>
                  {item.name} ×{item.quantity}
                </span>
                <span className="tabular-nums">
                  {formatPaise(item.unit_price_paise * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-plum-ink/10 text-small mt-4 space-y-1.5 border-t pt-3">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatPaise(order.subtotal_paise)}
              </span>
            </p>
            <p className="flex justify-between">
              <span>Delivery</span>
              <span className="tabular-nums">
                {formatPaise(order.delivery_fee_paise)}
              </span>
            </p>
          </div>
          <p className="border-plum-ink/10 mt-3 flex items-baseline justify-between border-t pt-3">
            <span className="text-body font-semibold">Total</span>
            <span className="font-display text-price tabular-nums">
              {formatPaise(order.total_paise)}
            </span>
          </p>

          <a
            href={whatsappLink(waMessage)}
            target="_blank"
            rel="noreferrer"
            className="bg-berry text-body text-porcelain hover:bg-berry-deep mt-6 inline-flex h-14 w-full items-center justify-center rounded-md px-6 font-semibold transition duration-150 active:scale-[0.98]"
          >
            Send us this order on WhatsApp
          </a>
          <p className="text-small text-plum-ink/60 mt-2">
            This is how Rhea confirms every order. One tap, the details go with
            it.
          </p>
        </Card>

        {payment.kind === "upi" && qrDataUrl && (
          <Card className="mt-6 p-6 sm:p-8">
            <h2 className="text-heading">Pay by UPI</h2>
            <div className="mt-3 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`UPI payment of ${formatPaise(order.total_paise)} to ${payment.vpa}`}
                width={260}
                height={260}
                className="border-plum-ink/10 rounded-md border"
              />
              <div className="text-small">
                <p className="font-semibold">
                  Scan to pay {formatPaise(order.total_paise)}
                </p>
                <p className="text-plum-ink/70 mt-1">
                  UPI ID: <span className="font-semibold">{payment.vpa}</span> (
                  {payment.payeeName})
                </p>
                <p className="text-plum-ink/60 mt-1">
                  The payment note carries your reference {order.reference_code}
                  , so Rhea can match it instantly.
                </p>
                <a
                  href={payment.upiLink}
                  className="border-plum-ink/20 hover:bg-blush mt-3 inline-flex h-11 items-center justify-center rounded-md border px-4 font-semibold transition-colors"
                >
                  Open in a UPI app
                </a>
              </div>
            </div>
          </Card>
        )}

        {payment.kind === "cod" && (
          <Card className="mt-6">
            <h2 className="text-heading">Cash on delivery</h2>
            <p className="text-small text-plum-ink/70 mt-1">{payment.note}</p>
          </Card>
        )}

        <p className="text-small text-plum-ink/50 mt-6">
          Keep this link, it is your order page. Anyone with the reference can
          see the order summary but never your phone number or address.
        </p>
      </main>
    </div>
  );
}
