import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageRenderer } from "@/components/page-builder/render/PageRenderer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { fetchRestaurantPreview } from "@/services/restaurants";
import "@/styles/page-builder.css";
import "@/styles/restaurants.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function RestaurantPreviewPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Restaurants");

  if (!token) {
    return (
      <>
        <SiteHeader tone="on-light" />
        <div className="restaurants-shell">
          <main className="restaurant-detail-page">
            <p className="restaurants-empty">{t("previewMissing")}</p>
          </main>
        </div>
      </>
    );
  }

  let item;
  try {
    item = await fetchRestaurantPreview(token);
  } catch {
    return (
      <>
        <SiteHeader tone="on-light" />
        <div className="restaurants-shell">
          <main className="restaurant-detail-page">
            <p className="restaurants-empty">{t("previewInvalid")}</p>
            <Link className="restaurant-detail-back" href="/restaurants">
              {t("backToList")}
            </Link>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="restaurants-shell">
        <main className="restaurant-detail-page">
          <p className="eyebrow">{t("previewBadge")}</p>
          <section className="restaurant-detail-hero">
            <h1>{item.title}</h1>
            {item.shortDescription ? <p className="restaurant-detail-lead">{item.shortDescription}</p> : null}
          </section>
          <div className="restaurant-document">
            <PageRenderer document={item.document} mode="preview" />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
