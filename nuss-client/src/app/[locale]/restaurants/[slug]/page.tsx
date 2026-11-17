import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RestaurantDetailView } from "@/components/restaurant-detail-view";
import { ApiError } from "@/services/api";
import { fetchPublicRestaurant } from "@/services/restaurants";
import "@/styles/restaurants.css";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function RestaurantDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let item;
  try {
    item = await fetchPublicRestaurant(slug, locale);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
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
