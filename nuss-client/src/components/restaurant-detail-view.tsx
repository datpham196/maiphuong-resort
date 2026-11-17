"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { getApiBase } from "@/services/api";
import type { PublicRestaurant } from "@/services/restaurants";

type Props = {
  item: PublicRestaurant;
  locale: string;
};

function mediaUrl(url: string | null | undefined) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${getApiBase()}${url}`;
}

function formatPrice(
  amount: number | null,
  currency: string,
  priceLabel: string | null,
  locale: string,
) {
  if (priceLabel?.trim()) return priceLabel.trim();
  if (amount == null) return null;
  return `${amount.toLocaleString(locale === "en" ? "en-US" : "vi-VN")} ${currency}`;
}

export function RestaurantDetailView({ item, locale }: Props) {
  const t = useTranslations("Restaurants");
  const isBar = item.kind === "bar";
  const copyKey = isBar ? "detail.bar" : "detail.restaurant";
  const title = t(`${copyKey}.heroTitle`);
  const heroLead = t(`${copyKey}.heroLead`);
  const contactCta = t(`${copyKey}.contactCta`);
  const contactHref = t(`${copyKey}.contactHref`);
  const menuCta = t(`${copyKey}.viewFullMenu`);

  const slides = useMemo(
    () =>
      item.slides
        .map((slide) => {
          const src = mediaUrl(slide.url);
          if (!src) return null;
          return { id: slide.id, src, alt: slide.altText ?? title };
        })
        .filter((slide): slide is { id: string; src: string; alt: string } => slide != null),
    [item.slides, title],
  );

  const menuImages = useMemo(
    () =>
      item.menuImages
        .map((image) => {
          const src = mediaUrl(image.url);
          if (!src) return null;
          return { id: image.id, src, alt: image.altText ?? title };
        })
        .filter((image): image is { id: string; src: string; alt: string } => image != null),
    [item.menuImages, title],
  );

  const coverSrc = mediaUrl(item.coverImageUrl);
  const mainSrc = mediaUrl(item.mainImage?.url);
  const signatureSrc = mediaUrl(item.signatureImage?.url);
  const heroSlides = useMemo(() => {
    if (slides.length > 0) return slides;
    if (coverSrc) return [{ id: "cover", src: coverSrc, alt: title }];
    if (mainSrc) return [{ id: "main", src: mainSrc, alt: title }];
    return [] as { id: string; src: string; alt: string }[];
  }, [slides, coverSrc, mainSrc, title]);

  const categoriesWithItems = item.menu.filter((category) => category.items.length > 0);
  const [activeCategoryId, setActiveCategoryId] = useState(categoriesWithItems[0]?.id ?? "");
  const [slideIndex, setSlideIndex] = useState(0);
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const sliderRef = useRef<HTMLElement | null>(null);
  const [direction, setDirection] = useState<"prev" | "next" | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const [finePointer, setFinePointer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const goToSlide = useCallback(
    (nextIndex: number) => {
      const total = heroSlides.length;
      if (total === 0) return;
      setSlideIndex(((nextIndex % total) + total) % total);
    },
    [heroSlides.length],
  );
  const goPrevSlide = useCallback(() => goToSlide(slideIndex - 1), [goToSlide, slideIndex]);
  const goNextSlide = useCallback(() => goToSlide(slideIndex + 1), [goToSlide, slideIndex]);

  useEffect(() => {
    if (!categoriesWithItems.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId(categoriesWithItems[0]?.id ?? "");
    }
  }, [activeCategoryId, categoriesWithItems]);

  useEffect(() => {
    const pointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPointer = () => setFinePointer(pointerMedia.matches);
    const syncMotion = () => setReduceMotion(motionMedia.matches);
    syncPointer();
    syncMotion();
    pointerMedia.addEventListener("change", syncPointer);
    motionMedia.addEventListener("change", syncMotion);
    return () => {
      pointerMedia.removeEventListener("change", syncPointer);
      motionMedia.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1 || !finePointer || paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [finePointer, paused, reduceMotion, heroSlides.length]);

  const closeMenuLightbox = useCallback(() => setMenuOpenIndex(null), []);
  const showPrevMenu = useCallback(() => {
    setMenuOpenIndex((index) => {
      if (index == null || menuImages.length === 0) return index;
      return (index - 1 + menuImages.length) % menuImages.length;
    });
  }, [menuImages.length]);
  const showNextMenu = useCallback(() => {
    setMenuOpenIndex((index) => {
      if (index == null || menuImages.length === 0) return index;
      return (index + 1) % menuImages.length;
    });
  }, [menuImages.length]);

  useEffect(() => {
    if (menuOpenIndex == null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenuLightbox();
      if (event.key === "ArrowLeft") showPrevMenu();
      if (event.key === "ArrowRight") showNextMenu();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpenIndex, closeMenuLightbox, showPrevMenu, showNextMenu]);

  const activeCategory =
    categoriesWithItems.find((category) => category.id === activeCategoryId)
    ?? categoriesWithItems[0]
    ?? null;
  const menuCurrent = menuOpenIndex != null ? menuImages[menuOpenIndex] : null;

  const onSliderMove = (event: MouseEvent<HTMLElement>) => {
    if (!finePointer || !sliderRef.current || heroSlides.length <= 1) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const third = rect.width / 3;
    if (x < third) {
      setDirection("prev");
      setCursor({ x, y, visible: true });
      return;
    }
    if (x > third * 2) {
      setDirection("next");
      setCursor({ x, y, visible: true });
      return;
    }
    setDirection(null);
    setCursor({ x, y, visible: false });
  };

  const onSliderLeave = () => {
    setCursor((current) => ({ ...current, visible: false }));
    setDirection(null);
  };

  const onSliderClick = () => {
    if (direction === "prev") goPrevSlide();
    if (direction === "next") goNextSlide();
  };

  return (
    <main className="restaurant-detail-page is-fixed">
      <section
        ref={sliderRef}
        className={`feature-slider restaurant-feature-slider${isBar ? " is-bar" : ""}${direction ? ` is-${direction}` : ""}`}
        aria-label={t("heroSliderAria")}
        aria-roledescription="carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseMove={onSliderMove}
        onMouseLeave={() => {
          setPaused(false);
          onSliderLeave();
        }}
        onClick={onSliderClick}
      >
        {heroSlides.length > 0 ? (
          heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`feature-slide${index === slideIndex ? " is-active" : ""}`}
              aria-hidden={index !== slideIndex}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.src} alt={slide.alt} />
            </div>
          ))
        ) : (
          <div className="feature-slide is-active restaurant-feature-fallback" aria-hidden="true" />
        )}

        <div className="feature-slider-copy">
          <p className="feature-slider-eyebrow">{t(`${copyKey}.heroEyebrow`)}</p>
          <h1>{title}</h1>
          {heroLead ? <p className="restaurant-hero-lead">{heroLead}</p> : null}
          {!isBar ? (
            <a
              className="feature-slider-link"
              href="#menu"
              onClick={(event) => event.stopPropagation()}
            >
              {menuCta}
            </a>
          ) : null}
        </div>

        {heroSlides.length > 1 ? (
          <div className="feature-slider-dots" role="tablist" aria-label={t("heroDotsAria")}>
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === slideIndex}
                aria-label={t("heroGoTo", { index: index + 1 })}
                className={index === slideIndex ? "is-active" : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  goToSlide(index);
                }}
              />
            ))}
          </div>
        ) : null}

        {finePointer && heroSlides.length > 1 ? (
          <div
            className={`feature-slider-cursor${cursor.visible ? " is-visible" : ""}${
              direction ? ` is-${direction}` : ""
            }`}
            style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
            aria-hidden="true"
          >
            <span />
          </div>
        ) : null}

        {heroSlides.length > 1 ? (
          <div className="feature-slider-controls">
            <button
              type="button"
              aria-label={t("heroPrev")}
              onClick={(event) => {
                event.stopPropagation();
                goPrevSlide();
              }}
            >
              {t("heroPrev")}
            </button>
            <button
              type="button"
              aria-label={t("heroNext")}
              onClick={(event) => {
                event.stopPropagation();
                goNextSlide();
              }}
            >
              {t("heroNext")}
            </button>
          </div>
        ) : null}
      </section>

      <section className={`restaurant-intro${isBar ? " is-bar" : ""}`}>
        <div className="restaurant-intro-copy">
          <p className="eyebrow">{t(`${copyKey}.introEyebrow`)}</p>
          <h2>{t(`${copyKey}.introHeading`)}</h2>
          <p>{t(`${copyKey}.introBody`)}</p>
          <p>{t(`${copyKey}.introBodySecondary`)}</p>
          {contactCta && contactHref ? (
            <a className="restaurant-intro-cta" href={contactHref}>
              {contactCta}
            </a>
          ) : null}
        </div>
        <div className={`restaurant-intro-media${mainSrc ? "" : " is-placeholder"}`}>
          {mainSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainSrc} alt={item.mainImage?.altText ?? title} />
          ) : (
            <p>{t(`${copyKey}.imagePlaceholder`)}</p>
          )}
        </div>
      </section>

      <section className="restaurant-menu" id="menu">
        <div className="restaurant-menu-head">
          <p className="eyebrow">{t(`${copyKey}.menuEyebrow`)}</p>
          <h2>{t(`${copyKey}.menuHeading`)}</h2>
          <p>{t(`${copyKey}.menuLead`)}</p>
        </div>

        <div className="restaurant-menu-layout">
          <div className="restaurant-menu-main">
            {categoriesWithItems.length > 0 ? (
              <>
                <div className="restaurant-menu-tabs" role="tablist" aria-label="Menu categories">
                  {categoriesWithItems.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      role="tab"
                      aria-selected={category.id === activeCategory?.id}
                      className={category.id === activeCategory?.id ? "is-active" : undefined}
                      onClick={() => setActiveCategoryId(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                <ul className="restaurant-menu-list">
                  {(activeCategory?.items ?? []).map((dish) => {
                    const price = formatPrice(dish.priceAmount, dish.priceCurrency, dish.priceLabel, locale);
                    return (
                      <li key={dish.id}>
                        <div>
                          <h3>{dish.name}</h3>
                          {dish.description ? <p>{dish.description}</p> : null}
                        </div>
                        {price ? <strong>{price}</strong> : null}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="restaurant-menu-empty">{t("menuEmpty")}</p>
            )}

            {menuImages.length > 0 ? (
              <button
                type="button"
                className="restaurant-menu-full"
                onClick={() => setMenuOpenIndex(0)}
              >
                {menuCta}
              </button>
            ) : null}
          </div>

          {signatureSrc ? (
            <aside className="restaurant-menu-signature">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signatureSrc} alt={item.signatureImage?.altText ?? title} />
            </aside>
          ) : null}
        </div>
      </section>

      {menuOpenIndex != null && menuCurrent ? (
        <div className="restaurant-lightbox" role="dialog" aria-modal="true" aria-label={t("menuGalleryAria")}>
          <button
            type="button"
            className="restaurant-lightbox-backdrop"
            aria-label={t("lightboxClose")}
            onClick={closeMenuLightbox}
          />
          <div className="restaurant-lightbox-panel">
            <button
              type="button"
              className="restaurant-lightbox-close"
              onClick={closeMenuLightbox}
              aria-label={t("lightboxClose")}
            >
              <span aria-hidden="true">×</span>
            </button>
            {menuImages.length > 1 ? (
              <button
                type="button"
                className="restaurant-lightbox-nav is-prev"
                onClick={showPrevMenu}
                aria-label={t("lightboxPrev")}
              >
                <span aria-hidden="true" />
              </button>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="restaurant-lightbox-image" src={menuCurrent.src} alt={menuCurrent.alt} />
            {menuImages.length > 1 ? (
              <button
                type="button"
                className="restaurant-lightbox-nav is-next"
                onClick={showNextMenu}
                aria-label={t("lightboxNext")}
              >
                <span aria-hidden="true" />
              </button>
            ) : null}
            <p className="restaurant-lightbox-counter">
              {(menuOpenIndex ?? 0) + 1} / {menuImages.length}
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
