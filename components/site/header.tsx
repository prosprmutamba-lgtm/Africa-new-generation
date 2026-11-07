import { Mail, MapPin, Phone } from "lucide-react";
import type { Site } from "@/lib/site/views";
import { Container, CtaLink } from "./ui";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { MobileMenu } from "./mobile-menu";
import { LanguageSwitcher } from "./language-switcher";
import { SmartLink } from "./smart-link";

/** Top information bar + main navigation. Menu, contact details, logo and the Donate button all come from the admin. */
export function Header({ site }: { site: Site }) {
  const { t, locale, settings } = site;
  const c = settings.contact;
  const donate = site.link("header.donate");
  const place = [c.address.district, c.address.country].filter(Boolean).join(", ");
  return (
    <header className="sticky top-0 z-40 w-full [--header-h:4.5rem] md:[--header-h:6.5rem]">
      <div className="hidden bg-brand-navy text-xs text-white/90 md:block">
        <Container className="flex items-center justify-between gap-6 py-2">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {c.phone && (
              <li>
                <a href={c.phoneHref} className="inline-flex items-center gap-1.5 hover:text-brand-gold">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {c.phone}
                </a>
              </li>
            )}
            {c.email && (
              <li>
                <a href={c.emailHref} className="inline-flex items-center gap-1.5 hover:text-brand-gold">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" /> {c.email}
                </a>
              </li>
            )}
            {place && (
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {place}
              </li>
            )}
          </ul>
          <LanguageSwitcher locale={locale} label={t("common.navigationMenu")} className="text-white" />
        </Container>
      </div>
      <div className="border-b border-border bg-white/95 backdrop-blur">
        <Container className="flex h-[4.5rem] items-center justify-between gap-4">
          <SmartLink href="/" locale={locale} aria-label={settings.organization.name} className="flex shrink-0 items-center">
            <Logo site={site} />
          </SmartLink>
          <NavLinks items={site.menu} locale={locale} label={t("common.navigationMenu")} />
          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <CtaLink site={site} slot="header.donate" label={t("nav.donate")} variant="accent" arrow={false} />
            </div>
            <MobileMenu
              items={site.menu}
              locale={locale}
              labels={{ open: t("common.openMenu"), close: t("common.close"), menu: t("common.navigationMenu") }}
              cta={donate ? { href: donate.href, newTab: donate.newTab, label: t("nav.donate") } : null}
              switcherLabel={t("common.navigationMenu")}
            />
          </div>
        </Container>
      </div>
    </header>
  );
}
