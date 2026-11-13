"use client";

import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TransitionEvent,
} from "react";
import { Link } from "@/i18n/navigation";

export type RoomSliderItem = {
  key: string;
  title: string;
  text: string;
  image: string;
  alt: string;
  href?: string;
  priceLabel?: string | null;
};

type TrackItem = RoomSliderItem & {
  trackKey: string;
};

type RoomSliderProps = {
  items?: RoomSliderItem[];
};

export function RoomSlider({ items }: RoomSliderProps) {
  const t = useTranslations("Home");
  const [perView, setPerView] = useState(3);
  const [position, setPosition] = useState(6);
  const [animate, setAnimate] = useState(true);
  const lockedRef = useRef(false);
  const positionRef = useRef(position);
  const unlockTimerRef = useRef<number | null>(null);

  const rooms = useMemo<RoomSliderItem[]>(() => {
    if (items) {
      return items;
    }

    return [
      {
        key: "room1",
        title: t("room1Title"),
        text: t("room1Text"),
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
        alt: t("room1ImageAlt"),
      },
      {
        key: "room2",
        title: t("room2Title"),
        text: t("room2Text"),
        image:
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
        alt: t("room2ImageAlt"),
      },
      {
        key: "room3",
        title: t("room3Title"),
        text: t("room3Text"),
        image:
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
        alt: t("room3ImageAlt"),
      },
      {
        key: "room4",
        title: t("room4Title"),
        text: t("room4Text"),
        image:
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
        alt: t("room4ImageAlt"),
      },
      {
        key: "room5",
        title: t("room5Title"),
        text: t("room5Text"),
        image:
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
        alt: t("room5ImageAlt"),
      },
      {
        key: "room6",
        title: t("room6Title"),
        text: t("room6Text"),
        image:
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80",
        alt: t("room6ImageAlt"),
      },
    ];
  }, [items, t]);

  const total = rooms.length;
  const cloneCount = total;

  const trackItems: TrackItem[] = useMemo(() => {
    if (total === 0) {
      return [];
    }

    const before = rooms.map((room, index) => ({
      ...room,
      trackKey: `before-${room.key}-${index}`,
    }));
    const real = rooms.map((room) => ({
      ...room,
      trackKey: `real-${room.key}`,
    }));
    const after = rooms.map((room, index) => ({
      ...room,
      trackKey: `after-${room.key}-${index}`,
    }));

    return [...before, ...real, ...after];
  }, [rooms, total]);

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

  const activeIndex = total === 0 ? 0 : ((position - cloneCount) % total + total) % total;
  const focusTrackIndex = position + Math.floor((perView - 1) / 2);

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
      if (lockedRef.current) {
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
    [clearUnlockTimer, unlock],
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
    return (
      <section className="home-section room-section" id="rooms" aria-labelledby="home-rooms-title">
        <div className="room-section-head">
          <h2 id="home-rooms-title">{t("roomsSectionTitle")}</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="home-section room-section" id="rooms" aria-labelledby="home-rooms-title">
      <div className="room-section-head">
        <h2 id="home-rooms-title">{t("roomsSectionTitle")}</h2>
        <Link className="see-more room-section-all" href="/rooms">
          {t("seeAll")}
        </Link>
      </div>

      <div
        className="room-slider"
        style={{ "--room-per-view": perView } as CSSProperties}
        aria-roledescription="carousel"
        aria-label={t("roomsSliderAria")}
      >
        <button
          type="button"
          className="room-slider-nav is-prev"
          aria-label={t("roomsSliderPrev")}
          onClick={goPrev}
        >
          <span aria-hidden="true" />
        </button>

        <div className="room-slider-viewport">
          <div
            className={`room-slider-track${animate ? "" : " is-instant"}`}
            style={{
              transform: `translateX(calc(-${position} * ((100% + var(--room-gap)) / var(--room-per-view))))`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {trackItems.map((room, trackIndex) => {
              const href = room.href ?? "/rooms";
              const isFocus = trackIndex === focusTrackIndex;

              return (
                <article
                  key={room.trackKey}
                  className={`room-slide-card${isFocus ? " is-focus" : ""}`}
                >
                  <div className="room-slide-media">
                    {room.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- same as /rooms list for local API covers
                      <img src={room.image} alt={room.alt} />
                    ) : null}
                  </div>

                  <div className="room-slide-tag">
                    <span aria-hidden="true" />
                    {t("roomsSliderLocation")}
                  </div>

                  <div className="room-slide-overlay">
                    <h3>{room.title}</h3>
                    {room.text ? <p>{room.text}</p> : null}
                    <div className="room-slide-meta">
                      <div className="room-slide-price">
                        {room.priceLabel ? (
                          <>
                            <strong>
                              {t("roomsPricePerNight", { price: room.priceLabel })}
                            </strong>
                            <span>{t("roomsTaxIncluded")}</span>
                          </>
                        ) : (
                          <strong>{t("roomsPriceOnRequest")}</strong>
                        )}
                      </div>
                      <Link className="room-slide-cta" href={href}>
                        {t("chooseRoom")}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="room-slider-nav is-next"
          aria-label={t("roomsSliderNext")}
          onClick={goNext}
        >
          <span aria-hidden="true" />
        </button>

        <div className="room-slider-dots" role="tablist" aria-label={t("roomsSliderDotsAria")}>
          {rooms.map((room, dotIndex) => (
            <button
              key={room.key}
              type="button"
              role="tab"
              aria-selected={dotIndex === activeIndex}
              aria-label={t("roomsSliderGoTo", { index: dotIndex + 1 })}
              className={dotIndex === activeIndex ? "is-active" : undefined}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
