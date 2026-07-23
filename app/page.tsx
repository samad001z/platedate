import { HomePage } from "@/components/sections/home-page";
import { addDaysISO, todayISTISO } from "@/lib/dates";
import {
  getDateAvailability,
  getDeliveryAreas,
  getMenuItems,
  getPublishedFestivals,
} from "@/lib/queries";
import type { AvailabilityMap, FestivalLite } from "@/types/home";

export const revalidate = 300;

export default async function Home() {
  const todayISO = todayISTISO();
  const maxISO = addDaysISO(todayISO, 69);

  const [items, availability, festivals, areas] = await Promise.all([
    getMenuItems(),
    getDateAvailability(todayISO, maxISO),
    getPublishedFestivals(),
    getDeliveryAreas(),
  ]);

  const availabilityMap: AvailabilityMap = Object.fromEntries(
    availability.map((d) => [
      d.day,
      {
        isBlackout: d.is_blackout,
        maxOrders: d.max_orders,
        ordersBooked: Number(d.orders_booked),
      },
    ]),
  );

  const activeFestivals: FestivalLite[] = festivals
    .filter((f) => f.ends_on >= todayISO)
    .map((f) => ({
      slug: f.slug,
      name: f.name,
      startsOn: f.starts_on,
      endsOn: f.ends_on,
      heroCopy: f.hero_copy,
    }));

  const minLeadHours = Math.min(...items.map((i) => i.lead_time_hours));

  return (
    <HomePage
      items={items}
      availability={availabilityMap}
      festivals={activeFestivals}
      areaNames={areas.map((a) => a.name)}
      todayISO={todayISO}
      maxISO={maxISO}
      minLeadHours={minLeadHours}
    />
  );
}
