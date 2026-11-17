import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import "@/styles/restaurants.css";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Preview-token flow removed for fixed restaurant CMS. */
export default async function RestaurantPreviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Restaurants");

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="restaurants-shell">
        <main className="restaurant-detail-page">
          <p className="restaurants-empty">{t("previewRemoved")}</p>
          <Link className="restaurant-detail-back" href="/restaurants">
            {t("backToList")}
          </Link>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
