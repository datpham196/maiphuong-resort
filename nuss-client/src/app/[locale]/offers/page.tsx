import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page-builder/render/PageRenderer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/services/api";
import { fetchPublicCmsPage } from "@/services/cms-pages";
import "@/styles/page-builder.css";
import "@/styles/cms-page.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OffersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Offers");

  let item;
  try {
    item = await fetchPublicCmsPage("offers", locale);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="cms-page-shell">
        <main className="cms-page">
          <Link className="cms-page-back" href="/">
            {t("backHome")}
          </Link>
          <section className="cms-page-hero">
            <h1>{item.title}</h1>
            {item.shortDescription ? <p className="cms-page-lead">{item.shortDescription}</p> : null}
          </section>
          <div className="cms-page-document">
            <PageRenderer document={item.document} mode="live" />
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
