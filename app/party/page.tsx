import { PartyClient } from "@/app/party/party-client";
import { PageHeader } from "@/components/sections/page-header";
import { todayISTISO } from "@/lib/dates";

export const metadata = {
  title: "Party and bulk orders · Plate Date",
};

export default function PartyPage() {
  return (
    <div>
      <PageHeader label="Party and bulk orders" />
      <PartyClient todayISO={todayISTISO()} />
    </div>
  );
}
