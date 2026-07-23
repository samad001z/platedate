import { CheckoutClient } from "@/app/checkout/checkout-client";
import { PageHeader } from "@/components/sections/page-header";
import { getDeliveryAreas } from "@/lib/queries";

export const revalidate = 300;

export default async function CheckoutPage() {
  const areas = await getDeliveryAreas();
  return (
    <div>
      <PageHeader label="Checkout" />
      <CheckoutClient
        areas={areas.map((a) => ({
          id: a.id,
          name: a.name,
          feePaise: a.fee_paise,
        }))}
      />
    </div>
  );
}
