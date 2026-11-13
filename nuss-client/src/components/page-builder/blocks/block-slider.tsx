"use client";

import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/components/page-builder/media";

type Slide = { src?: string; alt?: string; caption?: string };

type Props = {
  slides: Slide[];
  autoplay?: boolean;
  intervalMs?: number;
  showDots?: boolean;
};

export function BlockSlider({ slides, autoplay = true, intervalMs = 3000, showDots = true }: Props) {
  const valid = slides.filter((s) => s.src);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!autoplay || valid.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % valid.length);
    }, Math.max(1500, intervalMs));
    return () => window.clearInterval(timer);
  }, [autoplay, intervalMs, valid.length]);

  if (valid.length === 0) {
    return <div className="pb-slider is-empty">Chưa có slide</div>;
  }

  const active = valid[index];
  const src = resolveMediaUrl(active.src);

  return (
    <div className="pb-slider">
      <div className="pb-slider-frame">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={active.alt ?? ""} />
        ) : null}
        {active.caption ? <p className="pb-slider-caption">{active.caption}</p> : null}
      </div>
      {showDots && valid.length > 1 ? (
        <div className="pb-slider-dots">
          {valid.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === index ? "is-active" : undefined}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
