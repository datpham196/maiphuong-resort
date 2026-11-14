import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page-builder/render/PageRenderer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/services/api";
import { fetchPublicExperience } from "@/services/experiences";
import "@/styles/page-builder.css";
import "@/styles/experiences.css";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ExperienceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Experiences");

  let item;
  try {
    item = await fetchPublicExperience(slug, locale);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const groupKey =
    item.group === "destination" || item.group === "tour" || item.group === "ticket"
      ? item.group
      : "destination";

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="experiences-shell is-detail">
        <main className="experience-detail-page is-builder">
          <div className="experience-detail-body">
            <Link className="experience-detail-back" href="/experiences">
              {t("backToList")}
            </Link>
            <section className="experience-detail-hero">
              <p className="eyebrow">{t(`group.${groupKey}`)}</p>
              <h1>{item.title}</h1>
              {item.shortDescription ? <p className="experience-detail-lead">{item.shortDescription}</p> : null}
            </section>
            <div className="experience-document">
              <PageRenderer document={item.document} mode="live" />
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
