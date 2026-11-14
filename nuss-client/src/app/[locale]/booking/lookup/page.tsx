import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingLookupView } from "@/components/booking-lookup-view";
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BookingLookup" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function BookingLookupPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const initialRef = first(query.ref);

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="rooms-shell">
        <BookingLookupView initialRef={initialRef} />
      </div>
      <SiteFooter />
    </>
  );
}
