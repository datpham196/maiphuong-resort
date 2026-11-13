"use client";

import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type TransitionEvent,
} from "react";

type Props = {
  children: ReactNode;
  ariaLabel: string;
  prevLabel: string;
  nextLabel: string;
  dotsLabel?: string;
  /** Template with `{index}` placeholder, e.g. "Go to item {index}" */
  goToLabel?: string;
};

type TrackSlide = {
  slide: ReactNode;
  trackKey: string;
};

export function ExperienceGroupSlider({
  children,
  ariaLabel,
  prevLabel,
  nextLabel,
  dotsLabel,
  goToLabel,
}: Props) {
  const slides = useMemo(() => Children.toArray(children).filter(Boolean), [children]);
  const total = slides.length;
  const cloneCount = total;

  const [perView, setPerView] = useState(3);
  const [position, setPosition] = useState(cloneCount);
  const [animate, setAnimate] = useState(true);
  const lockedRef = useRef(false);
  const positionRef = useRef(position);
  const unlockTimerRef = useRef<number | null>(null);

  const trackSlides: TrackSlide[] = useMemo(() => {
    if (total === 0) {
      return [];
    }

    const wrap = (prefix: string) =>
      slides.map((slide, index) => ({
        slide,
        trackKey: `${prefix}-${index}`,
      }));

    return [...wrap("before"), ...wrap("real"), ...wrap("after")];
  }, [slides, total]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    const sync = () => {
      const width = window.innerWidth;
      const nextPerView = width <= 720 ? 1 : width <= 1100 ? 2 : 3;
      lockedRef.current = false;
      setPerView(nextPerView);
      setAnimate(false);
      setPosition(cloneCount);
    };

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [cloneCount]);

  useLayoutEffect(() => {
    if (animate) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setAnimate(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [animate, position]);

  const canSlide = total > 1;
  const focusOffset = Math.floor((perView - 1) / 2);
  const activeIndex = total === 0 ? 0 : ((position - cloneCount) % total + total) % total;
  const focusTrackIndex = canSlide
    ? position + focusOffset
    : Math.min(focusOffset, Math.max(0, total - 1));

  const clearUnlockTimer = useCallback(() => {
    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
  }, []);

  const wrapIfNeeded = useCallback(() => {
    const current = positionRef.current;

    if (current >= cloneCount + total) {
      setAnimate(false);
      setPosition(current - total);
      return;
    }

    if (current < cloneCount) {
      setAnimate(false);
      setPosition(current + total);
    }
  }, [cloneCount, total]);

  const unlock = useCallback(() => {
    clearUnlockTimer();
    wrapIfNeeded();
    lockedRef.current = false;
  }, [clearUnlockTimer, wrapIfNeeded]);

  const lockAndMove = useCallback(
    (nextPosition: number | ((current: number) => number)) => {
      if (lockedRef.current || !canSlide) {
        return;
      }

      lockedRef.current = true;
      setAnimate(true);
      setPosition(nextPosition);
      clearUnlockTimer();
      unlockTimerRef.current = window.setTimeout(() => {
        unlock();
      }, 500);
    },
    [canSlide, clearUnlockTimer, unlock],
  );

  const goPrev = useCallback(() => {
    lockAndMove((current) => current - 1);
  }, [lockAndMove]);

  const goNext = useCallback(() => {
    lockAndMove((current) => current + 1);
  }, [lockAndMove]);

  const goTo = useCallback(
    (target: number) => {
      if (target === activeIndex) {
        return;
      }

      lockAndMove(cloneCount + target);
    },
    [activeIndex, cloneCount, lockAndMove],
  );

  useEffect(() => {
    return () => clearUnlockTimer();
  }, [clearUnlockTimer]);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "transform") {
        return;
      }

      unlock();
    },
    [unlock],
  );

  if (total === 0) {
    return null;
  }

  return (
    <div
      className={`experience-group-slider${canSlide ? " has-controls" : ""}`}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      style={{ ["--exp-per-view" as string]: String(perView) }}
    >
      {canSlide ? (
        <button
          type="button"
          className="experience-group-slider-nav is-prev"
          aria-label={prevLabel}
          onClick={goPrev}
        >
          <span aria-hidden="true" />
        </button>
      ) : null}

      <div className="experience-group-slider-viewport">
        <div
          className={`experience-group-slider-track${animate ? "" : " is-instant"}`}
          style={{
            transform: canSlide
              ? `translateX(calc(-${position} * ((100% + var(--exp-gap)) / ${perView})))`
              : undefined,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {(canSlide
            ? trackSlides
            : slides.map((slide, index) => ({ slide, trackKey: `only-${index}` }))
          ).map((item, trackIndex) => (
            <div
              key={item.trackKey}
              className={`experience-group-slider-slide${
                trackIndex === focusTrackIndex ? " is-focus" : ""
              }`}
            >
              {item.slide}
            </div>
          ))}
        </div>
      </div>

      {canSlide ? (
        <button
          type="button"
          className="experience-group-slider-nav is-next"
          aria-label={nextLabel}
          onClick={goNext}
        >
          <span aria-hidden="true" />
        </button>
      ) : null}

      {canSlide ? (
        <div className="experience-group-slider-dots" role="tablist" aria-label={dotsLabel ?? ariaLabel}>
          {slides.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              role="tab"
              aria-selected={dotIndex === activeIndex}
              aria-label={
                goToLabel
                  ? goToLabel.replace("{index}", String(dotIndex + 1))
                  : `${dotIndex + 1}`
              }
              className={dotIndex === activeIndex ? "is-active" : undefined}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
