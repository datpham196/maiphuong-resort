"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type ArchiveItem = {
  id: string;
  indexLabel: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

type AboutArchiveGalleryProps = {
  items: ArchiveItem[];
  toolbar: string;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
  lightboxSuffix: string;
};

export function AboutArchiveGallery({
  items,
  toolbar,
  prevLabel,
  nextLabel,
  closeLabel,
  lightboxSuffix,
}: AboutArchiveGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active == null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
        return;
      }
      if (event.key === "ArrowLeft") {
        setActive((current) => (current == null ? current : (current - 1 + items.length) % items.length));
        return;
      }
      if (event.key === "ArrowRight") {
        setActive((current) => (current == null ? current : (current + 1) % items.length));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, items.length]);

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const card = track.querySelector<HTMLElement>(".archive-card");
    const amount = (card?.offsetWidth ?? 280) + 18;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  const current = active == null ? null : items[active];

  return (
    <>
      <div className="gallery-toolbar">
        <small>{toolbar}</small>
        <div className="arrow-buttons">
          <button type="button" aria-label={prevLabel} onClick={() => scrollByCard(-1)}>
            ‹
          </button>
          <button type="button" aria-label={nextLabel} onClick={() => scrollByCard(1)}>
            ›
          </button>
        </div>
      </div>

      <div ref={trackRef} className="gallery-track">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="archive-card"
            onClick={() => setActive(index)}
          >
            <div className="archive-photo">
              <Image src={item.image} alt={item.alt} fill sizes="(max-width: 760px) 70vw, 28vw" />
            </div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </button>
        ))}
      </div>

      <div
        className={`lightbox${current ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!current}
        aria-label={current?.title}
      >
        {current ? (
          <>
            <button type="button" className="close" aria-label={closeLabel} onClick={() => setActive(null)}>
              ×
            </button>
            <button
              type="button"
              className="prev"
              aria-label={prevLabel}
              onClick={() => setActive((currentIndex) => ((currentIndex ?? 0) - 1 + items.length) % items.length)}
            >
              ‹
            </button>
            <button
              type="button"
              className="next"
              aria-label={nextLabel}
              onClick={() => setActive((currentIndex) => ((currentIndex ?? 0) + 1) % items.length)}
            >
              ›
            </button>
            <figure>
              <Image
                src={current.image}
                alt={current.alt}
                width={1400}
                height={1000}
                sizes="90vw"
                style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "calc(100vh - 140px)" }}
              />
              <figcaption>
                {current.title} - {lightboxSuffix}
              </figcaption>
            </figure>
          </>
        ) : null}
      </div>
    </>
  );
}
