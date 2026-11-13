import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getApiBase } from "@/services/api";
import { fetchPublicRestaurants, type PublicRestaurant } from "@/services/restaurants";
import "@/styles/restaurants.css";

type Props = {
  params: Promise<{ locale: string }>;
};

function coverSrc(url: string | null) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
}

export default async function RestaurantsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Restaurants");
  const tHeader = await getTranslations("Header");

  let items: PublicRestaurant[] = [];
  let loadError = false;
  try {
    items = await fetchPublicRestaurants(locale);
  } catch {
    loadError = true;
  }

  // Single published page → open it directly; list only when there are 2+.
  if (!loadError && items.length === 1 && items[0]?.slug) {
    redirect({ href: `/restaurants/${items[0].slug}`, locale });
  }

  return (
    <>
      <SiteHeader tone="on-light" />
      <div className="restaurants-shell">
        <main className="restaurants-page">
          <section className="restaurants-hero">
            <p className="eyebrow">{tHeader("restaurants")}</p>
            <h1>{t("title")}</h1>
            <p>{t("intro")}</p>
          </section>

          {loadError ? <p className="restaurants-empty">{t("error")}</p> : null}
          {!loadError && items.length === 0 ? <p className="restaurants-empty">{t("empty")}</p> : null}

          <section className="restaurants-list" aria-label={t("title")}>
            {items.map((item) => {
              const href = `/restaurants/${item.slug}`;
              const image = coverSrc(item.coverImageUrl);
              return (
                <article key={item.id} className="restaurant-row">
                  <Link className="restaurant-row-media" href={href} aria-label={item.title}>
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={item.title} />
                    ) : null}
                  </Link>
                  <div className="restaurant-row-body">
                    <h2>
                      <Link href={href}>{item.title}</Link>
                    </h2>
                    {item.shortDescription ? <p>{item.shortDescription}</p> : null}
                    <Link className="see-more" href={href}>
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
