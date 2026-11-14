import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageRenderer } from "@/components/page-builder/render/PageRenderer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { fetchCmsPagePreview } from "@/services/cms-pages";
import "@/styles/page-builder.css";
import "@/styles/cms-page.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function OffersPreviewPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Offers");

  if (!token) {
    return (
      <>
        <SiteHeader tone="on-light" />
        <div className="cms-page-shell">
          <main className="cms-page">
            <p className="cms-page-empty">{t("previewMissing")}</p>
          </main>
        </div>
      </>
    );
  }

  let item;
  try {
    item = await fetchCmsPagePreview("offers", token);
  } catch {
    return (
      <>
        <SiteHeader tone="on-light" />
        <div className="cms-page-shell">
          <main className="cms-page">
            <p className="cms-page-empty">{t("previewInvalid")}</p>
            <Link className="cms-page-back" href="/">
              {t("backHome")}
            </Link>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="cms-page-shell">
        <main className="cms-page">
          <p className="cms-page-eyebrow">{t("previewBadge")}</p>
          <section className="cms-page-hero">
            <h1>{item.title}</h1>
            {item.shortDescription ? <p className="cms-page-lead">{item.shortDescription}</p> : null}
          </section>
          <div className="cms-page-document">
            <PageRenderer document={item.document} mode="preview" />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
