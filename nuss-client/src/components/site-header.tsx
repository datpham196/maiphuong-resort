"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18nNavRouter } from "@/hooks/use-nav-router";
import { Link } from "@/i18n/navigation";

type SiteHeaderProps = {
  /** Use on light pages without a dark hero so nav stays readable at the top. */
  tone?: "over-hero" | "on-light";
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.2 4.2a1 1 0 0 1-1.4 1.4l-4.2-4.2A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"
      />
    </svg>
  );
}

export function SiteHeader({ tone = "over-hero" }: SiteHeaderProps) {
  const t = useTranslations("Header");
  const router = useI18nNavRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const solid = tone === "on-light" || (scrolled && !open);

  // About stays on the homepage section only — not in site navigation.
  const navLinks = [
    { href: "/rooms", label: t("rooms") },
    { href: "/restaurants", label: t("restaurants") },
    { href: "/spa", label: t("spa") },
    { href: "/offers", label: t("offers") },
  ] as const;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function goBookingLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    setOpen(false);
    if (!trimmed) {
      router.push("/booking/lookup");
      return;
    }
    router.push(`/booking/lookup?ref=${encodeURIComponent(trimmed)}`);
  }

  return (
    <>
      <header className={`site-header${solid ? " is-scrolled" : ""}`}>
        <button
          type="button"
          className="menu-button"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen(true)}
        >
          <span className="sr-only">{t("openMenu")}</span>
          <span className="menu-icon" aria-hidden="true" />
        </button>

        <nav className="header-primary-nav" aria-label={t("mainMenu")}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <Link className="wordmark" href="/" aria-label={t("brand")}>
          <img
            className="header-logo"
            src="/logo/logoMP-clear.png"
            alt={t("brand")}
            width={168}
            height={96}
          />
        </Link>

        <div className="header-actions">
          <form className="header-booking-search" onSubmit={goBookingLookup} role="search">
            <label className="sr-only" htmlFor="header-booking-q">
              {t("bookingSearchLabel")}
            </label>
            <input
              id="header-booking-q"
              type="search"
              name="ref"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("bookingSearchPlaceholder")}
              autoComplete="off"
            />
            <button type="submit" className="header-booking-search-btn" aria-label={t("bookingSearchSubmit")}>
              <SearchIcon />
            </button>
          </form>
          <LanguageSwitcher />
          <Link className="book-button" href="/booking">
            {t("bookNow")}
          </Link>
        </div>
      </header>

      <button
        type="button"
        className={`menu-backdrop${open ? " is-open" : ""}`}
        aria-label={t("closeMenu")}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />

      <nav
        id="site-menu"
        className={`site-menu${open ? " is-open" : ""}`}
        aria-label={t("mainMenu")}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="menu-close"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        >
          <span className="sr-only">{t("closeMenu")}</span>
          <span className="menu-close-icon" aria-hidden="true" />
        </button>
        <p className="menu-title">
          <img
            className="menu-logo"
            src="/logo/logoMP-clear.png"
            alt={t("brand")}
            width={180}
            height={102}
          />
        </p>
        <form
          className="header-booking-search is-mobile-menu"
          onSubmit={goBookingLookup}
          role="search"
        >
          <label className="sr-only" htmlFor="header-booking-q-mobile">
            {t("bookingSearchLabel")}
          </label>
          <input
            id="header-booking-q-mobile"
            type="search"
            name="ref"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("bookingSearchPlaceholder")}
            autoComplete="off"
            tabIndex={open ? 0 : -1}
          />
          <button
            type="submit"
            className="header-booking-search-btn"
            aria-label={t("bookingSearchSubmit")}
            tabIndex={open ? 0 : -1}
          >
            <SearchIcon />
          </button>
        </form>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
