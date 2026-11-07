"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { localizeHref, safeHref } from "@/lib/cms/links";
import { LanguageSwitcher } from "./language-switcher";
import type { NavItem } from "./nav-links";

export function MobileMenu({ items, locale, labels, cta, switcherLabel }: { items: NavItem[]; locale: string; labels: { open: string; close: string; menu: string }; cta: { href: string; label: string; newTab: boolean } | null; switcherLabel: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? labels.close : labels.open} onClick={() => setOpen((o) => !o)} className="rounded-xl border border-border bg-white p-2.5 text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500">
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
      </button>
      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label={labels.menu} className="fixed inset-x-0 bottom-0 top-[var(--header-h,4.5rem)] z-50 overflow-y-auto bg-white px-4 pb-10 pt-4 shadow-soft">
          <ul className="space-y-1">
            {items.map((i) => {
              const target = safeHref(localizeHref(i.href, locale));
              const active = target === `/${locale}` ? pathname === target : pathname === target || (pathname ?? "").startsWith(`${target}/`);
              return (
                <li key={i.key}>
                  <Link href={target} aria-current={active ? "page" : undefined} className={`block rounded-xl px-4 py-3 text-lg font-semibold ${active ? "bg-brand-blue-50 text-brand-blue-600" : "text-brand-navy hover:bg-muted"}`}>
                    {i.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-6">
            <LanguageSwitcher locale={locale} label={switcherLabel} className="text-brand-navy" />
            {cta && (
              <a href={safeHref(localizeHref(cta.href, locale))} {...(cta.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-gold-600">
                {cta.label}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
