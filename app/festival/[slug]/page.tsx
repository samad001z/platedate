import { PageHeader } from "@/components/sections/page-header";
import { Badge, Card } from "@/components/ui";
import { FoodImage } from "@/components/ui/food-image";
import { shortDate } from "@/lib/dates";
import { formatPaise } from "@/lib/money";
import { getFestivalBySlug } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 300;

export default async function FestivalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const festival = await getFestivalBySlug(slug);
  if (!festival) notFound();

  return (
    <div>
      <PageHeader label="Festival menu" />

      <main className="px-gutter py-section mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="ring">Festival menu</Badge>
          <span className="text-small text-plum-ink/60">
            {shortDate(festival.starts_on)} to {shortDate(festival.ends_on)}
          </span>
        </div>
        <h1 className="text-hero mt-3">{festival.name}</h1>
        {festival.hero_copy && (
          <p className="text-body text-plum-ink/70 mt-3 max-w-prose">
            {festival.hero_copy}
          </p>
        )}

        <div className="gap-gutter mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {festival.items.map((item) => (
            <Card
              key={item.id}
              padded={false}
              className="flex flex-col overflow-hidden"
            >
              <div className="aspect-[4/3] w-full">
                <FoodImage name={item.name} imageUrl={item.image_url} />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="text-heading">{item.name}</h2>
                {item.description && (
                  <p className="text-small text-plum-ink/70 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="mt-auto flex items-baseline gap-2 pt-1">
                  <span className="font-display text-price tabular-nums">
                    {formatPaise(item.festival_price_paise ?? item.price_paise)}
                  </span>
                  {item.festival_price_paise !== null &&
                    item.festival_price_paise < item.price_paise && (
                      <span className="text-small text-plum-ink/50 tabular-nums line-through">
                        {formatPaise(item.price_paise)}
                      </span>
                    )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <p className="text-body mt-8">
          To order from this menu,{" "}
          <Link
            href="/#menu"
            className="text-berry rounded-sm font-semibold underline underline-offset-4"
          >
            pick a date on the home page
          </Link>{" "}
          within the festival window.
        </p>
      </main>
    </div>
  );
}
