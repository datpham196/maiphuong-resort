import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import "@/styles/spa.css";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Preview-token flow removed while Spa UI is hard-coded. */
export default async function SpaPreviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Spa");

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="spa-shell">
        <main className="spa-page">
          <p className="spa-hero-lead">{t("previewRemoved")}</p>
          <Link className="spa-treatment-link" href="/spa">
            {t("backHome")}
          </Link>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
