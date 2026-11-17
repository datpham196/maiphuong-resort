import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "@/styles/spa.css";

type Props = {
  params: Promise<{ locale: string }>;
};

const SPA_IMAGES = {
  room: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80",
  body: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1000&q=80",
  foot: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1000&q=80",
  other: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80",
} as const;

export default async function SpaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Spa");

  const treatments = [
    {
      key: "body",
      image: SPA_IMAGES.body,
      category: t("treatments.body.category"),
      title: t("treatments.body.title"),
      text: t("treatments.body.text"),
      tags: [t("treatments.body.tag1"), t("treatments.body.tag2")],
      cta: t("treatments.body.cta"),
    },
    {
      key: "foot",
      image: SPA_IMAGES.foot,
      category: t("treatments.foot.category"),
      title: t("treatments.foot.title"),
      text: t("treatments.foot.text"),
      tags: [t("treatments.foot.tag1"), t("treatments.foot.tag2")],
      cta: t("treatments.foot.cta"),
    },
    {
      key: "other",
      image: SPA_IMAGES.other,
      category: t("treatments.other.category"),
      title: t("treatments.other.title"),
      text: t("treatments.other.text"),
      tags: [t("treatments.other.tag1"), t("treatments.other.tag2")],
      cta: t("treatments.other.cta"),
    },
  ] as const;

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="spa-shell">
        <main className="spa-page">
          <section className="spa-hero">
            <div>
              <p className="eyebrow">{t("heroEyebrow")}</p>
              <h1>{t("heroTitle")}</h1>
            </div>
            <p className="spa-hero-lead">{t("heroLead")}</p>
          </section>

          <section className="spa-intro">
            <div className="spa-intro-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SPA_IMAGES.room} alt={t("introImageAlt")} />
            </div>
            <div className="spa-intro-copy">
              <p className="eyebrow">{t("introEyebrow")}</p>
              <h2>{t("introHeading")}</h2>
              <p>{t("introBody")}</p>
              <p>{t("introBodySecondary")}</p>
              <a className="spa-cta" href={t("bookHref")}>
                {t("bookCta")}
              </a>
            </div>
          </section>

          <section className="spa-treatments" id="treatments" aria-labelledby="spa-treatments-title">
            <div className="spa-treatments-head">
              <div>
                <p className="eyebrow">{t("treatmentsEyebrow")}</p>
                <h2 id="spa-treatments-title">{t("treatmentsHeading")}</h2>
              </div>
              <p>{t("treatmentsLead")}</p>
            </div>

            <div className="spa-treatment-grid">
              {treatments.map((item) => (
                <article key={item.key} className="spa-treatment-card">
                  <div className="spa-treatment-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="spa-treatment-body">
                    <p className="eyebrow">{item.category}</p>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <div className="spa-treatment-tags">
                      {item.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <a className="spa-treatment-link" href={t("bookHref")}>
                      {item.cta}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="spa-banner" id="spa-cta" aria-label={t("bannerTitle")}>
            <div>
              <h2>{t("bannerTitle")}</h2>
              <p>{t("bannerText")}</p>
            </div>
            <a className="spa-cta" href={t("bookHref")}>
              {t("bannerCta")}
            </a>
          </section>
        </main>
        <SiteFooter />
        <a className="spa-float-consult" href={t("consultHref")}>
          {t("consultCta")}
        </a>
      </div>
    </>
  );
}
