import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("About");
  const tHeader = await getTranslations("Header");

  const facts = [
    { key: "island", label: t("factIslandLabel"), value: t("factIslandValue") },
    { key: "park", label: t("factParkLabel"), value: t("factParkValue") },
    { key: "coast", label: t("factCoastLabel"), value: t("factCoastValue") },
    { key: "season", label: t("factSeasonLabel"), value: t("factSeasonValue") },
  ];

  const highlights = [
    {
      key: "beaches",
      eyebrow: t("highlightBeachesEyebrow"),
      title: t("highlightBeachesTitle"),
      text: t("highlightBeachesText"),
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
      alt: t("highlightBeachesImageAlt"),
    },
    {
      key: "nature",
      eyebrow: t("highlightNatureEyebrow"),
      title: t("highlightNatureTitle"),
      text: t("highlightNatureText"),
      image:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80",
      alt: t("highlightNatureImageAlt"),
    },
    {
      key: "food",
      eyebrow: t("highlightFoodEyebrow"),
      title: t("highlightFoodTitle"),
      text: t("highlightFoodText"),
      image:
        "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1400&q=80",
      alt: t("highlightFoodImageAlt"),
    },
  ];

  const amenities = [
    {
      key: "rooms",
      eyebrow: t("amenityRoomsEyebrow"),
      title: t("amenityRoomsTitle"),
      text: t("amenityRoomsText"),
    },
    {
      key: "dining",
      eyebrow: t("amenityDiningEyebrow"),
      title: t("amenityDiningTitle"),
      text: t("amenityDiningText"),
    },
    {
      key: "spa",
      eyebrow: t("amenitySpaEyebrow"),
      title: t("amenitySpaTitle"),
      text: t("amenitySpaText"),
    },
    {
      key: "outdoors",
      eyebrow: t("amenityOutdoorsEyebrow"),
      title: t("amenityOutdoorsTitle"),
      text: t("amenityOutdoorsText"),
    },
    {
      key: "tours",
      eyebrow: t("amenityToursEyebrow"),
      title: t("amenityToursTitle"),
      text: t("amenityToursText"),
    },
    {
      key: "tickets",
      eyebrow: t("amenityTicketsEyebrow"),
      title: t("amenityTicketsTitle"),
      text: t("amenityTicketsText"),
    },
  ];

  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero page-hero" aria-label={t("heroAria")}>
          <Image
            src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=2000&q=80"
            alt={t("heroImageAlt")}
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-copy">
            <p className="page-hero-eyebrow">{t("heroEyebrow")}</p>
            <h1>{t("heroTitle")}</h1>
            <p>{t("heroLead")}</p>
          </div>
        </section>

        <section className="intro about-intro">
          <h2>{t("storyTitle")}</h2>
          <p>{t("storyBody")}</p>
          <p>{t("storyBodySecond")}</p>
          <p>{t("storyBodyThird")}</p>
        </section>

        <section className="about-facts" aria-label={t("factsAria")}>
          {facts.map((fact) => (
            <article key={fact.key}>
              <p className="eyebrow">{fact.label}</p>
              <p>{fact.value}</p>
            </article>
          ))}
        </section>

        <section className="story">
          <div className="story-photo">
            <Image
              src="https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1600&q=80"
              alt={t("placeImageAlt")}
              fill
              sizes="(max-width: 980px) 100vw, 58vw"
            />
          </div>
          <div>
            <p className="eyebrow">{t("placeEyebrow")}</p>
            <h2>{t("placeTitle")}</h2>
            <p>{t("placeBody")}</p>
            <p>{t("placeBodySecond")}</p>
            <Link className="text-link" href="/experiences">
              {t("placeLink")}
            </Link>
          </div>
        </section>

        <section className="story is-reversed">
          <div className="story-photo">
            <Image
              src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80"
              alt={t("locationImageAlt")}
              fill
              sizes="(max-width: 980px) 100vw, 42vw"
            />
          </div>
          <div>
            <p className="eyebrow">{t("locationEyebrow")}</p>
            <h2>{t("locationTitle")}</h2>
            <p>{t("locationBody")}</p>
            <p>{t("locationBodySecond")}</p>
            <Link className="text-link" href="/contact">
              {t("locationLink")}
            </Link>
          </div>
        </section>

        <section className="about-highlights" aria-label={t("highlightsAria")}>
          <div className="about-highlights-copy">
            <p className="eyebrow">{t("highlightsEyebrow")}</p>
            <h2>{t("highlightsTitle")}</h2>
            <p>{t("highlightsLead")}</p>
          </div>
          <div className="about-highlight-grid">
            {highlights.map((item) => (
              <article key={item.key}>
                <div className="offer-photo">
                  <Image src={item.image} alt={item.alt} fill sizes="(max-width: 720px) 100vw, 33vw" />
                </div>
                <p className="eyebrow">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="amenity-band" aria-label={t("amenitiesAria")}>
          <div className="amenity-band-copy">
            <p className="eyebrow">{t("amenitiesEyebrow")}</p>
            <h2>{t("amenitiesTitle")}</h2>
            <p>{t("amenitiesLead")}</p>
          </div>
          <div className="amenity-grid">
            {amenities.map((item) => (
              <article key={item.key}>
                <p className="eyebrow">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="booking-band">
          <p className="eyebrow">{t("ctaEyebrow")}</p>
          <h2>{t("ctaTitle")}</h2>
          <p>{t("ctaBody")}</p>
          <div className="about-cta-links">
            <Link className="book-button about-cta-button" href="/rooms">
              {tHeader("rooms")}
            </Link>
            <Link className="text-link" href="/booking">
              {tHeader("bookNow")}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
