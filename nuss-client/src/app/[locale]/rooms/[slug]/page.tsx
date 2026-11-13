import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RoomGalleryLightbox } from "@/components/room-gallery-lightbox";
import { ApiError } from "@/services/api";
import { fetchPublicRoom } from "@/services/rooms";
import { getApiBase } from "@/services/api";
import "@/styles/rooms.css";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function mediaUrl(url: string | null | undefined) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
}

export default async function RoomDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Rooms");

  let room;
  try {
    room = await fetchPublicRoom(slug, locale);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const gallerySource = room.images.length > 0 ? room.images : room.coverImage ? [room.coverImage] : [];
  const gallery = gallerySource
    .map((image) => {
      const src = mediaUrl(image.url);
      if (!src) return null;
      return {
        id: image.id,
        src,
        alt: image.altText ?? room.content.title,
      };
    })
    .filter((image): image is { id: string; src: string; alt: string } => image != null);

  const priceLabel =
    room.rackRate != null
      ? t("fromPrice", {
          price: room.rackRate.toLocaleString(locale === "en" ? "en-US" : "vi-VN"),
        })
      : null;

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="rooms-shell">
        <main className="room-detail-page">
          <div className="room-detail-top">
            <Link className="room-detail-back" href="/rooms">
              {t("backToRooms")}
            </Link>
            <section className="room-detail-hero">
              <p className="eyebrow">{room.pmsName}</p>
              <h1>{room.content.title}</h1>
              {room.content.shortDescription ? (
                <p className="room-detail-lead">{room.content.shortDescription}</p>
              ) : null}
            </section>
          </div>

          <RoomGalleryLightbox
            images={gallery}
            galleryLabel={t("galleryAria")}
            closeLabel={t("lightboxClose")}
            prevLabel={t("lightboxPrev")}
            nextLabel={t("lightboxNext")}
          />

          <div className="room-detail-layout">
            <div className="room-detail-main">
              {room.content.description ? (
                <section className="room-detail-section">
                  <p className="room-detail-kicker">{t("sectionOverview")}</p>
                  <h2>{t("sectionOverviewTitle")}</h2>
                  <p className="room-detail-description">{room.content.description}</p>
                </section>
              ) : null}

              {room.content.amenities.length > 0 ? (
                <section className="room-detail-section">
                  <p className="room-detail-kicker">{t("sectionAmenities")}</p>
                  <h2>{t("sectionAmenitiesTitle")}</h2>
                  <ul className="room-amenities">
                    {room.content.amenities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>

            <aside className="room-detail-aside">
              <div className="room-detail-facts">
                <p className="room-detail-kicker">{t("sectionStay")}</p>
                <h2>{t("sectionStayTitle")}</h2>
                {room.maxOccupancy != null ? (
                  <div className="room-fact">
                    <span>{t("factOccupancy")}</span>
                    <strong>{t("occupancy", { count: room.maxOccupancy })}</strong>
                  </div>
                ) : null}
                {priceLabel ? (
                  <div className="room-fact is-price">
                    <span>{t("factPrice")}</span>
                    <strong>{priceLabel}</strong>
                  </div>
                ) : null}
                <p className="room-fact-note">{t("priceNote")}</p>
                <Link className="room-detail-book" href={`/booking?slug=${encodeURIComponent(room.slug)}`}>
                  {t("bookCta")}
                </Link>
              </div>
            </aside>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
