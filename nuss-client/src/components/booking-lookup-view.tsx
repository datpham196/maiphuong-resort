"use client";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useI18nNavRouter } from "@/hooks/use-nav-router";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/services/api";
import { cancelBooking, lookupBooking, type BookingLookupResponse } from "@/services/bookings";

type Props = {
  initialRef?: string;
};

function formatMoney(amount: number | null | undefined, currency: string | null | undefined, locale: string) {
  if (amount == null || Number.isNaN(amount)) {
    return "—";
  }
  return `${amount.toLocaleString(locale === "en" ? "en-US" : "vi-VN")} ${currency ?? "VND"}`;
}

export function BookingLookupView({ initialRef = "" }: Props) {
  const t = useTranslations("BookingLookup");
  const locale = useLocale();
  const router = useI18nNavRouter();
  const [refInput, setRefInput] = useState(initialRef);
  const [loading, setLoading] = useState(Boolean(initialRef.trim()));
  const [cancelling, setCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingLookupResponse | null>(null);

  const load = useCallback(
    async (ref: string) => {
      const trimmed = ref.trim();
      if (!trimmed) {
        setBooking(null);
        setError(t("refRequired"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const result = await lookupBooking(trimmed, locale);
        setBooking(result);
      } catch (err) {
        setBooking(null);
        if (err instanceof ApiError && err.status === 404) {
          setError(t("notFound"));
        } else if (err instanceof ApiError) {
          setError(err.message || t("loadError"));
        } else {
          setError(t("loadError"));
        }
      } finally {
        setLoading(false);
      }
    },
    [locale, t],
  );

  function openCancelConfirm() {
    if (!booking?.cancellable || cancelling) {
      return;
    }
    setConfirmOpen(true);
  }

  function closeCancelConfirm() {
    if (cancelling) {
      return;
    }
    setConfirmOpen(false);
  }

  async function confirmCancelBooking() {
    if (!booking?.bookingReference || !booking.cancellable || cancelling) {
      return;
    }

    setCancelling(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await cancelBooking(booking.bookingReference, locale);
      setBooking(result);
      setSuccessMessage(t("cancelSuccess"));
      setConfirmOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || t("cancelError"));
      } else {
        setError(t("cancelError"));
      }
      setConfirmOpen(false);
    } finally {
      setCancelling(false);
    }
  }

  useEffect(() => {
    if (initialRef.trim()) {
      void load(initialRef);
    }
  }, [initialRef, load]);

  useEffect(() => {
    if (!confirmOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !cancelling) {
        setConfirmOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [confirmOpen, cancelling]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = refInput.trim();
    router.replace(`/booking/lookup?ref=${encodeURIComponent(trimmed)}`);
    void load(trimmed);
  }

  function statusLabel(status: string | null | undefined) {
    if (status == null || status === "") {
      return "—";
    }
    const value = String(status).trim().toLowerCase();
    switch (value) {
      case "-1":
      case "cancel":
      case "cancelled":
      case "canceled":
        return t("statusCancel");
      case "-2":
      case "noshow":
      case "no-show":
        return t("statusNoshow");
      case "0":
      case "booked":
      case "confirmed":
        return t("statusBooked");
      case "1":
      case "checkin":
      case "checkedin":
        return t("statusCheckIn");
      case "2":
      case "checkout":
      case "checkedout":
        return t("statusCheckOut");
      default:
        return status;
    }
  }

  return (
    <main className="booking-lookup-page">
      <header className="booking-lookup-hero">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p>{t("intro")}</p>

        <form className="booking-lookup-form" onSubmit={onSubmit} role="search">
          <label className="sr-only" htmlFor="booking-lookup-ref">
            {t("refLabel")}
          </label>
          <div className="booking-lookup-field">
            <input
              id="booking-lookup-ref"
              type="search"
              name="ref"
              value={refInput}
              onChange={(event) => setRefInput(event.target.value)}
              placeholder={t("refPlaceholder")}
              autoComplete="off"
            />
            <button type="submit" className="booking-lookup-submit" aria-label={t("search")}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.2 4.2a1 1 0 0 1-1.4 1.4l-4.2-4.2A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"
                />
              </svg>
            </button>
          </div>
        </form>
      </header>

      {loading ? <p className="booking-lookup-status">{t("loading")}</p> : null}
      {!loading && error ? <p className="booking-lookup-error" role="alert">{error}</p> : null}
      {!loading && successMessage ? (
        <p className="booking-lookup-success" role="status">
          {successMessage}
        </p>
      ) : null}

      {!loading && booking ? (
        <div className="booking-lookup-result">
          <section className="booking-lookup-panel" aria-labelledby="booking-lookup-summary">
            <div className="booking-lookup-panel-head">
              <h2 id="booking-lookup-summary">{t("summaryTitle")}</h2>
              {booking.cancellable ? (
                <button
                  type="button"
                  className="booking-cancel-btn"
                  onClick={openCancelConfirm}
                  disabled={cancelling}
                >
                  {cancelling ? t("cancelling") : t("cancelBooking")}
                </button>
              ) : null}
            </div>
            <dl className="booking-lookup-facts">
              <div>
                <dt>{t("bookingReference")}</dt>
                <dd>{booking.bookingReference || "—"}</dd>
              </div>
              <div>
                <dt>{t("bookingId")}</dt>
                <dd>{booking.bookingId || "—"}</dd>
              </div>
              <div>
                <dt>{t("status")}</dt>
                <dd>{statusLabel(booking.bookingStatus)}</dd>
              </div>
              <div>
                <dt>{t("dates")}</dt>
                <dd>
                  {booking.arrivalDate || "—"} → {booking.departureDate || "—"}
                </dd>
              </div>
              <div>
                <dt>{t("guestName")}</dt>
                <dd>{booking.name || "—"}</dd>
              </div>
              <div>
                <dt>{t("guestPhone")}</dt>
                <dd>{booking.phone || "—"}</dd>
              </div>
              <div>
                <dt>{t("guestEmail")}</dt>
                <dd>{booking.email || "—"}</dd>
              </div>
              {booking.idNumber ? (
                <div>
                  <dt>{t("idDocument")}</dt>
                  <dd>
                    {[booking.idType, booking.idNumber].filter(Boolean).join(" · ")}
                  </dd>
                </div>
              ) : null}
              {booking.address ? (
                <div>
                  <dt>{t("address")}</dt>
                  <dd>{booking.address}</dd>
                </div>
              ) : null}
              <div>
                <dt>{t("paymentStatus")}</dt>
                <dd>{booking.paymentStatus || "—"}</dd>
              </div>
              <div>
                <dt>{t("totalAmount")}</dt>
                <dd>{formatMoney(booking.totalAmount, booking.currency, locale)}</dd>
              </div>
              <div>
                <dt>{t("totalPaid")}</dt>
                <dd>{formatMoney(booking.totalPaid, booking.currency, locale)}</dd>
              </div>
              <div>
                <dt>{t("totalRemaining")}</dt>
                <dd>{formatMoney(booking.totalRemaining, booking.currency, locale)}</dd>
              </div>
              {booking.created ? (
                <div>
                  <dt>{t("created")}</dt>
                  <dd>{booking.created}</dd>
                </div>
              ) : null}
              {booking.notes ? (
                <div className="is-wide">
                  <dt>{t("notes")}</dt>
                  <dd>{booking.notes}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="booking-lookup-panel" aria-labelledby="booking-lookup-rooms">
            <h2 id="booking-lookup-rooms">{t("roomsTitle")}</h2>
            {booking.rooms.length === 0 ? (
              <p className="booking-lookup-empty">{t("roomsEmpty")}</p>
            ) : (
              <ul className="booking-lookup-list">
                {booking.rooms.map((room, index) => (
                  <li key={`${room.roomTypeId ?? "room"}-${room.roomNumber ?? index}`}>
                    <strong>{room.roomTitle || room.roomTypeId || t("roomFallback", { index: index + 1 })}</strong>
                    <p>
                      {t("roomMeta", {
                        number: room.roomNumber || "—",
                        adults: room.adult ?? 0,
                        children: room.child ?? 0,
                      })}
                    </p>
                    <p>
                      {t("meals", {
                        breakfast: room.breakfast ? t("yes") : t("no"),
                        lunch: room.lunch ? t("yes") : t("no"),
                        dinner: room.dinner ? t("yes") : t("no"),
                      })}
                    </p>
                    {room.rates?.length ? (
                      <p>
                        {t("rates")}:{" "}
                        {room.rates.map((rate) => formatMoney(rate, booking.currency, locale)).join(" · ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="booking-lookup-panel" aria-labelledby="booking-lookup-services">
            <h2 id="booking-lookup-services">{t("servicesTitle")}</h2>
            {booking.services.length === 0 ? (
              <p className="booking-lookup-empty">{t("servicesEmpty")}</p>
            ) : (
              <ul className="booking-lookup-list">
                {booking.services.map((service, index) => (
                  <li key={`${service.serviceId ?? "svc"}-${index}`}>
                    <strong>{service.serviceName || service.serviceId || "—"}</strong>
                    <p>
                      {t("serviceMeta", {
                        type: service.serviceType || "—",
                        quantity: service.quantity ?? 0,
                        total: formatMoney(service.totalPrice, booking.currency, locale),
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="booking-lookup-panel" aria-labelledby="booking-lookup-payments">
            <h2 id="booking-lookup-payments">{t("paymentsTitle")}</h2>
            {booking.payments.length === 0 ? (
              <p className="booking-lookup-empty">{t("paymentsEmpty")}</p>
            ) : (
              <ul className="booking-lookup-list">
                {booking.payments.map((payment, index) => (
                  <li key={`${payment.paymentDate ?? "pay"}-${index}`}>
                    <strong>
                      {payment.paymentMethodName || payment.paymentMethodId || t("paymentFallback", { index: index + 1 })}
                    </strong>
                    <p>
                      {t("paymentMeta", {
                        date: payment.paymentDate || "—",
                        amount: formatMoney(payment.amount, booking.currency, locale),
                        status: payment.paymentStatus || "—",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      <div className="booking-lookup-actions">
        <Link className="booking-submit" href="/booking">
          {t("goBooking")}
        </Link>
        <Link className="booking-back" href="/">
          {t("backHome")}
        </Link>
      </div>

      {confirmOpen ? (
        <div className="booking-confirm-overlay" role="presentation" onClick={closeCancelConfirm}>
          <div
            className="booking-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-cancel-title"
            aria-describedby="booking-cancel-desc"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="booking-cancel-title">{t("cancelDialogTitle")}</h3>
            <p id="booking-cancel-desc">{t("cancelConfirm")}</p>
            {booking?.bookingReference ? (
              <p className="booking-confirm-ref">
                {t("bookingReference")}: <strong>{booking.bookingReference}</strong>
              </p>
            ) : null}
            <div className="booking-confirm-actions">
              <button
                type="button"
                className="booking-confirm-dismiss"
                onClick={closeCancelConfirm}
                disabled={cancelling}
              >
                {t("cancelDialogDismiss")}
              </button>
              <button
                type="button"
                className="booking-confirm-accept"
                onClick={() => void confirmCancelBooking()}
                disabled={cancelling}
              >
                {cancelling ? t("cancelling") : t("cancelDialogAccept")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
