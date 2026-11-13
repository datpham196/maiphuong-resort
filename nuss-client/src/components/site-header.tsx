"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/i18n/navigation";

type SiteHeaderProps = {
  /** Use on light pages without a dark hero so nav stays readable at the top. */
  tone?: "over-hero" | "on-light";
};

export function SiteHeader({ tone = "over-hero" }: SiteHeaderProps) {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const solid = tone === "on-light" || (scrolled && !open);

  // Experiences + gallery stay on homepage sections only — not in site navigation.
  const navLinks = [
    { href: "/about", label: t("about") },
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

        <Link className="wordmark" href="/" aria-label={t("brand")}>
          <img
            className="header-logo"
            src="/logo/logoMP-clear.png"
            alt={t("brand")}
            width={168}
            height={96}
          />
        </Link>

        <nav className="header-primary-nav" aria-label={t("mainMenu")}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
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
