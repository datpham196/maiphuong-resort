import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import "@/styles/offers.css";

type Props = {
  params: Promise<{ locale: string }>;
};

const OFFER_IMAGES = {
  stayLonger:
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80",
  stayRelax:
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80",
  stayDine:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80",
  family:
    "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1400&q=80",
} as const;

export default async function OffersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Offers");

  const offers = [
    {
      key: "stayLonger",
      image: OFFER_IMAGES.stayLonger,
      title: t("cards.stayLonger.title"),
      text: t("cards.stayLonger.text"),
      tag1: t("cards.stayLonger.tag1"),
      tag2: t("cards.stayLonger.tag2"),
    },
    {
      key: "stayRelax",
      image: OFFER_IMAGES.stayRelax,
      title: t("cards.stayRelax.title"),
      text: t("cards.stayRelax.text"),
      tag1: t("cards.stayRelax.tag1"),
      tag2: t("cards.stayRelax.tag2"),
    },
    {
      key: "stayDine",
      image: OFFER_IMAGES.stayDine,
      title: t("cards.stayDine.title"),
      text: t("cards.stayDine.text"),
      tag1: t("cards.stayDine.tag1"),
      tag2: t("cards.stayDine.tag2"),
    },
    {
      key: "family",
      image: OFFER_IMAGES.family,
      title: t("cards.family.title"),
      text: t("cards.family.text"),
      tag1: t("cards.family.tag1"),
      tag2: t("cards.family.tag2"),
    },
  ] as const;

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="offers-shell">
        <main className="offers-page">
          <section className="offers-hero">
            <div>
              <p className="eyebrow">{t("heroEyebrow")}</p>
              <h1>{t("heroTitle")}</h1>
            </div>
            <p className="offers-hero-lead">{t("heroLead")}</p>
          </section>

          <section className="offers-grid" aria-label={t("heroTitle")}>
            {offers.map((offer) => (
              <article key={offer.key} className="offer-card">
                <div className="offer-card-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={offer.image} alt={offer.title} />
                </div>
                <div className="offer-card-body">
                  <span className="offer-badge">{t("conceptBadge")}</span>
                  <h2>{offer.title}</h2>
                  <p>{offer.text}</p>
                  <div className="offer-tags">
                    <span>{offer.tag1}</span>
                    <span>{offer.tag2}</span>
                  </div>
                  <Link className="offer-card-link" href="/booking">
                    {t("viewPackage")}
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
