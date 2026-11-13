import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page-builder/render/PageRenderer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/services/api";
import { fetchPublicRestaurant, fetchPublicRestaurants } from "@/services/restaurants";
import "@/styles/page-builder.css";
import "@/styles/restaurants.css";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function RestaurantDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Restaurants");

  let item;
  try {
    item = await fetchPublicRestaurant(slug, locale);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  let publishedCount = 1;
  try {
    publishedCount = (await fetchPublicRestaurants(locale)).length;
  } catch {
    publishedCount = 1;
  }
  const showListBack = publishedCount > 1;

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="restaurants-shell">
        <main className="restaurant-detail-page">
          {showListBack ? (
            <Link className="restaurant-detail-back" href="/restaurants">
              {t("backToList")}
            </Link>
          ) : (
            <Link className="restaurant-detail-back" href="/">
              {t("backHome")}
            </Link>
          )}
          <section className="restaurant-detail-hero">
            <h1>{item.title}</h1>
            {item.shortDescription ? <p className="restaurant-detail-lead">{item.shortDescription}</p> : null}
          </section>
          <div className="restaurant-document">
            <PageRenderer document={item.document} mode="live" />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
