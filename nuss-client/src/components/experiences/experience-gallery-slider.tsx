"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { mediaUrl } from "@/components/experiences/experience-media";
import type { ExperienceImage, PublicExperience } from "@/services/experiences";

type Props = {
  item: PublicExperience;
  groupLabel: string;
};

function buildSlides(item: PublicExperience): ExperienceImage[] {
  if (item.images.length > 0) {
    return [...item.images].sort((a, b) => {
      if (a.cover === b.cover) return a.displayOrder - b.displayOrder;
      return a.cover ? -1 : 1;
    });
  }
  if (item.coverImage) return [item.coverImage];
  return [];
}

export function ExperienceGallerySlider({ item, groupLabel }: Props) {
  const t = useTranslations("Experiences");
  const slides = useMemo(() => buildSlides(item), [item]);
  const rootRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"prev" | "next" | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const [finePointer, setFinePointer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const total = slides.length;

  const goTo = useCallback(
    (nextIndex: number) => {
      if (total === 0) return;
      setIndex(((nextIndex % total) + total) % total);
    },
    [total],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

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
    if (total <= 1 || paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [total, paused, reduceMotion]);

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (!finePointer || !rootRef.current || total <= 1) return;
    const rect = rootRef.current.getBoundingClientRect();
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

  const onLeave = () => {
    setCursor((current) => ({ ...current, visible: false }));
    setDirection(null);
  };

  const onClickZone = () => {
    if (direction === "prev") goPrev();
    else if (direction === "next") goNext();
  };

  return (
    <section
      ref={rootRef}
      className={`experience-gallery-slider${direction ? ` is-${direction}` : ""}`}
      aria-label={t("gallerySliderAria")}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseMove={onMove}
      onMouseLeave={() => {
        setPaused(false);
        onLeave();
      }}
      onClick={onClickZone}
    >
      {slides.length > 0 ? (
        slides.map((slide, slideIndex) => {
          const src = mediaUrl(slide.url);
          return (
            <div
              key={slide.id}
              className={`experience-gallery-slide${slideIndex === index ? " is-active" : ""}`}
              aria-hidden={slideIndex !== index}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={slide.altText ?? item.title} />
              ) : null}
            </div>
          );
        })
      ) : (
        <div className="experience-gallery-slide is-active is-empty" aria-hidden="false" />
      )}

      <div className="experience-gallery-slider-copy">
        <p className="experience-gallery-slider-eyebrow">{groupLabel}</p>
        <h1>{item.title}</h1>
        {item.shortDescription ? <p className="experience-gallery-slider-lead">{item.shortDescription}</p> : null}
      </div>

      {total > 1 ? (
        <div className="experience-gallery-slider-dots" role="tablist" aria-label={t("gallerySliderDots")}>
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              aria-label={t("gallerySliderGoTo", { index: slideIndex + 1 })}
              className={slideIndex === index ? "is-active" : undefined}
              onClick={(event) => {
                event.stopPropagation();
                goTo(slideIndex);
              }}
            />
          ))}
        </div>
      ) : null}

      {finePointer && total > 1 ? (
        <div
          className={`experience-gallery-slider-cursor${cursor.visible ? " is-visible" : ""}${
            direction ? ` is-${direction}` : ""
          }`}
          style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
          aria-hidden="true"
        >
          <span />
        </div>
      ) : null}

      {total > 1 ? (
        <div className="experience-gallery-slider-controls">
          <button
            type="button"
            aria-label={t("gallerySliderPrev")}
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
          >
            {t("gallerySliderPrev")}
          </button>
          <button
            type="button"
            aria-label={t("gallerySliderNext")}
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
          >
            {t("gallerySliderNext")}
          </button>
        </div>
      ) : null}
    </section>
  );
}
