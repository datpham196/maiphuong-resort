import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ExperienceLayout1 } from "@/components/experiences/experience-layout-1";
import { ExperienceLayout2 } from "@/components/experiences/experience-layout-2";
import { ExperienceLayout3 } from "@/components/experiences/experience-layout-3";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ApiError } from "@/services/api";
import { fetchPublicExperience } from "@/services/experiences";
import "@/styles/experiences.css";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function normalizeLayout(layout: string) {
  if (layout === "layout2" || layout === "itinerary") return "layout2";
  if (layout === "layout3" || layout === "ticket") return "layout3";
  return "layout1";
}

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
  const groupLabel = t(`group.${groupKey}`);
  const layout = normalizeLayout(item.layout);

  const sharedLabels = {
    overview: t("sectionOverview"),
    gallery: t("sectionGallery"),
    itinerary: t("sectionItinerary"),
    duration: t("labelDuration"),
    price: t("labelPrice"),
    conditions: t("sectionConditions"),
  };

  return (
    <>
      <SiteHeader />
      <div className="experiences-shell is-detail">
        <main className={`experience-detail-page is-${layout}`}>
          {layout === "layout2" ? (
            <ExperienceLayout2
              item={item}
              locale={locale}
              groupLabel={groupLabel}
              labels={sharedLabels}
            />
          ) : layout === "layout3" ? (
            <ExperienceLayout3
              item={item}
              locale={locale}
              groupLabel={groupLabel}
              labels={sharedLabels}
            />
          ) : (
            <ExperienceLayout1 item={item} groupLabel={groupLabel} labels={sharedLabels} />
          )}

          <div className="experience-detail-footer">
            <Link className="experience-detail-back" href="/experiences">
              {t("backToList")}
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
