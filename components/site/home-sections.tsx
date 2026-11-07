import { CalendarDays, Check, Quote } from "lucide-react";
import type { ReactNode } from "react";
import type { Site } from "@/lib/site/views";
import { programView, storiesOf, visiblePrograms } from "@/lib/site/views";
import { formatDate, str } from "@/lib/site/t";
import { Avatar, ProgramCard, StoryCard } from "./cards";
import { HeroCarousel, type HeroSlide } from "./hero-carousel";
import { ImgWithFallback, Photo } from "./safe-image";
import { SmartLink } from "./smart-link";
import { NewsletterForm } from "./newsletter-form";
import { Container, CtaLink, Section, SectionHeading } from "./ui";

/* Each function renders one section of the home page; it returns null when it has nothing real to show.
   The ORDER and VISIBILITY of the sections are chosen in Admin → Menu & home page. */

export function HeroSection({ site }: { site: Site }) {
  const { t, settings } = site;
  const imgs = [settings.images.heroSlide1, settings.images.heroSlide2, settings.images.heroSlide3];
  const raw = t.list("home.hero.slides");
  const slides: HeroSlide[] = (raw.length ? raw : [{ eyebrow: t("home.hero.eyebrow"), headline: t("home.hero.headline"), subtitle: t("home.hero.subtitle") }]).map((s, k) => ({
    eyebrow: str(s.eyebrow),
    headline: str(s.headline),
    subtitle: str(s.subtitle),
    image: imgs[k] ?? imgs[0] ?? "",
  }));
  return (
    <HeroCarousel slides={slides} labels={{ previous: t("home.hero.previousSlide"), next: t("home.hero.nextSlide"), goTo: t("home.hero.goToSlide") }}>
      <CtaLink site={site} slot="hero.donate" label={t("home.hero.donateButton")} variant="accent" />
      <CtaLink site={site} slot="hero.partner" label={t("home.hero.partnerButton")} variant="outlineLight" />
    </HeroCarousel>
  );
}

export function StatsSection({ site }: { site: Site }) {
  const { t, settings } = site;
  const shown = settings.stats.filter((s) => s.value.trim() !== "");
  if (shown.length === 0) return null; // figures are never invented: nothing is shown until real numbers are entered
  return (
    <Section tone="white" className="!py-12 sm:!py-16" label={t("home.stats.title")}>
      <div className="rounded-3xl bg-brand-navy px-6 py-10 text-white sm:px-12 sm:py-14">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">{t("home.stats.eyebrow")}</p>
        <h2 className="font-heading text-3xl sm:text-4xl">{t("home.stats.title")}</h2>
        <dl className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {shown.map((s) => (
            <div key={s.id} className="flex flex-col-reverse border-l-2 border-brand-gold pl-5">
              <dt className="mt-1 text-sm text-white/80">{t(`home.stats.${s.id}`)}</dt>
              <dd className="font-heading text-4xl text-brand-gold sm:text-5xl">{s.value}</dd>
            </div>
          ))}
        </dl>
        {t("home.stats.note") && <p className="mt-8 text-xs text-white/60">{t("home.stats.note")}</p>}
      </div>
    </Section>
  );
}

