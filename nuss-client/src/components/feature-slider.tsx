"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "@/i18n/navigation";

type Slide = {
  key: string;
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
  image: string;
  alt: string;
};

export function FeatureSlider() {
  const t = useTranslations("Home");
  const rootRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"prev" | "next" | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const [finePointer, setFinePointer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const slides: Slide[] = [
    {
      key: "spa",
      eyebrow: t("slideSpaEyebrow"),
      title: t("slideSpaTitle"),
      href: "/spa",
      linkLabel: t("slideSpaLink"),
      image:
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80",
      alt: t("slideSpaImageAlt"),
    },
    {
      key: "sea",
      eyebrow: t("slideSeaEyebrow"),
      title: t("slideSeaTitle"),
      href: "/experiences",
      linkLabel: t("slideSeaLink"),
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
      alt: t("slideSeaImageAlt"),
    },
    {
      key: "dining",
      eyebrow: t("slideDiningEyebrow"),
      title: t("slideDiningTitle"),
      href: "/restaurants",
      linkLabel: t("slideDiningLink"),
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=80",
      alt: t("slideDiningImageAlt"),
    },
  ];

  const goTo = useCallback(
    (nextIndex: number) => {
      const total = slides.length;
      setIndex(((nextIndex % total) + total) % total);
    },
    [slides.length],
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
    if (!finePointer || paused || reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [finePointer, paused, reduceMotion, slides.length]);

  const onMove = (event: MouseEvent<HTMLElement>) => {
    if (!finePointer || !rootRef.current) {
      return;
    }

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
    if (direction === "prev") {
      goPrev();
      return;
    }
    if (direction === "next") {
      goNext();
    }
  };

  const active = slides[index];

  return (
    <section
      ref={rootRef}
      className={`feature-slider${direction ? ` is-${direction}` : ""}`}
      aria-label={t("sliderAria")}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseMove={onMove}
      onMouseLeave={() => {
        setPaused(false);
        onLeave();
      }}
      onClick={onClickZone}
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.key}
          className={`feature-slide${slideIndex === index ? " is-active" : ""}`}
          aria-hidden={slideIndex !== index}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={slideIndex === 0}
            sizes="100vw"
          />
        </div>
      ))}

      <div className="feature-slider-copy">
        <p className="feature-slider-eyebrow">{active.eyebrow}</p>
        <h2>{active.title}</h2>
        <Link
          className="feature-slider-link"
          href={active.href}
          onClick={(event) => event.stopPropagation()}
        >
          {active.linkLabel}
        </Link>
      </div>

      <div className="feature-slider-dots" role="tablist" aria-label={t("sliderDotsAria")}>
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.key}
            type="button"
            role="tab"
            aria-selected={slideIndex === index}
            aria-label={t("sliderGoTo", { index: slideIndex + 1 })}
            className={slideIndex === index ? "is-active" : undefined}
            onClick={(event) => {
              event.stopPropagation();
              goTo(slideIndex);
            }}
          />
        ))}
      </div>

      {finePointer ? (
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

      <div className="feature-slider-controls">
        <button type="button" aria-label={t("sliderPrev")} onClick={(event) => {
          event.stopPropagation();
          goPrev();
        }}>
          {t("sliderPrev")}
        </button>
        <button type="button" aria-label={t("sliderNext")} onClick={(event) => {
          event.stopPropagation();
          goNext();
        }}>
          {t("sliderNext")}
        </button>
      </div>
    </section>
  );
}
