"use client";

import { usePathname } from "next/navigation";

const LOCALES = ["en", "fr"] as const;
const NAMES: Record<string, string> = { en: "English", fr: "Français" };

/** Same page in the other language (the current path with only the language prefix swapped). */
export function LanguageSwitcher({ locale, label, className = "" }: { locale: string; label: string; className?: string }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(en|fr)(?=\/|$)/, "");
  return (
    <nav aria-label={label} className={`flex items-center gap-1 text-xs font-semibold ${className}`}>
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden="true" className="opacity-40">|</span>}
          <a
            href={`/${l}${rest}`}
            lang={l}
            hrefLang={l}
            aria-label={NAMES[l]}
            aria-current={l === locale ? "true" : undefined}
            className={`rounded px-1.5 py-0.5 transition-colors ${l === locale ? "bg-brand-gold text-brand-navy" : "hover:text-brand-gold"}`}
          >
            {l.toUpperCase()}
          </a>
        </span>
      ))}
    </nav>
  );
}
