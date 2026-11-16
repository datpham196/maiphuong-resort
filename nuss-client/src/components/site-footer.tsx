"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const SOCIAL = {
  facebook: "https://www.facebook.com/share/1MAj5ui7GU/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/mai_phuong_resort_phu_quoc/",
} as const;

const CONTACT = {
  phones: [
    { display: "0932.852.185", href: "tel:+84932852185" },
    { display: "0297.629.0092", href: "tel:+842976290092" },
    { display: "0931.442.673", href: "tel:+84931442673" },
  ],
  email: "maiphuongresort@gmail.com",
} as const;

export function SiteFooter() {
  const t = useTranslations("Footer");
  const tHeader = useTranslations("Header");

  const exploreLinks = [
    { href: "/about", label: tHeader("about") },
    { href: "/rooms", label: tHeader("rooms") },
    { href: "/restaurants", label: tHeader("restaurants") },
    { href: "/spa", label: tHeader("spa") },
    { href: "/offers", label: tHeader("offers") },
    { href: "/gallery", label: tHeader("gallery") },
    { href: "/booking", label: tHeader("bookNow") },
  ] as const;

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link className="footer-logo" href="/" aria-label={t("brand")}>
            <img
              src="/logo/logoMP-clear.png"
              alt={t("brand")}
              width={180}
              height={102}
            />
          </Link>
          <p className="footer-blurb">{t("blurb")}</p>
          <div className="footer-social" aria-label={t("socialAria")}>
            <a
              className="footer-social-link"
              href={SOCIAL.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M14 9h3V6h-3c-1.6 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"
                />
              </svg>
            </a>
            <a
              className="footer-social-link"
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5A4.5 4.5 0 1 1 7.5 13 4.5 4.5 0 0 1 12 8.5zm0 2A2.5 2.5 0 1 0 14.5 13 2.5 2.5 0 0 0 12 10.5zM17.2 7.3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-column">
          <p className="footer-heading">{t("exploreTitle")}</p>
          <ul className="footer-links">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <p className="footer-heading">{t("contactTitle")}</p>
          <ul className="footer-contact">
            <li>
              <span className="footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5z"
                  />
                </svg>
              </span>
              <span>{t("address")}</span>
            </li>
            <li>
              <span className="footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.4a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .6 3.6 1 1 0 0 1-.3 1z"
                  />
                </svg>
              </span>
              <span className="footer-phones">
                {CONTACT.phones.map((phone, index) => (
                  <span key={phone.href}>
                    {index > 0 ? " - " : null}
                    <a href={phone.href}>{phone.display}</a>
                  </span>
                ))}
              </span>
            </li>
            <li>
              <span className="footer-contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5L4 8V6l8 5 8-5z"
                  />
                </svg>
              </span>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-note">{t("copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
