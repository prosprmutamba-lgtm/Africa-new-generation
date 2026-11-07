import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import type { Site } from "@/lib/site/views";
import { visiblePrograms } from "@/lib/site/views";
import { Container } from "./ui";
import { Logo } from "./logo";
import { SmartLink } from "./smart-link";
import { NewsletterForm } from "./newsletter-form";

/** Footer: which blocks appear, the links, contact details and social accounts all come from the admin. */
export function Footer({ site }: { site: Site }) {
  const { t, locale, settings } = site;
  const f = settings.footer;
  const c = settings.contact;
  const social = [
    { name: "Facebook", href: settings.social.facebook, Icon: Facebook },
    { name: "Instagram", href: settings.social.instagram, Icon: Instagram },
    { name: "LinkedIn", href: settings.social.linkedin, Icon: Linkedin },
    { name: "YouTube", href: settings.social.youtube, Icon: Youtube },
  ].filter((s) => s.href);
  const programs = visiblePrograms(site).slice(0, f.maxProgramsShown);
  const quick = [...site.menu.filter((m) => !m.highlight), ...site.menu.filter((m) => m.highlight), ...site.footerPages];
  const cols = 1 + 1 + (f.showProgramsColumn ? 1 : 0) + (f.showContactColumn ? 1 : 0);
  const grid = cols >= 4 ? "lg:grid-cols-4" : cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  const link = "text-sm text-white/75 hover:text-brand-gold transition-colors";

  return (
    <footer className="bg-brand-navy text-white">
      <Container className="py-14 sm:py-16">
        <div className={`grid gap-10 sm:grid-cols-2 ${grid}`}>
          <div>
            <Logo site={site} variant="white" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">{t("footer.description")}</p>
            {f.showSocialLinks && social.length > 0 && (
              <ul className="mt-6 flex gap-3" aria-label={t("footer.followUs")}>
                {social.map(({ name, href, Icon }) => (
                  <li key={name}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={name} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-brand-gold hover:text-brand-navy">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label={t("footer.quickLinks")}>
            <h2 className="font-heading text-lg tracking-wide">{t("footer.quickLinks")}</h2>
            <span className="mt-2 block h-0.5 w-8 bg-brand-gold" aria-hidden="true" />
            <ul className="mt-5 space-y-2.5">
              {quick.map((i) => (
                <li key={i.key}>
                  <SmartLink href={i.href} locale={locale} className={link}>
                    {i.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          {f.showProgramsColumn && programs.length > 0 && (
            <nav aria-label={t("footer.programs")}>
              <h2 className="font-heading text-lg tracking-wide">{t("footer.programs")}</h2>
              <span className="mt-2 block h-0.5 w-8 bg-brand-gold" aria-hidden="true" />
              <ul className="mt-5 space-y-2.5">
                {programs.map((p) => (
                  <li key={p.slug}>
                    <SmartLink href={`/programs/${p.slug}`} locale={locale} className={link}>
                      {t(`programs.${p.key}.title`)}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {f.showContactColumn && (
            <div>
              <h2 className="font-heading text-lg tracking-wide">{t("footer.contactUs")}</h2>
              <span className="mt-2 block h-0.5 w-8 bg-brand-gold" aria-hidden="true" />
              <ul className="mt-5 space-y-3 text-sm text-white/75">
                {c.phone && (
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" aria-hidden="true" />
                    <a href={c.phoneHref} className="hover:text-brand-gold">{c.phone}</a>
                  </li>
                )}
                {c.email && (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" aria-hidden="true" />
                    <a href={c.emailHref} className="break-all hover:text-brand-gold">{c.email}</a>
                  </li>
                )}
                {c.address.full && (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" aria-hidden="true" />
                    <span>{c.address.full}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 rounded-2xl bg-white/5 p-6 sm:p-8">
          <div className="grid items-center gap-5 md:grid-cols-2">
            <p className="font-heading text-xl sm:text-2xl">{t("footer.newsletterCta")}</p>
            <NewsletterForm
              locale={locale}
              tone="footer"
              labels={{ placeholder: t("home.newsletter.placeholder"), cta: t("home.newsletter.cta"), sending: t("common.sending"), success: t("home.newsletter.success"), error: t("home.newsletter.error"), invalid: t("contact.form.errors.email") }}
            />
          </div>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="py-5 text-center text-xs text-white/60">{t("footer.copyright", { year: new Date().getFullYear() })}</Container>
      </div>
    </footer>
  );
}
