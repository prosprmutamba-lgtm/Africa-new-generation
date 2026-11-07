"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizeHref, safeHref } from "@/lib/cms/links";

export interface NavItem {
  key: string;
  href: string;
  label: string;
  highlight: boolean;
}

export function NavLinks({ items, locale, label }: { items: NavItem[]; locale: string; label: string }) {
  const here = usePathname() || "";
  return (
    <nav aria-label={label} className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {items.map((i) => {
          const target = safeHref(localizeHref(i.href, locale));
          const root = target === `/${locale}`;
          const active = root ? here === target : here === target || here.startsWith(`${target}/`);
          return (
            <li key={i.key}>
              <Link
                href={target}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500 ${
                  i.highlight ? "border-2 border-brand-gold text-brand-navy hover:bg-brand-gold" : active ? "text-brand-blue-500" : "text-brand-navy hover:text-brand-blue-500"
                }`}
              >
                {i.label}
                {active && !i.highlight && <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-brand-gold" aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
