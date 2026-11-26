"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

type Slide = {
  key: string;
  sense: string;
  subtitle: string;
  title: string;
  body: string;
  offer?: string;
  image: string;
  alt: string;
  /** Text block side — listen/touch follow the sample on the right. */
  align: "left" | "right";
};

function padSlideIndex(value: number) {
  return String(value).padStart(2, "0");
}

export function FeatureSlider() {
  const t = useTranslations("Home");
  const rootRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"prev" | "next" | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const [finePointer, setFinePointer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const slides: Slide[] = useMemo(
    () => [
      {
        key: "sight",
        sense: t("slideSightSense"),
        subtitle: t("slideSightSubtitle"),
        title: t("slideSightTitle"),
        body: t("slideSightBody"),
        image: "/index/slide-index/nhin.jpg",
        alt: t("slideSightImageAlt"),
        align: "left",
      },
      {
        key: "listen",
        sense: t("slideListenSense"),
        subtitle: t("slideListenSubtitle"),
        title: t("slideListenTitle"),
        body: t("slideListenBody"),
        image: "/index/slide-index/lang-nghe.jpg",
        alt: t("slideListenImageAlt"),
        align: "right",
      },
      {
        key: "touch",
        sense: t("slideTouchSense"),
        subtitle: t("slideTouchSubtitle"),
        title: t("slideTouchTitle"),
        body: t("slideTouchBody"),
        offer: t("slideTouchOffer"),
        image: "/index/slide-index/cham.png",
        alt: t("slideTouchImageAlt"),
        align: "right",
      },
      {
        key: "taste",
        sense: t("slideTasteSense"),
        subtitle: t("slideTasteSubtitle"),
        title: t("slideTasteTitle"),
        body: t("slideTasteBody"),
        image: "/index/slide-index/nem.png",
        alt: t("slideTasteImageAlt"),
        align: "left",
      },
      {
        key: "scent",
        sense: t("slideScentSense"),
        subtitle: t("slideScentSubtitle"),
        title: t("slideScentTitle"),
        body: t("slideScentBody"),
        image: "/index/slide-index/huong.jpg",
        alt: t("slideScentImageAlt"),
        align: "left",
      },
    ],
    [t],
  );

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
  const slideNumber = padSlideIndex(index + 1);
  const copySideClass = active.align === "right" ? " is-copy-right" : " is-copy-left";

  return (
    <section
      ref={rootRef}
      className={`feature-slider is-senses${copySideClass}${direction ? ` is-${direction}` : ""}`}
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
        <p className="feature-slider-sense">
          <span className="feature-slider-rule" aria-hidden="true" />
          <span>
            {slideNumber} - {active.sense}
          </span>
        </p>
        <p className="feature-slider-subtitle">{active.subtitle}</p>
        <h2>{active.title}</h2>
        <p className="feature-slider-body">{active.body}</p>
        {active.offer ? <p className="feature-slider-offer">{active.offer}</p> : null}
        <p className="feature-slider-tagline">
          <span className="feature-slider-rule" aria-hidden="true" />
          <span>{t("slideTagline")}</span>
        </p>
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
        <button
          type="button"
          aria-label={t("sliderPrev")}
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
        >
          {t("sliderPrev")}
        </button>
        <button
          type="button"
          aria-label={t("sliderNext")}
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
        >
          {t("sliderNext")}
        </button>
      </div>
    </section>
  );
}
