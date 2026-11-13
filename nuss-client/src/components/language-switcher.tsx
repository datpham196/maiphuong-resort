"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="language-switcher" aria-label={t("language")}>
      {routing.locales.map((item) => (
        <button
          key={item}
          type="button"
          className={item === locale ? "is-active" : undefined}
          aria-pressed={item === locale}
          onClick={() => router.replace(pathname, { locale: item })}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
