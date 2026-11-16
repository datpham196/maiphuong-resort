import { getTranslations, setRequestLocale } from "next-intl/server";
import { GuestGalleryLightbox } from "@/components/guest-gallery-lightbox";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getApiBase } from "@/services/api";
import { fetchPublicGallery, type PublicGalleryImage } from "@/services/gallery";
import "@/styles/gallery.css";
import "@/styles/rooms.css";

type Props = {
  params: Promise<{ locale: string }>;
};

function mediaUrl(url: string) {
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Gallery");
  const tHeader = await getTranslations("Header");

  let items: PublicGalleryImage[] = [];
  let loadError = false;
  try {
    items = await fetchPublicGallery(locale);
  } catch {
    loadError = true;
  }

  const images = items.map((item) => ({
    id: item.id,
    src: mediaUrl(item.url),
    alt: "",
  }));

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="gallery-shell">
        <main className="gallery-page">
          <section className="gallery-hero">
            <p className="eyebrow">{tHeader("gallery")}</p>
            <h1>{t("title")}</h1>
            <p>{t("intro")}</p>
          </section>

          {loadError ? <p className="gallery-empty">{t("error")}</p> : null}
          {!loadError && items.length === 0 ? <p className="gallery-empty">{t("empty")}</p> : null}

          {!loadError && images.length > 0 ? (
            <GuestGalleryLightbox
              images={images}
              galleryLabel={t("galleryAria")}
              closeLabel={t("close")}
              prevLabel={t("prev")}
              nextLabel={t("next")}
            />
          ) : null}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
