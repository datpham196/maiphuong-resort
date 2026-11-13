import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "@/styles/rooms.css";
import "@/styles/booking.css";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function BookingSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("BookingSuccess");

  const code = first(query.code);
  const ref = first(query.ref);
  const room = first(query.room);
  const rooms = first(query.rooms);
  const checkIn = first(query.checkIn);
  const checkOut = first(query.checkOut);

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="rooms-shell">
        <main className="booking-success-page">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1>{t("title")}</h1>
          <p>{t("body")}</p>

          <dl className="booking-success-facts">
            {code ? (
              <div>
                <dt>{t("requestCode")}</dt>
                <dd>{code}</dd>
              </div>
            ) : null}
            {ref ? (
              <div>
                <dt>{t("bookingReference")}</dt>
                <dd>{ref}</dd>
              </div>
            ) : null}
            {room ? (
              <div>
                <dt>{t("room")}</dt>
                <dd>{room}</dd>
              </div>
            ) : null}
            {rooms ? (
              <div>
                <dt>{t("roomCount")}</dt>
                <dd>{rooms}</dd>
              </div>
            ) : null}
            {checkIn && checkOut ? (
              <div>
                <dt>{t("dates")}</dt>
                <dd>
                  {checkIn} → {checkOut}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="booking-success-actions">
            <Link className="booking-submit" href="/rooms">
              {t("backToRooms")}
            </Link>
            <Link className="booking-back" href="/">
              {t("backHome")}
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
