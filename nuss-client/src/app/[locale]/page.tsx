import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingBar } from "@/components/booking-bar";
import { FeatureSlider } from "@/components/feature-slider";
import { HomeInquiryForm } from "@/components/home-inquiry-form";
import { RoomSlider, type RoomSliderItem } from "@/components/room-slider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { getApiBase } from "@/services/api";
import { fetchPublicExperiences } from "@/services/experiences";
import { fetchPublicGallery } from "@/services/gallery";
import { fetchPublicRestaurants } from "@/services/restaurants";
import { fetchPublicRooms } from "@/services/rooms";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  let roomItems: RoomSliderItem[] = [];
  try {
    const rooms = await fetchPublicRooms(locale);
    roomItems = rooms.slice(0, 6).map((room) => ({
      key: room.id,
      title: room.content.title,
      text: room.content.shortDescription ?? "",
      image: room.coverImage?.url
        ? room.coverImage.url.startsWith("http")
          ? room.coverImage.url
          : `${getApiBase()}${room.coverImage.url}`
        : "",
      alt: room.coverImage?.altText ?? room.content.title,
      href: `/rooms/${room.slug}`,
      priceLabel:
        room.rackRate != null
          ? new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(room.rackRate)
          : null,
    }));
  } catch {
    roomItems = [];
  }

  let experienceItems: {
    key: string;
    title: string;
    text: string;
    image: string | null;
    alt: string;
    href: string;
  }[] = [];
  try {
    const experiences = await fetchPublicExperiences(locale);
    experienceItems = experiences.slice(0, 4).map((item) => ({
      key: item.id,
      title: item.title,
      text: item.shortDescription ?? "",
      image: item.coverImage?.url
        ? item.coverImage.url.startsWith("http")
          ? item.coverImage.url
          : `${getApiBase()}${item.coverImage.url}`
        : null,
      alt: item.coverImage?.altText ?? item.title,
      href: `/experiences/${item.slug}`,
    }));
  } catch {
    experienceItems = [];
  }

  let restaurants: {
    key: string;
    title: string;
    text: string;
    image: string | null;
    alt: string;
    href: string;
  }[] = [];
  try {
    const restaurantItems = await fetchPublicRestaurants(locale);
    restaurants = restaurantItems.slice(0, 4).map((item) => ({
      key: item.id,
      title: item.title,
      text: item.shortDescription ?? "",
      image: item.coverImageUrl
        ? item.coverImageUrl.startsWith("http")
          ? item.coverImageUrl
          : `${getApiBase()}${item.coverImageUrl}`
        : null,
      alt: item.title,
      href: `/restaurants/${item.slug}`,
    }));
  } catch {
    restaurants = [];
  }

  const offers = [
    {
      key: "stay",
      title: t("offer1Title"),
      text: t("offer1Text"),
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
      alt: t("offer1ImageAlt"),
    },
    {
      key: "spa",
      title: t("offer2Title"),
      text: t("offer2Text"),
      image:
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      alt: t("offer2ImageAlt"),
    },
  ];

  let gallery: { key: string; image: string }[] = [];
  try {
    const galleryItems = await fetchPublicGallery(locale);
    gallery = galleryItems.slice(0, 4).map((item) => ({
      key: item.id,
      image: item.url.startsWith("http") ? item.url : `${getApiBase()}${item.url}`,
    }));
  } catch {
    gallery = [];
  }

  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero" aria-label={t("heroAria")}>
          <Image
            src="/Overview.jpg"
            alt={t("heroImageAlt")}
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-copy">
            <div className="hero-intro">
              <p className="hero-eyebrow">{t("heroEyebrow")}</p>
              <h1>{t("heroTitle")}</h1>
              <p className="hero-lead">{t("heroLead")}</p>
              <div className="hero-actions">
                <Link className="hero-cta is-primary" href="/rooms">
                  {t("heroCtaRooms")}
                </Link>
                <Link className="hero-cta is-ghost" href="/about">
                  {t("heroCtaAbout")}
                </Link>
              </div>
            </div>
            <BookingBar />
          </div>
        </section>

        <section className="home-section" id="about" aria-label={t("aboutSectionTitle")}>
          <div className="home-preview story">
            <div className="story-photo">
              <Image
                src="/index/intro_small.jpg"
                alt={t("aboutPreviewImageAlt")}
                fill
                sizes="(max-width: 980px) 100vw, 58vw"
              />
            </div>
            <div className="story-copy">
              <h3>{t("aboutPreviewTitle")}</h3>
              <p>{t("aboutPreviewText")}</p>
              <p>{t("aboutPreviewText2")}</p>
              <Link className="story-cta" href="/about">
                {t("aboutPreviewCta")}
              </Link>
            </div>
          </div>
        </section>

        <FeatureSlider />

        <section className="home-section is-cream" id="experiences" aria-labelledby="home-experiences-title">
          <div className="home-section-head">
            <h2 id="home-experiences-title">{t("experiencesSectionTitle")}</h2>
            <Link className="see-more" href="/experiences">
              {t("seeMore")}
            </Link>
          </div>
          <div className="home-preview-grid">
            {experienceItems.map((item) => (
              <article key={item.key}>
                <div className="preview-photo">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.alt} />
                  ) : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link className="see-more" href={item.href}>
                  {t("seeDetails")}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <RoomSlider items={roomItems} />

        <section className="home-section is-cream" id="restaurants" aria-labelledby="home-restaurants-title">
          <div className="home-section-head">
            <h2 id="home-restaurants-title">{t("restaurantsSectionTitle")}</h2>
            <Link className="see-more" href="/restaurants">
              {t("seeMore")}
            </Link>
          </div>
          <div className="home-preview-grid">
            {restaurants.map((item) => (
              <article key={item.key}>
                <div className="preview-photo">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.alt} />
                  ) : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link className="see-more" href={item.href}>
                  {t("seeDetails")}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section" id="spa" aria-labelledby="home-spa-title">
          <div className="home-section-head">
            <h2 id="home-spa-title">{t("spaSectionTitle")}</h2>
            <Link className="see-more" href="/spa">
              {t("seeMore")}
            </Link>
          </div>
          <div className="home-preview story is-reversed">
            <div className="story-photo">
              <Image
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80"
                alt={t("spaPreviewImageAlt")}
                fill
                sizes="(max-width: 980px) 100vw, 42vw"
              />
            </div>
            <div>
              <p className="eyebrow">{t("spaPreviewEyebrow")}</p>
              <h3>{t("spaPreviewTitle")}</h3>
              <p>{t("spaPreviewText")}</p>
              <Link className="text-link" href="/spa">
                {t("seeMore")}
              </Link>
            </div>
          </div>
        </section>

        <section className="home-section is-cream" id="offers" aria-labelledby="home-offers-title">
          <div className="home-section-head">
            <h2 id="home-offers-title">{t("offersSectionTitle")}</h2>
            <Link className="see-more" href="/offers">
              {t("seeMore")}
            </Link>
          </div>
          <div className="home-preview-grid">
            {offers.map((item) => (
              <article key={item.key}>
                <div className="preview-photo">
                  <Image src={item.image} alt={item.alt} fill sizes="(max-width: 720px) 100vw, 50vw" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link className="see-more" href="/offers">
                  {t("seeDetails")}
                </Link>
              </article>
            ))}
          </div>
        </section>

        {gallery.length > 0 ? (
          <section className="home-section" id="gallery" aria-labelledby="home-gallery-title">
            <div className="home-section-head">
              <h2 id="home-gallery-title">{t("gallerySectionTitle")}</h2>
              <Link className="see-more" href="/gallery">
                {t("seeMore")}
              </Link>
            </div>
            <div className="gallery-preview-grid">
              {gallery.map((item) => (
                <article key={item.key}>
                  <div className="preview-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="inquiry-band" id="inquiry" aria-labelledby="home-inquiry-title">
          <div className="inquiry-band-inner">
            <p className="eyebrow">{t("inquiryEyebrow")}</p>
            <h2 id="home-inquiry-title">{t("inquiryTitle")}</h2>
            <p>{t("inquiryBody")}</p>
            <HomeInquiryForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
