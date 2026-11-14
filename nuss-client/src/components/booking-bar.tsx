"use client";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useI18nNavRouter } from "@/hooks/use-nav-router";
import { MAX_PARTY_ADULTS, MAX_PARTY_CHILDREN } from "@/lib/room-party";

export type BookingSearchValues = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
};

type BookingBarProps = {
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  submitLabel?: string;
  /** Fires on every local stay/guest change so parents can validate live. */
  onChange?: (values: BookingSearchValues) => void;
  onSearch?: (values: BookingSearchValues) => void;
};

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const VI_WEEKDAYS = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const EN_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const VI_MONTHS = [
  "tháng 1",
  "tháng 2",
  "tháng 3",
  "tháng 4",
  "tháng 5",
  "tháng 6",
  "tháng 7",
  "tháng 8",
  "tháng 9",
  "tháng 10",
  "tháng 11",
  "tháng 12",
];
const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const VI_MONTH_TITLES = [
  "Tháng Một",
  "Tháng Hai",
  "Tháng Ba",
  "Tháng Tư",
  "Tháng Năm",
  "Tháng Sáu",
  "Tháng Bảy",
  "Tháng Tám",
  "Tháng Chín",
  "Tháng Mười",
  "Tháng Mười Một",
  "Tháng Mười Hai",
];

