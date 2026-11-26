import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { AboutArchiveGallery } from "@/components/about-archive-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "@/styles/about.css";

type Props = {
  params: Promise<{ locale: string }>;
};

const asset = (path: string) => encodeURI(path);

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

  const archiveItems = [
    {
      id: "01",
      indexLabel: "ARCHIVE 01",
      title: t("archive1Title"),
      body: t("archive1Body"),
      image: asset("/about/MP old/1.jpg"),
      alt: t("archive1Title"),
    },
    {
      id: "02",
      indexLabel: "ARCHIVE 02",
      title: t("archive2Title"),
      body: t("archive2Body"),
      image: asset("/about/MP old/2.JPG"),
      alt: t("archive2Title"),
    },
    {
      id: "03",
      indexLabel: "ARCHIVE 03",
      title: t("archive3Title"),
      body: t("archive3Body"),
      image: asset("/about/MP old/3.JPG"),
      alt: t("archive3Title"),
    },
    {
      id: "04",
      indexLabel: "ARCHIVE 04",
      title: t("archive4Title"),
      body: t("archive4Body"),
      image: asset("/about/MP old/4.JPG"),
      alt: t("archive4Title"),
    },
    {
      id: "05",
      indexLabel: "ARCHIVE 05",
      title: t("archive5Title"),
      body: t("archive5Body"),
      image: asset("/about/MP old/5.JPG"),
      alt: t("archive5Title"),
    },
    {
      id: "06",
      indexLabel: "ARCHIVE 06",
      title: t("archive6Title"),
      body: t("archive6Body"),
      image: asset("/about/MP old/6.JPG"),
      alt: t("archive6Title"),
    },
    {
      id: "07",
      indexLabel: "ARCHIVE 07",
      title: t("archive7Title"),
      body: t("archive7Body"),
      image: asset("/about/MP old/7.JPG"),
      alt: t("archive7Title"),
    },
    {
      id: "08",
      indexLabel: "ARCHIVE 08",
      title: t("archive8Title"),
      body: t("archive8Body"),
      image: asset("/about/MP old/8.JPG"),
      alt: t("archive8Title"),
    },
    {
      id: "09",
      indexLabel: "ARCHIVE 09",
      title: t("archive9Title"),
      body: t("archive9Body"),
      image: asset("/about/MP old/9.jpg"),
      alt: t("archive9Title"),
    },
  ];

  return (
    <>
      <SiteHeader tone="on-light" />
      <main id="top" className="about-page" aria-label={t("pageAria")}>
        <section className="section story-first" id="location" aria-labelledby="story-first-title">
          <div className="shell split story-first-grid">
            <div className="narrow-copy story-first-copy">
              <p className="eyebrow">
                <span>{t("s01Eyebrow")}</span>
              </p>
              <h1 id="story-first-title">
                <span>{t("s01TitleLine1")}</span>
                <em>{t("s01TitleLine2")}</em>
              </h1>
              <p className="intro-small">{t("s01Intro")}</p>
              <p>{t("s01Body")}</p>
              <div className="location-stat">
                <div>
                  <b>{t("s01StatPlace")}</b>
                  <span>{t("s01StatPlaceHint")}</span>
                </div>
                <div>
                  <b>{t("s01StatSince")}</b>
                  <span>{t("s01StatSinceHint")}</span>
                </div>
              </div>
              <a className="outline-link story-first-link" href="#beginning">
                <span>{t("s01Cta")}</span>
                <span className="line-arrow" aria-hidden="true" />
              </a>
            </div>

            <div className="map-col">
              <div className="map-frame">
                <Image
                  src={asset("/about/map/Map.png")}
                  alt={t("s01MapAlt")}
                  width={880}
                  height={1100}
                  priority
                  sizes="(max-width: 760px) 85vw, 520px"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <p className="map-caption">{t("s01MapCaption")}</p>
            </div>
          </div>
        </section>

        <section className="section founder" id="beginning">
          <div className="shell founder-inner">
            <div className="founder-copy">
              <p className="eyebrow on-dark">
                <span>{t("s02Eyebrow")}</span>
              </p>
              <div className="founder-bigyear">{t("s02Year")}</div>
              <h2>{t("s02Title")}</h2>
              <p>{t("s02Body1")}</p>
              <p>{t("s02Body2")}</p>
              <p className="archive-note">{t("s02Note")}</p>
            </div>
            <div className="founder-visual">
              <div className="founder-photo-1">
                <Image
                  src={asset("/about/MP old/IMG_8550.JPG")}
                  alt={t("s02Photo1Alt")}
                  fill
                  sizes="(max-width: 760px) 90vw, 45vw"
                />
              </div>
              <div className="founder-photo-2">
                <Image
                  src={asset("/about/MP old/DSC_0740.JPG")}
                  alt={t("s02Photo2Alt")}
                  fill
                  sizes="(max-width: 760px) 60vw, 30vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section section-warm" id="archive">
          <div className="shell">
            <div className="gallery-intro">
              <p className="eyebrow centered">
                <span>{t("s03Eyebrow")}</span>
              </p>
              <h2>{t("s03Title")}</h2>
              <p>{t("s03Lead")}</p>
            </div>
            <AboutArchiveGallery
              items={archiveItems}
              toolbar={t("s03Toolbar")}
              prevLabel={t("s03Prev")}
              nextLabel={t("s03Next")}
              closeLabel={t("s03Close")}
              lightboxSuffix={t("s03LightboxSuffix")}
            />
          </div>
        </section>

        <section className="section section-warm" id="journey" style={{ paddingTop: 25 }}>
          <div className="shell">
            <div className="timeline-head">
              <p className="eyebrow centered">
                <span>{t("s04Eyebrow")}</span>
              </p>
              <h2>{t("s04Title")}</h2>
              <p>{t("s04Lead")}</p>
            </div>
            <div className="timeline-list">
              <div className="timeline-row">
                <div className="timeline-left">
                  <div className="timeline-year">{t("s04Y2002")}</div>
                  <p>{t("s04Y2002Body")}</p>
                </div>
                <div className="timeline-node" aria-hidden="true" />
                <div className="blank" aria-hidden="true" />
              </div>
              <div className="timeline-row">
                <div className="blank" aria-hidden="true" />
                <div className="timeline-node" aria-hidden="true" />
                <div className="timeline-right">
                  <div className="timeline-year is-text">{t("s04MidTitle")}</div>
                  <p>{t("s04MidBody")}</p>
                </div>
              </div>
              <div className="timeline-row">
                <div className="timeline-left">
                  <div className="timeline-year">{t("s04Y2026")}</div>
                  <p>{t("s04Y2026Body")}</p>
                </div>
                <div className="timeline-node" aria-hidden="true" />
                <div className="blank" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <section className="compare" id="then-now">
          <div className="shell compare-top">
            <p className="eyebrow centered">
              <span>{t("s05Eyebrow")}</span>
            </p>
            <h2>{t("s05Title")}</h2>
            <p>{t("s05Lead")}</p>
          </div>
          <div className="compare-grid">
            <article className="compare-item">
              <Image
                src={asset("/about/MP old/DSC_0655.JPG")}
                alt={t("s05ThenAlt")}
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
              />
              <div className="image-cover" />
              <div className="compare-label">
                <span>{t("s05ThenLabel")}</span>
                <h3>{t("s05ThenTitle")}</h3>
                <p>{t("s05ThenBody")}</p>
              </div>
            </article>
            <article className="compare-item">
              <Image
                src={asset("/about/MP new/Pool (7).jpg")}
                alt={t("s05NowAlt")}
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
              />
              <div className="image-cover" />
              <div className="compare-label">
                <span>{t("s05NowLabel")}</span>
                <h3>{t("s05NowTitle")}</h3>
                <p>{t("s05NowBody")}</p>
              </div>
            </article>
          </div>
        </section>

        <section className="section section-light" id="today">
          <div className="shell">
            <div className="today-head">
              <div>
                <p className="eyebrow">
                  <span>{t("s06Eyebrow")}</span>
                </p>
                <h2>{t("s06Title")}</h2>
              </div>
              <p>{t("s06Body")}</p>
            </div>
            <div className="today-photos">
              <div className="tile">
                <Image
                  src={asset("/about/MP new/Bungalow Sea View (3).jpg")}
                  alt={t("s06Alt1")}
                  fill
                  sizes="(max-width: 760px) 100vw, 40vw"
                />
                <span className="tile-caption">{t("s06Cap1")}</span>
              </div>
              <div className="tile">
                <Image
                  src={asset("/about/MP new/Lobby (4).jpg")}
                  alt={t("s06Alt2")}
                  fill
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
                <span className="tile-caption">{t("s06Cap2")}</span>
              </div>
              <div className="tile">
                <Image
                  src={asset("/about/MP new/Restaurant (11).jpg")}
                  alt={t("s06Alt3")}
                  fill
                  sizes="(max-width: 760px) 50vw, 30vw"
                />
                <span className="tile-caption">{t("s06Cap3")}</span>
              </div>
              <div className="tile">
                <Image
                  src={asset("/about/MP new/Restaurant (12).jpg")}
                  alt={t("s06Alt4")}
                  fill
                  sizes="(max-width: 760px) 50vw, 30vw"
                />
                <span className="tile-caption">{t("s06Cap4")}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="values" id="values">
          <div className="shell values-inner">
            <div>
              <p className="eyebrow">
                <span>{t("valuesEyebrow")}</span>
              </p>
              <h2>{t("valuesTitle")}</h2>
              <p>{t("valuesLead")}</p>
            </div>
            <div className="value-list">
              <div className="value">
                <span>01</span>
                <strong>{t("value1Title")}</strong>
                <small>{t("value1Body")}</small>
              </div>
              <div className="value">
                <span>02</span>
                <strong>{t("value2Title")}</strong>
                <small>{t("value2Body")}</small>
              </div>
              <div className="value">
                <span>03</span>
                <strong>{t("value3Title")}</strong>
                <small>{t("value3Body")}</small>
              </div>
            </div>
          </div>
        </section>

        <section className="closing" id="closing">
          <Image
            src={asset("/about/MP old/IMG20171207123829.jpg")}
            alt={t("closeAlt")}
            fill
            sizes="100vw"
            priority={false}
          />
          <div className="closing-inner">
            <p className="eyebrow centered on-dark">
              <span>{t("closeEyebrow")}</span>
            </p>
            <h2 className="closing-quote">{t("closeTitle")}</h2>
            <p className="closing-body">{t("closeBody")}</p>
            <a className="outline-link closing-cta" href="#location">
              <span>{t("closeCta")}</span>
              <span className="line-arrow" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