export function AboutPreview({ site }: { site: Site }) {
  const { t, settings } = site;
  const points = t.list("about.whyChooseUs.points").slice(0, 3);
  return (
    <Section id="about" tone="white" label={t("home.aboutPreview.title")}>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow={t("home.aboutPreview.eyebrow")} title={t("home.aboutPreview.title")} subtitle={t("home.aboutPreview.description")} />
          {points.length > 0 && (
            <ul className="mb-9 space-y-5">
              {points.map((p, k) => (
                <li key={k} className="flex gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue-500">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold text-brand-navy">{str(p.title)}</span>
                    <span className="block text-sm leading-relaxed text-muted-foreground">{str(p.description)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <CtaLink site={site} slot="home.about" label={t("home.aboutPreview.cta")} variant="primary" />
        </div>
        <div className="relative mx-auto w-full max-w-xl pb-12 pr-12">
          <Photo src={settings.images.aboutMain} alt="" label="ANG" className="aspect-[4/5] w-full rounded-3xl shadow-soft" />
          <Photo src={settings.images.aboutSecondary} alt="" className="absolute bottom-0 right-0 aspect-square w-1/2 rounded-3xl border-8 border-white shadow-soft" />
          <span className="absolute -left-4 top-10 hidden h-24 w-3 rounded-full bg-brand-gold sm:block" aria-hidden="true" />
        </div>
      </div>
    </Section>
  );
}

export function ProgramsPreview({ site }: { site: Site }) {
  const { t } = site;
  const list = visiblePrograms(site).map((p) => programView(site, p));
  if (list.length === 0) return null;
  return (
    <Section id="programs" tone="muted" label={t("home.programsPreview.title")}>
      <SectionHeading eyebrow={t("home.programsPreview.eyebrow")} title={t("home.programsPreview.title")} subtitle={t("home.programsPreview.subtitle")} center />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProgramCard key={p.slug} site={site} program={p} />
        ))}
      </ul>
      <div className="mt-12 text-center">
        <CtaLink site={site} slot="home.programs" label={t("home.programsPreview.cta")} variant="primary" />
      </div>
    </Section>
  );
}

export function ImpactPreview({ site }: { site: Site }) {
  const { t } = site;
  const stories = storiesOf(site).slice(0, 3);
  if (stories.length === 0) return null;
  return (
    <Section tone="white" label={t("home.impactPreview.title")}>
      <SectionHeading eyebrow={t("home.impactPreview.eyebrow")} title={t("home.impactPreview.title")} subtitle={t("home.impactPreview.subtitle")} center />
      <ul className="grid gap-6 md:grid-cols-3">
        {stories.map((s) => (
          <StoryCard key={s.slug} site={site} story={s} />
        ))}
      </ul>
      <div className="mt-12 text-center">
        <CtaLink site={site} slot="home.stories" label={t("home.impactPreview.cta")} variant="outline" />
      </div>
    </Section>
  );
}

export function GalleryPreview({ site }: { site: Site }) {
  const { t, locale, settings } = site;
  const items = settings.gallery.filter((g) => g.visible && g.type === "photo").slice(0, 6);
  if (items.length === 0) return null;
  return (
    <Section tone="dark" label={t("home.galleryPreview.title")}>
      <SectionHeading eyebrow={t("home.galleryPreview.eyebrow")} title={t("home.galleryPreview.title")} subtitle={t("home.galleryPreview.subtitle")} light center />
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {items.map((g) => (
          <li key={g.id}>
            <SmartLink href="/gallery" locale={locale} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl" aria-label={`${t("common.viewPhoto")}: ${g.alt}`}>
              <Photo src={g.src} alt={g.alt} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
            </SmartLink>
          </li>
        ))}
      </ul>
      <div className="mt-12 text-center">
        <CtaLink site={site} slot="home.gallery" label={t("home.galleryPreview.cta")} variant="accent" />
      </div>
    </Section>
  );
}

const PLACEHOLDER_PARTNER = /^partner (one|two|three|four|five)$/i;

export function PartnersSection({ site }: { site: Site }) {
  const { t, locale } = site;
  // Placeholder entries from the starter configuration are never shown to visitors.
  const partners = site.settings.partners.filter((p) => p.visible && p.name.trim() && !PLACEHOLDER_PARTNER.test(p.name.trim()));
  if (partners.length === 0) return null;
  return (
    <Section tone="white" label={t("home.partners.title")}>
      <SectionHeading eyebrow={t("home.partners.eyebrow")} title={t("home.partners.title")} subtitle={t("home.partners.subtitle")} center />
      <ul className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {partners.map((p) => {
          const inner = (
            <ImgWithFallback src={p.logo} alt={p.name} className="max-h-16 w-auto max-w-full object-contain" fallback={<span className="text-center text-sm font-semibold text-brand-navy">{p.name}</span>} />
          );
          return (
            <li key={p.id} className="flex h-24 items-center justify-center rounded-2xl border border-border bg-white p-4">
              {p.website ? (
                <SmartLink href={p.website} locale={locale} newTab className="flex h-full w-full items-center justify-center" aria-label={p.name}>
                  {inner}
                </SmartLink>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export function TestimonialsSection({ site }: { site: Site }) {
  const { t, settings } = site;
  const items = t.list("home.testimonials.items");
  if (items.length === 0) return null;
  const avatars = new Map(settings.testimonials.map((a) => [a.id, a.avatar]));
  return (
    <Section tone="dark" label={t("home.testimonials.title")}>
      <SectionHeading eyebrow={t("home.testimonials.eyebrow")} title={t("home.testimonials.title")} subtitle={t("home.testimonials.subtitle")} light center />
      <ul className="grid gap-6 md:grid-cols-2">
        {items.map((it, k) => (
          <li key={str(it.id) || k} className="relative rounded-3xl bg-white/[0.07] p-8">
            <Quote className="absolute right-6 top-6 h-10 w-10 text-brand-gold/40" aria-hidden="true" />
            <blockquote className="relative text-lg leading-relaxed text-white/95">“{str(it.quote)}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-4">
              <Avatar src={avatars.get(str(it.id)) || undefined} name={str(it.name)} />
              <span>
                <span className="block font-semibold">{str(it.name)}</span>
                <span className="block text-sm text-white/70">{str(it.role)}</span>
              </span>
            </figcaption>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function NewsSection({ site }: { site: Site }) {
  const { t, locale } = site;
  const items = t.list("home.news.items");
  if (items.length === 0) return null;
  return (
    <Section tone="muted" label={t("home.news.title")}>
      <SectionHeading eyebrow={t("home.news.eyebrow")} title={t("home.news.title")} center />
      <ul className="grid gap-6 md:grid-cols-3">
        {items.map((n, k) => (
          <li key={k} className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-card">
            <span className="mb-4 block h-1 w-10 rounded-full bg-brand-gold" aria-hidden="true" />
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-blue-500">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <time dateTime={str(n.date)}>{formatDate(str(n.date), locale)}</time>
            </p>
            <h3 className="font-heading text-2xl leading-snug text-brand-navy">{str(n.title)}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{str(n.excerpt)}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function FaqList({ items }: { items: Array<{ id: string; question: string; answer: string }> }) {
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <details key={i.id} className="group rounded-2xl border border-border bg-white shadow-card open:shadow-soft">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue-500">
            {i.question}
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue-50 text-xl leading-none text-brand-blue-500 transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{i.answer}</p>
        </details>
      ))}
    </div>
  );
}

export const faqItems = (site: Site) =>
  site.t.list("makeADifference.faq.items").map((i, k) => ({ id: str(i.id) || String(k), question: str(i.question), answer: str(i.answer) }));

export function FaqSection({ site }: { site: Site }) {
  const { t } = site;
  const items = faqItems(site);
  if (items.length === 0) return null;
  return (
    <Section tone="white" label={t("makeADifference.faq.title")}>
      <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
        <div>
          <SectionHeading title={t("makeADifference.faq.title")} />
          <div className="rounded-3xl bg-brand-blue-500 p-8 text-white">
            <h3 className="font-heading text-2xl">{t("makeADifference.fundraisingTeam.title")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/85">{t("makeADifference.fundraisingTeam.description")}</p>
            <div className="mt-6">
              <CtaLink site={site} slot="donate.fundraising" label={t("makeADifference.fundraisingTeam.ctaLabel")} variant="accent" />
            </div>
          </div>
        </div>
        <FaqList items={items} />
      </div>
    </Section>
  );
}

export function NewsletterSection({ site }: { site: Site }) {
  const { t, locale } = site;
  return (
    <section className="py-16 sm:py-20" aria-label={t("home.newsletter.title")}>
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand-blue-500 px-6 py-12 text-white sm:px-14 sm:py-16">
          <span className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-20 left-1/4 h-52 w-52 rounded-full bg-brand-gold/25" aria-hidden="true" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl sm:text-5xl">{t("home.newsletter.title")}</h2>
              <p className="mt-3 text-lg text-white/85">{t("home.newsletter.subtitle")}</p>
            </div>
            <NewsletterForm locale={locale} labels={{ placeholder: t("home.newsletter.placeholder"), cta: t("home.newsletter.cta"), sending: t("common.sending"), success: t("home.newsletter.success"), error: t("home.newsletter.error"), invalid: t("contact.form.errors.email") }} />
          </div>
        </div>
      </Container>
    </section>
  );
}

export const HOME_RENDERERS: Record<string, (p: { site: Site }) => ReactNode> = {
  hero: HeroSection,
  stats: StatsSection,
  aboutPreview: AboutPreview,
  programsPreview: ProgramsPreview,
  impactPreview: ImpactPreview,
  galleryPreview: GalleryPreview,
  partners: PartnersSection,
  testimonials: TestimonialsSection,
  news: NewsSection,
  faq: FaqSection,
  newsletter: NewsletterSection,
};
