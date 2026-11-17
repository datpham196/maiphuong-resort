import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import "@/styles/offers.css";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Preview-token flow removed while Offers UI is hard-coded. */
export default async function OffersPreviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Offers");

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="offers-shell">
        <main className="offers-page">
          <p className="offers-hero-lead">{t("previewRemoved")}</p>
          <Link className="offer-card-link" href="/offers">
            {t("backHome")}
          </Link>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
