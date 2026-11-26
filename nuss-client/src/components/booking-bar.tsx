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

type DateFocus = "checkIn" | "checkOut";

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string) {
  return new Date(`${value}T12:00:00`);
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

function formatDdMmYyyy(value: string) {
  if (!value) {
    return "";
  }
  const date = parseInputDate(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
  const [dateFocus, setDateFocus] = useState<DateFocus>("checkIn");
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

  function openDates(focus: DateFocus) {
    setDateFocus(focus);
    setDatesOpen(true);
    setGuestsOpen(false);
  }

  const onSelectDay = (date: Date) => {
    if (today && isPastDay(date, today)) {
      return;
    }

    const value = toInputDate(date);

    if (dateFocus === "checkOut" && checkIn && value > checkIn) {
      setCheckOut(value);
      setDatesOpen(false);
      return;
    }

    if (!checkIn || (checkIn && checkOut) || value < checkIn || dateFocus === "checkIn") {
      setCheckIn(value);
      setCheckOut("");
      setDateFocus("checkOut");
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
    setDateFocus("checkIn");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkIn || !checkOut) {
      openDates(checkIn ? "checkOut" : "checkIn");
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
      <div className={`booking-dates-group${datesOpen ? " is-open" : ""}`}>
        <div className="booking-field booking-checkin">
          <button
            type="button"
            className="booking-field-trigger"
            aria-expanded={datesOpen && dateFocus === "checkIn"}
            aria-controls="date-panel"
            onClick={() => openDates("checkIn")}
          >
            <span className="booking-field-copy">
              <span className="booking-label">{t("checkIn")}</span>
              <span className={`booking-value${!checkIn ? " is-placeholder" : ""}`}>
                {checkIn ? formatDdMmYyyy(checkIn) : t("datePlaceholder")}
              </span>
            </span>
            <span className="booking-icon" aria-hidden="true">
              <CalendarIcon />
            </span>
          </button>
        </div>

        <div className="booking-field booking-checkout">
          <button
            type="button"
            className="booking-field-trigger"
            aria-expanded={datesOpen && dateFocus === "checkOut"}
            aria-controls="date-panel"
            onClick={() => openDates("checkOut")}
          >
            <span className="booking-field-copy">
              <span className="booking-label">{t("checkOut")}</span>
              <span className={`booking-value${!checkOut ? " is-placeholder" : ""}`}>
                {checkOut ? formatDdMmYyyy(checkOut) : t("datePlaceholder")}
              </span>
            </span>
            <span className="booking-icon" aria-hidden="true">
              <CalendarIcon />
            </span>
          </button>
        </div>

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
          className="booking-field-trigger"
          aria-expanded={guestsOpen}
          aria-controls="guest-panel"
          onClick={() => {
            setGuestsOpen((value) => !value);
            setDatesOpen(false);
          }}
        >
          <span className="booking-field-copy">
            <span className="booking-label">{t("guests")}</span>
            <span className="booking-value">{t("guestSummary", { adults, children })}</span>
          </span>
          <span className="booking-icon is-chevron" aria-hidden="true">
            <ChevronIcon />
          </span>
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
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
