import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageRenderer } from "@/components/page-builder/render/PageRenderer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { fetchExperiencePreview } from "@/services/experiences";
import "@/styles/page-builder.css";
import "@/styles/experiences.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function ExperiencePreviewPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Experiences");

  if (!token) {
    return (
      <>
        <SiteHeader tone="on-light" />
        <div className="experiences-shell is-detail">
          <main className="experience-detail-page is-builder">
            <div className="experience-detail-body">
              <p className="experiences-empty">{t("previewMissing")}</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  let item;
  try {
    item = await fetchExperiencePreview(token);
  } catch {
    return (
      <>
        <SiteHeader tone="on-light" />
        <div className="experiences-shell is-detail">
          <main className="experience-detail-page is-builder">
            <div className="experience-detail-body">
              <p className="experiences-empty">{t("previewInvalid")}</p>
              <Link className="experience-detail-back" href="/experiences">
                {t("backToList")}
              </Link>
            </div>
          </main>
        </div>
      </>
    );
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
            <p className="eyebrow">{t("previewBadge")}</p>
            <section className="experience-detail-hero">
              <p className="eyebrow">{t(`group.${groupKey}`)}</p>
              <h1>{item.title}</h1>
              {item.shortDescription ? <p className="experience-detail-lead">{item.shortDescription}</p> : null}
            </section>
            <div className="experience-document">
              <PageRenderer document={item.document} mode="preview" />
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
