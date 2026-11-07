import Link from "next/link";
import type { ReactNode } from "react";
import { isExternal, localizeHref, safeHref } from "@/lib/cms/links";

/**
 * Every link of the public site goes through here: internal paths get the language prefix,
 * external links open safely, and anything that is not a normal link becomes "#".
 */
export function SmartLink({ href, locale, newTab, className, children, ...rest }: { href: string; locale: string; newTab?: boolean; className?: string; children: ReactNode } & Record<string, unknown>) {
  const target = safeHref(localizeHref(href, locale));
  const external = isExternal(target);
  if (external || newTab) {
    return (
      <a href={target} className={className} {...(newTab || /^https?:/i.test(target) ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={target} className={className} {...rest}>
      {children}
    </Link>
  );
}
