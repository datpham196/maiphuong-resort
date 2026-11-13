import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ExperienceGroupSlider } from "@/components/experiences/experience-group-slider";
import { ExperienceImg } from "@/components/experiences/experience-media";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicExperiences, type PublicExperience } from "@/services/experiences";
import "@/styles/experiences.css";

type Props = {
  params: Promise<{ locale: string }>;
};

const GROUPS = [
  { id: "destination" },
  { id: "tour" },
  { id: "ticket" },
] as const;

function formatPrice(item: PublicExperience, locale: string) {
  if (item.priceAmount == null) {
    return null;
  }
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN").format(item.priceAmount);
}

export default async function ExperiencesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Experiences");
  const tHeader = await getTranslations("Header");

  let items: PublicExperience[] = [];
  let loadError = false;
  try {
    items = await fetchPublicExperiences(locale);
  } catch {
    loadError = true;
  }

  const grouped = GROUPS.map((group) => ({
    ...group,
    items: items.filter((item) => item.group === group.id),
  }));
  const availableGroups = grouped.filter((group) => group.items.length > 0);

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="experiences-shell">
        <main className="experiences-page">
          <section className="experiences-hero">
            <p className="eyebrow">{tHeader("experiences")}</p>
            <h1>{t("title")}</h1>
            <p>{t("intro")}</p>
            {!loadError && availableGroups.length > 1 ? (
              <nav className="experiences-jump" aria-label={t("jumpLabel")}>
                {availableGroups.map((group) => (
                  <a key={group.id} href={`#exp-${group.id}`}>
                    {t(`group.${group.id}`)}
                  </a>
                ))}
              </nav>
            ) : null}
          </section>

          {loadError ? <p className="experiences-empty">{t("error")}</p> : null}
          {!loadError && items.length === 0 ? <p className="experiences-empty">{t("empty")}</p> : null}

          {!loadError
            ? grouped.map((group) => {
                if (group.items.length === 0) {
                  return null;
                }

                return (
                  <section
                    key={group.id}
                    id={`exp-${group.id}`}
                    className="experience-group"
                    aria-labelledby={`exp-group-${group.id}`}
                  >
                    <header className="experience-group-head">
                      <p className="eyebrow">{t(`group.${group.id}`)}</p>
                      <h2 id={`exp-group-${group.id}`}>{t(`group.${group.id}`)}</h2>
                      <p className="experience-group-intro">{t(`groupIntro.${group.id}`)}</p>
                    </header>

                    <ExperienceGroupSlider
                      ariaLabel={t(`group.${group.id}`)}
                      prevLabel={t("sliderPrev")}
                      nextLabel={t("sliderNext")}
                      dotsLabel={t("sliderDots")}
                      goToLabel={t("sliderGoTo", { index: "{index}" })}
                    >
                      {group.items.map((item) => {
                        const href = `/experiences/${item.slug}`;
                        const price = formatPrice(item, locale);

                        return (
                          <article key={item.id} className="experience-slide-card">
                            <div className="experience-slide-media">
                              <ExperienceImg
                                url={item.coverImage?.url}
                                alt={item.coverImage?.altText ?? item.title}
                              />
                            </div>

                            <div className="experience-slide-tag">
                              <span aria-hidden="true" />
                              {t(`group.${group.id}`)}
                            </div>

                            <div className="experience-slide-overlay">
                              <h3>{item.title}</h3>
                              {item.shortDescription ? <p>{item.shortDescription}</p> : null}
                              <div className="experience-slide-meta">
                                <div className="experience-slide-price">
                                  {price ? (
                                    <>
                                      <strong>
                                        {t("slidePrice", {
                                          price,
                                          currency: item.priceCurrency === "VND" || !item.priceCurrency ? "đ" : item.priceCurrency,
                                        })}
                                      </strong>
                                      {item.priceNote ? <span>{item.priceNote}</span> : null}
                                      {!item.priceNote && item.durationText ? (
                                        <span>{item.durationText}</span>
                                      ) : null}
                                    </>
                                  ) : item.durationText ? (
                                    <strong>{item.durationText}</strong>
                                  ) : (
                                    <strong>{t("priceOnRequest")}</strong>
                                  )}
                                </div>
                                <Link className="experience-slide-cta" href={href}>
                                  {t("chooseExperience")}
                                </Link>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </ExperienceGroupSlider>
                  </section>
                );
              })
            : null}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
