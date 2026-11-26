"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useI18nNavRouter } from "@/hooks/use-nav-router";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useI18nNavRouter();
  const pendingScrollY = useRef<number | null>(null);

  useEffect(() => {
    if (pendingScrollY.current == null) {
      return;
    }

    const y = pendingScrollY.current;
    pendingScrollY.current = null;

    const restore = () => window.scrollTo({ top: y, left: 0, behavior: "auto" });
    restore();
    requestAnimationFrame(restore);
    const timer = window.setTimeout(restore, 0);
    return () => window.clearTimeout(timer);
  }, [locale]);

  return (
    <div className="language-switcher" aria-label={t("language")}>
      {routing.locales.map((item) => (
        <button
          key={item}
          type="button"
          className={item === locale ? "is-active" : undefined}
          aria-pressed={item === locale}
          onClick={() => {
            if (item === locale) {
              return;
            }
            pendingScrollY.current = window.scrollY;
            router.replace(pathname, { locale: item, scroll: false });
          }}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
