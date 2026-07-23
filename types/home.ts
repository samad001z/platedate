/** Serializable shapes passed from server components to client islands. */

export type DayAvailability = {
  isBlackout: boolean;
  maxOrders: number;
  ordersBooked: number;
};

export type AvailabilityMap = Record<string, DayAvailability>;

export type FestivalLite = {
  slug: string;
  name: string;
  startsOn: string;
  endsOn: string;
  heroCopy: string | null;
};
