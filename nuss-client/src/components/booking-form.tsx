"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookingBar, type BookingSearchValues } from "@/components/booking-bar";
import { Link, useRouter } from "@/i18n/navigation";
import { MAX_PARTY_ADULTS, MAX_PARTY_CHILDREN, MAX_SELF_SERVE_ROOMS, planParty } from "@/lib/room-party";
import { ApiError } from "@/services/api";
import {
  checkRoomAvailability,
  createBooking,
  type AvailabilityItem,
} from "@/services/bookings";
import type { PublicRoom } from "@/services/rooms";

function sameStay(a: BookingSearchValues, b: BookingSearchValues) {
  return (
    a.checkIn === b.checkIn &&
    a.checkOut === b.checkOut &&
    a.adults === b.adults &&
    a.children === b.children
  );
}

type CartLine = {
  key: string;
  slug: string;
  title: string;
  adults: number;
  children: number;
};

type BookingFormProps = {
  rooms: PublicRoom[];
  initialSlug?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
};

function formatMoney(value: number, locale: string) {
  return value.toLocaleString(locale === "en" ? "en-US" : "vi-VN");
}

function newCartKey() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function BookingForm({
  rooms,
  initialSlug = "",
  initialCheckIn = "",
  initialCheckOut = "",
  initialAdults = 2,
  initialChildren = 0,
}: BookingFormProps) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const router = useRouter();

  const [stay, setStay] = useState<BookingSearchValues>({
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    adults: initialAdults,
    children: initialChildren,
  });
  const [availabilityItems, setAvailabilityItems] = useState<AvailabilityItem[]>([]);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  /** Bumps only on explicit CẬP NHẬT so guests can retry after rate limits. */
  const [availabilityNonce, setAvailabilityNonce] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  const seededRef = useRef(false);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const syncStay = useCallback((next: BookingSearchValues) => {
    setStay((prev) => {
      if (sameStay(prev, next)) {
        return prev;
      }
      if (prev.checkIn !== next.checkIn || prev.checkOut !== next.checkOut) {
        setCart([]);
      }
      return next;
    });
  }, []);

  const refreshStay = useCallback(
    (next: BookingSearchValues) => {
      syncStay(next);
      setAvailabilityNonce((value) => value + 1);
    },
    [syncStay],
  );

  const availabilityBySlug = useMemo(() => {
    const map = new Map<string, AvailabilityItem>();
    for (const item of availabilityItems) {
      map.set(item.slug, item);
    }
    return map;
  }, [availabilityItems]);

  const lineQuote = useCallback(
    (line: CartLine) => {
      const avail = availabilityBySlug.get(line.slug);
      const catalog = rooms.find((room) => room.slug === line.slug);
      const maxOccupancy = avail?.maxOccupancy ?? catalog?.maxOccupancy ?? null;
      const plan = planParty(line.adults, line.children, maxOccupancy);
      const availableAmount = avail?.availableAmount ?? 0;
      const nightlyTotal = avail?.nightlyTotal ?? 0;
      const currency = avail?.currency ?? "VND";

      const sameSlugRooms = cart
        .filter((entry) => entry.slug === line.slug)
        .reduce((sum, entry) => {
          const entryPlan = planParty(entry.adults, entry.children, maxOccupancy);
          return sum + Math.max(entryPlan.roomsNeeded, 0);
        }, 0);

      const inventoryOk = availableAmount >= sameSlugRooms;
      const partyFits = plan.canAllocate && inventoryOk;
      let blockReason = plan.blockReason;
      if (plan.canAllocate && availableAmount <= 0) {
        blockReason = "SOLD_OUT";
      } else if (plan.canAllocate && !inventoryOk) {
        blockReason = "INSUFFICIENT_INVENTORY";
      }

      return {
        plan,
        availableAmount,
        sameSlugRooms,
        nightlyTotal,
        currency,
        partyFits,
        blockReason,
        lineTotal: nightlyTotal * plan.roomsNeeded,
        maxOccupancy,
      };
    },
    [availabilityBySlug, cart, rooms],
  );

  const cartQuotes = useMemo(
    () => cart.map((line) => ({ line, quote: lineQuote(line) })),
    [cart, lineQuote],
  );

  const totalRooms = cartQuotes.reduce(
    (sum, entry) => sum + (entry.quote.plan.canAllocate ? entry.quote.plan.roomsNeeded : 0),
    0,
  );
  const cartTotal = cartQuotes.reduce((sum, entry) => sum + entry.quote.lineTotal, 0);
  const cartGuestSum = cart.reduce((sum, line) => sum + line.adults + line.children, 0);
  const partyGuestSum = stay.adults + stay.children;
  const partySeatsShort = Math.max(0, partyGuestSum - cartGuestSum);
  const partyCovered = cart.length > 0 && partySeatsShort === 0;
  const allLinesFit = cart.length > 0 && cartQuotes.every((entry) => entry.quote.partyFits);
  const withinRoomLimit = totalRooms <= MAX_SELF_SERVE_ROOMS;

  useEffect(() => {
    if (!stay.checkIn || !stay.checkOut) {
      setAvailabilityItems([]);
      setAvailabilityError(null);
      setChecking(false);
      return;
    }

    // OnePMS availability depends on dates only; guest counts are planned client-side.
    // Debounce rapid date picks so we do not trip OnePMS rate limits.
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setChecking(true);
      setAvailabilityError(null);

      checkRoomAvailability({
        arrivalDate: stay.checkIn,
        departureDate: stay.checkOut,
        locale,
      })
        .then((response) => {
          if (cancelled) return;
          setAvailabilityItems(response.items);
          if (response.items.length === 0) {
            setAvailabilityError(t("availabilityEmpty"));
          }
        })
        .catch((error) => {
          if (cancelled) return;
          setAvailabilityItems([]);
          if (error instanceof ApiError && (error.status === 429 || error.code === "ONEPMS_RATE_LIMITED")) {
            setAvailabilityError(t("availabilityRateLimited"));
            return;
          }
          setAvailabilityError(error instanceof ApiError ? error.message : t("availabilityError"));
        })
        .finally(() => {
          if (!cancelled) setChecking(false);
        });
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [stay.checkIn, stay.checkOut, availabilityNonce, locale, t]);

  useEffect(() => {
    if (seededRef.current || !initialSlug) {
      return;
    }
    const room = rooms.find((entry) => entry.slug === initialSlug);
    if (!room) {
      return;
    }
    seededRef.current = true;
    setCart([
      {
        key: newCartKey(),
        slug: room.slug,
        title: room.content.title,
        adults: Math.max(1, initialAdults),
        children: Math.max(0, initialChildren),
      },
    ]);
  }, [initialSlug, initialAdults, initialChildren, rooms]);

  const fittingCandidates = useMemo(() => {
    return availabilityItems.filter((item) => item.availableAmount > 0);
  }, [availabilityItems]);

  const addToCart = useCallback(
    (slug: string, title: string, adults: number, children: number) => {
      setCart((prev) => [
        ...prev,
        {
          key: newCartKey(),
          slug,
          title,
          adults: Math.max(1, adults),
          children: Math.max(0, children),
        },
      ]);
    },
    [],
  );

  const updateLine = useCallback((key: string, patch: Partial<Pick<CartLine, "adults" | "children">>) => {
    setCart((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => prev.filter((line) => line.key !== key));
  }, []);

  const blockMessage = useCallback(
    (
      blockReason: string | null,
      guests: number,
      roomsNeeded: number,
      available: number,
      max: number | null,
      sameSlugRooms?: number,
    ) => {
      switch (blockReason) {
        case "SOLD_OUT":
          return t("availabilityUnavailable");
        case "INSUFFICIENT_INVENTORY":
          return t("cartTypeInventoryExceeded", {
            available,
            needed: sameSlugRooms ?? roomsNeeded,
          });
        case "NOT_ENOUGH_ADULTS":
          return t("splitNotEnoughAdults", {
            guests,
            max: max ?? guests,
            needed: roomsNeeded,
          });
        case "TOO_MANY_ROOMS":
          return t("splitTooManyRooms", { needed: roomsNeeded });
        case "ADULTS_REQUIRED":
          return t("adultsRequired");
        default:
          return t("occupancyExceeded", {
            guests,
            max: max ?? guests,
          });
      }
    },
    [t],
  );

  const roomsAlreadyInCart = useCallback(
    (slug: string, maxOccupancy: number | null) =>
      cart
        .filter((entry) => entry.slug === slug)
        .reduce((sum, entry) => {
          const entryPlan = planParty(entry.adults, entry.children, maxOccupancy);
          return sum + Math.max(entryPlan.roomsNeeded, 0);
        }, 0),
    [cart],
  );

  const canSubmit =
    allLinesFit &&
    withinRoomLimit &&
    partyCovered &&
    !!stay.checkIn &&
    !!stay.checkOut &&
    guestName.trim().length > 1 &&
    guestPhone.trim().length >= 8 &&
    isValidEmail(guestEmail) &&
    !checking &&
    !submitting;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await createBooking({
        arrivalDate: stay.checkIn,
        departureDate: stay.checkOut,
        partyAdults: stay.adults,
        partyChildren: stay.children,
        items: cart.map((line) => ({
          slug: line.slug,
          adults: line.adults,
          children: line.children,
        })),
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim(),
        notes: notes.trim() || null,
        locale,
      });

      const params = new URLSearchParams({
        code: result.requestCode,
        rooms: String(result.roomCount),
      });
      if (result.bookingReference) {
        params.set("ref", result.bookingReference);
      }
      params.set("room", result.items.map((item) => item.title).join(", ") || result.roomTitle);
      params.set("checkIn", result.arrivalDate);
      params.set("checkOut", result.departureDate);
      router.push(`/booking/success?${params.toString()}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(
          error.code === "PARTY_CAPACITY_SHORT"
            ? t("partyCapacityShort", {
                party: partyGuestSum,
                cart: cartGuestSum,
                missing: partySeatsShort,
              })
            : error.code === "TOO_MANY_ROOMS"
              ? t("splitTooManyRooms", { needed: totalRooms })
              : error.code === "ROOM_UNAVAILABLE" || error.code === "INSUFFICIENT_INVENTORY"
                ? t("availabilityUnavailable")
                : error.message,
        );
      } else {
        setSubmitError(t("submitError"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-layout">
      <section className="booking-panel">
        <p className="booking-kicker">{t("stayKicker")}</p>
        <h2>{t("stayTitle")}</h2>
        <BookingBar
          initialCheckIn={stay.checkIn}
          initialCheckOut={stay.checkOut}
          initialAdults={stay.adults}
          initialChildren={stay.children}
          submitLabel={t("updateStay")}
          onChange={syncStay}
          onSearch={refreshStay}
        />

        {stay.checkIn && stay.checkOut ? (
          <div className="booking-candidates">
            <p className="booking-candidates-title">{t("candidatesTitle")}</p>
            {checking ? <p>{t("checkingAvailability")}</p> : null}
            {!checking && availabilityError ? <p className="booking-error">{availabilityError}</p> : null}
            {!checking && !availabilityError && fittingCandidates.length === 0 ? (
              <p className="booking-error">{t("candidatesEmpty")}</p>
            ) : null}
            <div className="booking-candidate-list">
              {fittingCandidates.map((item) => (
                <div key={item.slug} className="booking-candidate">
                  <div className="booking-candidate-main">
                    <strong>{item.title}</strong>
                    {item.maxOccupancy != null ? (
                      <span>{t("cartLineOccupancy", { max: item.maxOccupancy })}</span>
                    ) : null}
                    <span>
                      {t("candidateMeta", {
                        available: item.availableAmount,
                        amount: formatMoney(item.nightlyTotal, locale),
                        currency: item.currency,
                      })}
                    </span>
                  </div>
                  <div className="booking-candidate-actions">
                    <Link
                      className="booking-candidate-link"
                      href={`/rooms/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      {t("viewRoom")}
                    </Link>
                    <button
                      type="button"
                      className="booking-add-btn"
                      disabled={
                        totalRooms >= MAX_SELF_SERVE_ROOMS ||
                        roomsAlreadyInCart(item.slug, item.maxOccupancy) >= item.availableAmount
                      }
                      title={
                        totalRooms >= MAX_SELF_SERVE_ROOMS
                          ? t("cartRoomLimitReached")
                          : roomsAlreadyInCart(item.slug, item.maxOccupancy) >= item.availableAmount
                            ? t("cartTypeNoMore", { available: item.availableAmount })
                            : undefined
                      }
                      onClick={() =>
                        addToCart(
                          item.slug,
                          item.title,
                          Math.min(stay.adults, item.maxOccupancy ?? stay.adults),
                          stay.children,
                        )
                      }
                    >
                      {totalRooms >= MAX_SELF_SERVE_ROOMS
                        ? t("cartRoomLimitShort")
                        : roomsAlreadyInCart(item.slug, item.maxOccupancy) >= item.availableAmount
                          ? t("cartTypeFull")
                          : t("addToCart")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="booking-panel">
        <p className="booking-kicker">{t("cartKicker")}</p>
        <h2>{t("cartTitle")}</h2>

        {cart.length === 0 ? <p className="booking-field-hint">{t("cartEmpty")}</p> : null}

        <ul className="booking-cart-list">
          {cartQuotes.map(({ line, quote }) => (
            <li key={line.key} className="booking-cart-line">
              <div className="booking-cart-line-head">
                <div className="booking-cart-line-title">
                  <strong>{line.title}</strong>
                  {quote.maxOccupancy != null ? (
                    <p className="booking-field-hint">{t("cartLineOccupancy", { max: quote.maxOccupancy })}</p>
                  ) : null}
                </div>
                <button type="button" className="booking-cart-remove" onClick={() => removeLine(line.key)}>
                  {t("removeLine")}
                </button>
              </div>

              <div className="booking-cart-steppers">
                <label>
                  <span>{t("lineAdults")}</span>
                  <div className="guest-stepper booking-cart-stepper">
                    <button
                      type="button"
                      aria-label={t("decreaseAdults")}
                      disabled={line.adults <= 1}
                      onClick={() => updateLine(line.key, { adults: Math.max(1, line.adults - 1) })}
                    >
                      −
                    </button>
                    <span>{line.adults}</span>
                    <button
                      type="button"
                      aria-label={t("increaseAdults")}
                      disabled={line.adults >= MAX_PARTY_ADULTS}
                      onClick={() =>
                        updateLine(line.key, { adults: Math.min(MAX_PARTY_ADULTS, line.adults + 1) })
                      }
                    >
                      +
                    </button>
                  </div>
                </label>
                <label>
                  <span>{t("lineChildren")}</span>
                  <div className="guest-stepper booking-cart-stepper">
                    <button
                      type="button"
                      aria-label={t("decreaseChildren")}
                      disabled={line.children <= 0}
                      onClick={() => updateLine(line.key, { children: Math.max(0, line.children - 1) })}
                    >
                      −
                    </button>
                    <span>{line.children}</span>
                    <button
                      type="button"
                      aria-label={t("increaseChildren")}
                      disabled={line.children >= MAX_PARTY_CHILDREN}
                      onClick={() =>
                        updateLine(line.key, {
                          children: Math.min(MAX_PARTY_CHILDREN, line.children + 1),
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                </label>
              </div>

              {quote.partyFits ? (
                <div className="booking-cart-quote">
                  {quote.plan.roomsNeeded > 1 ? (
                    <p>
                      {t("splitSuggestion", {
                        guests: line.adults + line.children,
                        max: quote.maxOccupancy ?? line.adults + line.children,
                        rooms: quote.plan.roomsNeeded,
                      })}
                    </p>
                  ) : null}
                  <ul className="booking-allocation">
                    {quote.plan.rooms.map((share, index) => (
                      <li key={`${line.key}-${index}`}>
                        {t("allocationRoom", {
                          index: index + 1,
                          adults: share.adults,
                          children: share.children,
                        })}
                      </li>
                    ))}
                  </ul>
                  <strong>
                    {t("lineTotal", {
                      amount: formatMoney(quote.lineTotal, locale),
                      currency: quote.currency,
                    })}
                  </strong>
                </div>
              ) : (
                <p className="booking-error">
                  {blockMessage(
                    quote.blockReason,
                    line.adults + line.children,
                    quote.plan.roomsNeeded,
                    quote.availableAmount,
                    quote.maxOccupancy,
                    quote.sameSlugRooms,
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>

        {cart.length > 0 ? (
          <p className="booking-cart-total">
            {t("cartTotal", {
              rooms: totalRooms,
              amount: formatMoney(cartTotal, locale),
              currency: "VND",
            })}
          </p>
        ) : null}
        {cart.length > 0 ? (
          <p className="booking-field-hint">
            {t("partyCoverage", {
              party: partyGuestSum,
              cart: cartGuestSum,
            })}
          </p>
        ) : null}
        {cart.length > 0 && !partyCovered ? (
          <p className="booking-error">
            {t("partyCapacityShort", {
              party: partyGuestSum,
              cart: cartGuestSum,
              missing: partySeatsShort,
            })}
          </p>
        ) : null}
        {!withinRoomLimit ? (
          <p className="booking-error">{t("splitTooManyRooms", { needed: totalRooms })}</p>
        ) : null}

        <p className="booking-kicker" style={{ marginTop: "1.5rem" }}>
          {t("guestKicker")}
        </p>
        <h2>{t("guestTitle")}</h2>
        <form className="booking-guest-form" onSubmit={onSubmit}>
          <label className="booking-field-block">
            <span>{t("guestName")}</span>
            <input
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label className="booking-field-block">
            <span>{t("guestPhone")}</span>
            <input
              value={guestPhone}
              onChange={(event) => setGuestPhone(event.target.value)}
              autoComplete="tel"
              required
            />
          </label>
          <label className="booking-field-block">
            <span>{t("guestEmail")}</span>
            <input
              type="email"
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
              autoComplete="email"
              required
            />
            {guestEmail.trim().length > 0 && !isValidEmail(guestEmail) ? (
              <p className="booking-error">{t("guestEmailInvalid")}</p>
            ) : null}
          </label>
          <label className="booking-field-block">
            <span>{t("notes")}</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
          </label>

          {submitError ? <p className="booking-error">{submitError}</p> : null}

          <button type="submit" className="booking-submit" disabled={!canSubmit}>
            {submitting
              ? t("submitting")
              : totalRooms > 1
                ? t("submitMulti", { rooms: totalRooms })
                : t("submit")}
          </button>
          <Link className="booking-back" href="/rooms">
            {t("backToRooms")}
          </Link>
        </form>
      </section>
    </div>
  );
}
