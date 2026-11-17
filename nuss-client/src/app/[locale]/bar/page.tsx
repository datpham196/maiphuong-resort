import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RestaurantDetailView } from "@/components/restaurant-detail-view";
import { fetchPublicVenueByKind } from "@/services/restaurants";
import "@/styles/restaurants.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const item = await fetchPublicVenueByKind("bar", locale).catch(() => null);
  if (!item) {
    notFound();
  }

  return (
    <>
      <SiteHeader tone="over-hero" />
      <div className="restaurants-shell">
        <RestaurantDetailView item={item} locale={locale} />
        <SiteFooter />
      </div>
    </>
  );
}
