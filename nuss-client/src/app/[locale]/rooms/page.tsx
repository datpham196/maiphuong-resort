import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchPublicRooms } from "@/services/rooms";
import { getApiBase } from "@/services/api";
import "@/styles/rooms.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RoomsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Rooms");
  const tHeader = await getTranslations("Header");

  let rooms: Awaited<ReturnType<typeof fetchPublicRooms>> = [];
  let loadError = false;
  try {
    rooms = await fetchPublicRooms(locale);
  } catch {
    loadError = true;
  }

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="rooms-shell">
        <main className="rooms-page">
          <section className="rooms-hero">
            <p className="eyebrow">{tHeader("rooms")}</p>
            <h1>{t("title")}</h1>
            <p>{t("intro")}</p>
          </section>

          {loadError ? <p className="rooms-empty">{t("error")}</p> : null}
          {!loadError && rooms.length === 0 ? <p className="rooms-empty">{t("empty")}</p> : null}

          <section className="rooms-list" aria-label={t("title")}>
            {rooms.map((room) => {
              const href = `/rooms/${room.slug}`;
              const imageUrl = room.coverImage?.url
                ? room.coverImage.url.startsWith("http")
                  ? room.coverImage.url
                  : `${getApiBase()}${room.coverImage.url}`
                : null;
              return (
                <article key={room.id} className="room-row">
                  <Link className="room-row-media" href={href} aria-label={room.content.title}>
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={room.coverImage?.altText ?? room.content.title} />
                    ) : (
                      <div className="room-row-placeholder" aria-hidden="true" />
                    )}
                  </Link>
                  <div className="room-row-body">
                    <h2>
                      <Link href={href}>{room.content.title}</Link>
                    </h2>
                    {room.content.shortDescription ? <p>{room.content.shortDescription}</p> : null}
                    <ul className="room-row-meta">
                      {room.maxOccupancy != null ? (
                        <li>{t("occupancy", { count: room.maxOccupancy })}</li>
                      ) : null}
                      {room.rackRate != null ? (
                        <li>
                          {t("fromPrice", {
                            price: room.rackRate.toLocaleString(locale === "en" ? "en-US" : "vi-VN"),
                          })}
                        </li>
                      ) : null}
                    </ul>
                    <Link className="see-more room-row-cta" href={href}>
                      {t("viewDetails")}
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
