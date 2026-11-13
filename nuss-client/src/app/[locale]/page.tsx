import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingBar } from "@/components/booking-bar";
import { FeatureSlider } from "@/components/feature-slider";
import { RoomSlider, type RoomSliderItem } from "@/components/room-slider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { getApiBase } from "@/services/api";
import { fetchPublicExperiences } from "@/services/experiences";
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

  const gallery = [
    {
      key: "pool",
      title: t("gallery1Title"),
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
      alt: t("gallery1ImageAlt"),
    },
    {
      key: "sea",
      title: t("gallery2Title"),
      image:
        "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80",
      alt: t("gallery2ImageAlt"),
    },
  ];

  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="hero" aria-label={t("heroAria")}>
          <Image
            src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=2000&q=80"
            alt={t("heroImageAlt")}
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-copy">
            <h1>{t("brand")}</h1>
            <p>{t("heroSubtitle")}</p>
            <BookingBar />
          </div>
        </section>

        <section className="intro">
          <h2>{t("introTitle")}</h2>
          <p>{t("introBody")}</p>
          <div className="intro-contact">
            <p className="eyebrow">{t("contactEyebrow")}</p>
            <p>{t("contactHint")}</p>
            <Link href="/contact">{t("contactLink")}</Link>
          </div>
        </section>

        <FeatureSlider />

        <section className="home-section" id="about" aria-labelledby="home-about-title">
          <div className="home-section-head">
            <h2 id="home-about-title">{t("aboutSectionTitle")}</h2>
            <Link className="see-more" href="/about">
              {t("seeMore")}
            </Link>
          </div>
          <div className="home-preview story">
            <div className="story-photo">
              <Image
                src="https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&w=1600&q=80"
                alt={t("aboutPreviewImageAlt")}
                fill
                sizes="(max-width: 980px) 100vw, 58vw"
              />
            </div>
            <div>
              <p className="eyebrow">{t("aboutPreviewEyebrow")}</p>
              <h3>{t("aboutPreviewTitle")}</h3>
              <p>{t("aboutPreviewText")}</p>
              <Link className="text-link" href="/about">
                {t("seeMore")}
              </Link>
            </div>
          </div>
        </section>

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
                  <Image src={item.image} alt={item.alt} fill sizes="(max-width: 720px) 100vw, 50vw" />
                </div>
                <h3>{item.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="booking-band" id="booking">
          <p className="eyebrow">{t("bookingEyebrow")}</p>
          <h2>{t("bookingTitle")}</h2>
          <p>{t("bookingBody")}</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
