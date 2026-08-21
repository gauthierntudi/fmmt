"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import type { AppPathname } from "@/i18n/routing";

const locales = [
  { code: "fr" as const, label: "FR", name: "Français" },
  { code: "en" as const, label: "EN", name: "English" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="lang-switcher" role="group" aria-label="Language / Langue">
      {locales.map(({ code, label, name }) => {
        const isActive = locale === code;
        return (
          <Link
            key={code}
            href={pathname as AppPathname}
            locale={code}
            className={isActive ? "lang-option active" : "lang-option"}
            aria-current={isActive ? "true" : undefined}
            aria-label={name}
            title={name}
            hrefLang={code}
          >
            <span className="lang-code">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
