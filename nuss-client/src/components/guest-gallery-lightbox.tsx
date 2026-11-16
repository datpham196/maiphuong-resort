"use client";

import { useCallback, useEffect, useState } from "react";

export type GuestGalleryItem = {
  id: string;
  src: string;
  alt: string;
};

type Props = {
  images: GuestGalleryItem[];
  galleryLabel: string;
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
};

export function GuestGalleryLightbox({
  images,
  galleryLabel,
  closeLabel,
  prevLabel,
  nextLabel,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex != null;
  const current = isOpen ? images[openIndex] : null;

  const close = useCallback(() => setOpenIndex(null), []);
  const showPrev = useCallback(() => {
    setOpenIndex((index) => {
      if (index == null || images.length === 0) return index;
      return (index - 1 + images.length) % images.length;
    });
  }, [images.length]);
  const showNext = useCallback(() => {
    setOpenIndex((index) => {
      if (index == null || images.length === 0) return index;
      return (index + 1) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close, showPrev, showNext]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="guest-gallery-grid" role="list" aria-label={galleryLabel}>
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="guest-gallery-item"
            role="listitem"
            onClick={() => setOpenIndex(index)}
            aria-label={galleryLabel}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt="" />
          </button>
        ))}
      </div>

      {isOpen && current ? (
        <div className="room-lightbox" role="dialog" aria-modal="true" aria-label={galleryLabel}>
          <button type="button" className="room-lightbox-backdrop" aria-label={closeLabel} onClick={close} />
          <div className="room-lightbox-panel">
            <button type="button" className="room-lightbox-close" onClick={close} aria-label={closeLabel}>
              <span aria-hidden="true">×</span>
            </button>
            {images.length > 1 ? (
              <button
                type="button"
                className="room-lightbox-nav is-prev"
                onClick={showPrev}
                aria-label={prevLabel}
              >
                <span aria-hidden="true" />
              </button>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="room-lightbox-image" src={current.src} alt="" />
            {images.length > 1 ? (
              <button
                type="button"
                className="room-lightbox-nav is-next"
                onClick={showNext}
                aria-label={nextLabel}
              >
                <span aria-hidden="true" />
              </button>
            ) : null}
            <p className="room-lightbox-counter">
              {(openIndex ?? 0) + 1} / {images.length}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