/** Deterministic labels — avoids SSR/CSR Intl weekday mismatch (e.g. "Th 6" vs "Thứ 6"). */
function formatStayDate(value: string, locale: string) {
  if (!value) {
    return "—";
  }

  const date = parseInputDate(value);
  if (locale === "vi") {
    return `${VI_WEEKDAYS[date.getDay()]}, ${date.getDate()} ${VI_MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
  }

  return `${EN_WEEKDAYS[date.getDay()]}, ${EN_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatMonthTitle(date: Date, locale: string) {
  if (locale === "vi") {
    return `${VI_MONTH_TITLES[date.getMonth()]} ${date.getFullYear()}`.toUpperCase();
  }

  return `${EN_MONTHS[date.getMonth()]} ${date.getFullYear()}`.toUpperCase();
}

function isPastDay(date: Date, today: Date) {
  return date < today;
}

function buildMonthCells(monthDate: Date) {
  const first = startOfMonth(monthDate);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const mondayIndex = (first.getDay() + 6) % 7;
  const cells: Array<Date | null> = Array.from({ length: mondayIndex }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), day, 12));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function BookingBar({
  initialCheckIn = "",
  initialCheckOut = "",
  initialAdults = 2,
  initialChildren = 0,
  submitLabel,
  onChange,
  onSearch,
}: BookingBarProps) {
  const t = useTranslations("BookingBar");
  const locale = useLocale();
  const router = useI18nNavRouter();
  const rootRef = useRef<HTMLFormElement>(null);
  const onChangeRef = useRef(onChange);

  const [today, setToday] = useState<Date | null>(null);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    setToday(now);
    setViewMonth(startOfMonth(now));
  }, []);

  useEffect(() => {
    setCheckIn(initialCheckIn);
    setCheckOut(initialCheckOut);
    setAdults(initialAdults);
    setChildren(initialChildren);
  }, [initialCheckIn, initialCheckOut, initialAdults, initialChildren]);

  useEffect(() => {
    onChangeRef.current?.({ checkIn, checkOut, adults, children });
  }, [checkIn, checkOut, adults, children]);

  useEffect(() => {
    if (!datesOpen && !guestsOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setDatesOpen(false);
        setGuestsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDatesOpen(false);
        setGuestsOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [datesOpen, guestsOpen]);

  const months = useMemo(() => {
    if (!viewMonth) {
      return [];
    }
    return [viewMonth, addMonths(viewMonth, 1)];
  }, [viewMonth]);

  const weekdayLabels = t.raw("weekdays") as string[];

  const onSelectDay = (date: Date) => {
    if (today && isPastDay(date, today)) {
      return;
    }

    const value = toInputDate(date);

    if (!checkIn || (checkIn && checkOut) || value < checkIn) {
      setCheckIn(value);
      setCheckOut("");
      return;
    }

    if (value === checkIn) {
      return;
    }

    setCheckOut(value);
    setDatesOpen(false);
  };

  const clearDates = () => {
    setCheckIn("");
    setCheckOut("");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkIn || !checkOut) {
      setDatesOpen(true);
      return;
    }

    const values: BookingSearchValues = { checkIn, checkOut, adults, children };
    if (onSearch) {
      onSearch(values);
      return;
    }

    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
    });
    router.push(`/booking?${params.toString()}`);
  };

  const isInRange = (date: Date) => {
    if (!checkIn || !checkOut) {
      return false;
    }
    const value = toInputDate(date);
    return value > checkIn && value < checkOut;
  };

  return (
    <form ref={rootRef} className="booking-bar" onSubmit={onSubmit} aria-label={t("aria")}>
      <div className={`booking-field booking-dates${datesOpen ? " is-open" : ""}`}>
        <button
          type="button"
          className="booking-dates-trigger"
          aria-expanded={datesOpen}
          aria-controls="date-panel"
          onClick={() => {
            setDatesOpen((value) => !value);
            setGuestsOpen(false);
          }}
        >
          <span className="booking-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <span className={`booking-value${!checkIn ? " is-placeholder" : ""}`}>
            {checkIn ? (
              <>
                {formatStayDate(checkIn, locale)}
                <span aria-hidden="true"> → </span>
                {checkOut ? formatStayDate(checkOut, locale) : t("selectCheckout")}
              </>
            ) : (
              t("selectDates")
            )}
          </span>
        </button>

        {datesOpen && viewMonth && today ? (
          <div id="date-panel" className="date-panel">
            <div className="date-panel-nav">
              <button
                type="button"
                aria-label={t("prevMonth")}
                disabled={!!today && viewMonth <= startOfMonth(today)}
                onClick={() => setViewMonth((value) => (value ? addMonths(value, -1) : value))}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={t("nextMonth")}
                onClick={() => setViewMonth((value) => (value ? addMonths(value, 1) : value))}
              >
                ›
              </button>
            </div>

            <div className="date-calendars">
              {months.map((monthDate) => (
                <div key={toInputDate(monthDate)} className="date-calendar">
                  <h3 className="date-month-title">{formatMonthTitle(monthDate, locale)}</h3>
                  <div className="date-weekdays">
                    {weekdayLabels.map((label) => (
                      <span key={`${toInputDate(monthDate)}-${label}`}>{label}</span>
                    ))}
                  </div>
                  <div className="date-grid">
                    {buildMonthCells(monthDate).map((date, index) => {
                      if (!date) {
                        return <span key={`empty-${index}`} className="date-cell is-empty" />;
                      }

                      const value = toInputDate(date);
                      const past = isPastDay(date, today);
                      const selected = value === checkIn || value === checkOut;
                      const inRange = isInRange(date);

                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={past}
                          className={[
                            "date-cell",
                            past ? "is-past" : "is-available",
                            selected ? "is-selected" : "",
                            inRange ? "is-in-range" : "",
                            sameDay(date, today) ? "is-today" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => onSelectDay(date)}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="date-panel-footer">
              <button type="button" className="date-clear" onClick={clearDates}>
                <span aria-hidden="true">×</span>
                {t("clearDates")}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="booking-field booking-guests">
        <button
          type="button"
          className="booking-guests-trigger"
          aria-expanded={guestsOpen}
          aria-controls="guest-panel"
          onClick={() => {
            setGuestsOpen((value) => !value);
            setDatesOpen(false);
          }}
        >
          <span className="booking-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M5.5 19.2c1.4-3 3.6-4.5 6.5-4.5s5.1 1.5 6.5 4.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="booking-value">{t("guestSummary", { adults, children })}</span>
        </button>

        {guestsOpen ? (
          <div id="guest-panel" className="guest-panel">
            <div className="guest-row">
              <span>{t("adults")}</span>
              <div className="guest-stepper">
                <button
                  type="button"
                  aria-label={t("decreaseAdults")}
                  disabled={adults <= 1}
                  onClick={() => setAdults((value) => Math.max(1, value - 1))}
                >
                  −
                </button>
                <span>{adults}</span>
                <button
                  type="button"
                  aria-label={t("increaseAdults")}
                  disabled={adults >= MAX_PARTY_ADULTS}
                  onClick={() => setAdults((value) => Math.min(MAX_PARTY_ADULTS, value + 1))}
                >
                  +
                </button>
              </div>
            </div>
            <div className="guest-row">
              <span>{t("children")}</span>
              <div className="guest-stepper">
                <button
                  type="button"
                  aria-label={t("decreaseChildren")}
                  disabled={children <= 0}
                  onClick={() => setChildren((value) => Math.max(0, value - 1))}
                >
                  −
                </button>
                <span>{children}</span>
                <button
                  type="button"
                  aria-label={t("increaseChildren")}
                  disabled={children >= MAX_PARTY_CHILDREN}
                  onClick={() => setChildren((value) => Math.min(MAX_PARTY_CHILDREN, value + 1))}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <button type="submit" className="booking-search">
        <span>{submitLabel ?? t("search")}</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
