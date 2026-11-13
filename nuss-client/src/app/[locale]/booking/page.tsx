import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BookingForm } from "@/components/booking-form";
import { fetchPublicRooms } from "@/services/rooms";
import "@/styles/home.css";
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

function toInt(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Booking");

  let rooms: Awaited<ReturnType<typeof fetchPublicRooms>> = [];
  let loadError = false;
  try {
    rooms = await fetchPublicRooms(locale);
  } catch {
    loadError = true;
  }

  const slug = first(query.slug);
  const checkIn = first(query.checkIn);
  const checkOut = first(query.checkOut);
  const adults = toInt(first(query.adults), 2);
  const children = toInt(first(query.children), 0);

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="rooms-shell">
        <main className="booking-page">
          <section className="booking-hero">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1>{t("title")}</h1>
            <p>{t("intro")}</p>
          </section>

          {loadError ? <p className="rooms-empty">{t("roomsError")}</p> : null}
          {!loadError && rooms.length === 0 ? <p className="rooms-empty">{t("roomsEmpty")}</p> : null}
          {!loadError && rooms.length > 0 ? (
            <BookingForm
              rooms={rooms}
              initialSlug={slug}
              initialCheckIn={checkIn}
              initialCheckOut={checkOut}
              initialAdults={adults}
              initialChildren={children}
            />
          ) : null}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
