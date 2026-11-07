import { ArrowLeft, Award, Briefcase, Building2, Check, Heart, Mail, MapPin, MessageCircle, Phone, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { Site } from "@/lib/site/views";
import { programView, storiesOf, visiblePrograms } from "@/lib/site/views";
import { str } from "@/lib/site/t";
import { Avatar, ProgramCard, StoryCard } from "./cards";
import { ContactForm } from "./contact-form";
import { GalleryExplorer, type GalleryEntry } from "./gallery-explorer";
import { FaqList, faqItems } from "./home-sections";
import { Paragraphs } from "./prose";
import { Photo } from "./safe-image";
import { SmartLink } from "./smart-link";
import { CtaBand, CtaLink, PageHero, Section, SectionHeading } from "./ui";

const initials = (s: string) => s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const photoSrc = (p: string) => (p.startsWith("/") ? p : p ? `/images/team/${p}.jpg` : "");

/* ───────────────────────── About ───────────────────────── */
export function AboutBody({ site }: { site: Site }) {
  const { t, settings } = site;
  const values = t.list("about.values.items");
  const members = t.list("about.leadership.members");
  const points = t.list("about.whyChooseUs.points");
  return (
    <>
      <PageHero eyebrow={t("about.hero.eyebrow")} title={t("about.hero.title")} subtitle={t("about.hero.subtitle")} />
      <Section id="story" label={t("about.story.title")}>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={t("about.story.eyebrow")} title={t("about.story.title")} />
            <div className="space-y-5 text-base leading-relaxed text-brand-navy/85">
              {t.strings("about.story.body").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <Photo src={settings.images.aboutMain} alt="" label="ANG" className="aspect-[4/3] w-full rounded-3xl shadow-soft" />
        </div>
      </Section>

      <Section tone="muted" label={t("about.mission.title")}>
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue-500">{t("about.mission.eyebrow")}</p>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl bg-brand-blue-500 p-8 text-white sm:p-10">
            <h2 className="font-heading text-3xl">{t("about.mission.title")}</h2>
            <p className="mt-4 leading-relaxed text-white/90">{t("about.mission.body")}</p>
          </article>
          <article className="rounded-3xl bg-brand-navy p-8 text-white sm:p-10">
            <h2 className="font-heading text-3xl text-brand-gold">{t("about.vision.title")}</h2>
            <p className="mt-4 leading-relaxed text-white/90">{t("about.vision.body")}</p>
          </article>
        </div>
      </Section>

      {values.length > 0 && (
        <Section label={t("about.values.title")}>
          <SectionHeading eyebrow={t("about.values.eyebrow")} title={t("about.values.title")} center />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, k) => (
              <li key={k} className="rounded-2xl border border-border bg-white p-6 shadow-card">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold font-heading text-xl text-brand-navy">{k + 1}</span>
                <h3 className="font-heading text-2xl text-brand-navy">{str(v.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{str(v.description)}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {members.length > 0 && (
        <Section tone="muted" label={t("about.leadership.title")}>
          <SectionHeading eyebrow={t("about.leadership.eyebrow")} title={t("about.leadership.title")} subtitle={t("about.leadership.subtitle")} center />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((m, k) => (
              <li key={k} className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
                <Photo src={photoSrc(str(m.photo))} alt={str(m.name)} label={initials(str(m.name))} className="aspect-[4/5] w-full" />
                <div className="p-5">
                  <h3 className="font-heading text-xl text-brand-navy">{str(m.name)}</h3>
                  <p className="text-sm font-semibold text-brand-blue-500">{str(m.role)}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{str(m.bio)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {points.length > 0 && (
        <Section tone="dark" label={t("about.whyChooseUs.title")}>
          <SectionHeading eyebrow={t("about.whyChooseUs.eyebrow")} title={t("about.whyChooseUs.title")} light />
          <ul className="grid gap-6 md:grid-cols-2">
            {points.map((p, k) => (
              <li key={k} className="flex gap-5 rounded-2xl bg-white/[0.07] p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-heading text-2xl">{str(p.title)}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/80">{str(p.description)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand title={t("about.cta.title")} description={t("about.cta.description")}>
        <CtaLink site={site} slot="about.primary" label={t("about.cta.primaryLabel")} variant="accent" />
        <CtaLink site={site} slot="about.secondary" label={t("about.cta.secondaryLabel")} variant="outlineLight" />
      </CtaBand>
    </>
  );
}

/* ───────────────────────── Programs ───────────────────────── */
export function ProgramsBody({ site }: { site: Site }) {
  const { t } = site;
  const list = visiblePrograms(site).map((p) => programView(site, p));
  return (
    <>
      <PageHero eyebrow={t("programs.hero.eyebrow")} title={t("programs.hero.title")} subtitle={t("programs.hero.subtitle")} />
      <Section tone="muted" label={t("programs.intro.title")}>
        <SectionHeading title={t("programs.intro.title")} subtitle={t("programs.intro.description")} center />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProgramCard key={p.slug} site={site} program={p} />
          ))}
        </ul>
      </Section>
      <CtaBand title={t("programs.cta.title")} description={t("programs.cta.description")}>
        <CtaLink site={site} slot="programs.primary" label={t("programs.cta.primaryLabel")} variant="accent" />
        <CtaLink site={site} slot="programs.secondary" label={t("programs.cta.secondaryLabel")} variant="outlineLight" />
      </CtaBand>
    </>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((x, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue-500">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-sm leading-relaxed text-brand-navy/90">{x}</span>
        </li>
      ))}
    </ul>
  );
}

/** One program page: the full template when the texts include `detail`, the lighter summary page otherwise. Returns null for an unknown/hidden program. */
export function ProgramBody({ site, slug }: { site: Site; slug: string }) {
  const { t, locale } = site;
  const setting = visiblePrograms(site).find((p) => p.slug === slug);
  if (!setting) return null;
  const p = programView(site, setting);
  const k = `programs.${setting.key}`;
  const others = visiblePrograms(site).filter((x) => x.slug !== slug).slice(0, 3).map((x) => programView(site, x));
  const timeline = t.list(`${k}.detail.timeline`);
  const stories = t.list(`${k}.detail.successStories`);
  const objectives = t.strings(`${k}.detail.objectives`);
  const activities = t.strings(`${k}.detail.activities`);
  return (
    <>
      <PageHero eyebrow={t("programs.hero.eyebrow")} title={p.title} subtitle={p.short}>
        <SmartLink href="/programs" locale={locale} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-brand-gold">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("common.backToPrograms")}
        </SmartLink>
      </PageHero>

      <Section label={t("common.overview")}>
        <div className="grid items-start gap-12 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 className="mb-6 font-heading text-3xl text-brand-navy sm:text-4xl">{t("common.overview")}</h2>
            <div className="space-y-5 text-base leading-relaxed text-brand-navy/85">
              <Paragraphs text={t(`${k}.description`)} />
            </div>
          </div>
          <Photo src={`/images/programs/${slug}/hero.jpg`} alt="" label={initials(p.title)} className="aspect-[4/3] w-full rounded-3xl shadow-soft" />
        </div>
        {!p.dedicated && t("programs.otherProgramsNote") && (
          <div className="mt-10 rounded-2xl border border-brand-gold/50 bg-brand-gold/10 p-6">
            <p className="text-sm leading-relaxed text-brand-navy">{t("programs.otherProgramsNote")}</p>
            <div className="mt-4">
              <CtaLink site={site} slot="program.contact" label={t("nav.contact")} variant="outline" />
            </div>
          </div>
        )}
      </Section>

      {p.dedicated && (objectives.length > 0 || activities.length > 0) && (
        <Section tone="muted" label={t("common.objectives")}>
          <div className="grid gap-10 md:grid-cols-2">
            {objectives.length > 0 && (
              <div>
                <h2 className="mb-6 font-heading text-3xl text-brand-navy">{t("common.objectives")}</h2>
                <CheckList items={objectives} />
              </div>
            )}
            {activities.length > 0 && (
              <div>
                <h2 className="mb-6 font-heading text-3xl text-brand-navy">{t("common.activities")}</h2>
                <CheckList items={activities} />
              </div>
            )}
          </div>
        </Section>
      )}

      {p.dedicated && t(`${k}.detail.targetBeneficiaries`) && (
        <section className="bg-brand-blue-500 py-14 text-white">
          <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
            <h2 className="font-heading text-3xl">{t("common.targetBeneficiaries")}</h2>
            <p className="mt-4 text-lg leading-relaxed text-white/90">{t(`${k}.detail.targetBeneficiaries`)}</p>
          </div>
        </section>
      )}

      {timeline.length > 0 && (
        <Section label={t("common.timeline")}>
          <SectionHeading title={t("common.timeline")} />
          <ol className="relative space-y-8 border-l-2 border-brand-gold pl-8">
            {timeline.map((s, i) => (
              <li key={str(s.id) || i} className="relative">
                <span className="absolute -left-[2.6rem] top-1 h-4 w-4 rounded-full border-4 border-white bg-brand-blue-500" aria-hidden="true" />
                <p className="text-sm font-semibold text-brand-blue-500">{str(s.date)}</p>
                <h3 className="font-heading text-2xl text-brand-navy">{str(s.title)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{str(s.description)}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {stories.length > 0 && (
        <Section tone="muted" label={t("common.successStories")}>
          <SectionHeading title={t("common.successStories")} />
          <ul className="grid gap-6 md:grid-cols-2">
            {stories.map((s, i) => (
              <li key={str(s.id) || i} className="rounded-3xl bg-white p-8 shadow-card">
                <blockquote className="text-lg leading-relaxed text-brand-navy">“{str(s.quote)}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar name={str(s.name)} />
                  <span>
                    <span className="block font-semibold text-brand-navy">{str(s.name)}</span>
                    <span className="block text-sm text-muted-foreground">{str(s.role)}</span>
                  </span>
                </figcaption>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CtaBand title={t(`${k}.detail.ctaTitle`) || t("programs.cta.title")} description={t(`${k}.detail.ctaDescription`) || t("programs.cta.description")}>
        <CtaLink site={site} slot="program.donate" label={t("common.donateNow")} variant="accent" />
        <CtaLink site={site} slot="program.partner" label={t("common.becomeAPartner")} variant="outlineLight" />
      </CtaBand>

      {others.length > 0 && (
        <Section label={t("common.viewAllPrograms")}>
          <SectionHeading title={t("programs.hero.title")} />
          <ul className="grid gap-6 md:grid-cols-3">
            {others.map((o) => (
              <ProgramCard key={o.slug} site={site} program={o} />
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

/* ───────────────────────── Impact stories ───────────────────────── */
export function StoriesBody({ site }: { site: Site }) {
  const { t } = site;
  return (
    <>
      <PageHero eyebrow={t("impactStories.hero.eyebrow")} title={t("impactStories.hero.title")} subtitle={t("impactStories.hero.subtitle")} />
      <Section tone="muted" label={t("impactStories.hero.title")}>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {storiesOf(site).map((s) => (
            <StoryCard key={s.slug} site={site} story={s} />
          ))}
        </ul>
      </Section>
      <CtaBand title={t("impactStories.cta.title")} description={t("impactStories.cta.description")}>
        <CtaLink site={site} slot="stories.donate" label={t("impactStories.cta.buttonLabel")} variant="accent" />
      </CtaBand>
    </>
  );
}

export function StoryBody({ site, slug }: { site: Site; slug: string }) {
  const { t, locale } = site;
  const all = storiesOf(site);
  const story = all.find((s) => s.slug === slug);
  if (!story) return null;
  const program = visiblePrograms(site).find((p) => p.slug === story.programSlug);
  const related = all.filter((s) => s.slug !== slug).slice(0, 3);
  return (
    <>
      <PageHero eyebrow={story.location || t("impactStories.hero.eyebrow")} title={story.title}>
        <SmartLink href="/impact-stories" locale={locale} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-brand-gold">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t("common.backToStories")}
        </SmartLink>
      </PageHero>
      <Section label={story.title}>
        <article className="mx-auto max-w-3xl">
          <Photo src={story.cover} alt="" label={initials(story.title)} className="mb-10 aspect-[16/9] w-full rounded-3xl shadow-soft" />
          <div className="space-y-6 text-lg leading-relaxed text-brand-navy/90">
            {story.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {story.quote && (
            <blockquote className="my-10 border-l-4 border-brand-gold bg-brand-blue-50 p-8">
              <p className="font-heading text-2xl leading-snug text-brand-navy">“{story.quote}”</p>
              {story.quoteName && <footer className="mt-4 text-sm font-semibold text-brand-blue-500">— {story.quoteName}</footer>}
            </blockquote>
          )}
          {program && (
            <p className="text-sm">
              <SmartLink href={`/programs/${program.slug}`} locale={locale} className="font-semibold text-brand-blue-500 hover:underline">
                {t(`programs.${program.key}.title`)} →
              </SmartLink>
            </p>
          )}
        </article>
      </Section>
      <CtaBand title={t("impactStories.cta.title")} description={t("impactStories.cta.description")}>
        <CtaLink site={site} slot="stories.donate" label={t("impactStories.cta.buttonLabel")} variant="accent" />
      </CtaBand>
      {related.length > 0 && (
        <Section tone="muted" label={t("common.viewAllStories")}>
          <SectionHeading title={t("impactStories.hero.title")} />
          <ul className="grid gap-6 md:grid-cols-3">
            {related.map((s) => (
              <StoryCard key={s.slug} site={site} story={s} />
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

/* ───────────────────────── Gallery ───────────────────────── */
export function GalleryBody({ site }: { site: Site }) {
  const { t, settings } = site;
  const items: GalleryEntry[] = settings.gallery
    .filter((g) => g.visible)
    .map((g) => ({ id: g.id, type: g.type, category: g.category, src: g.src, thumbnail: g.thumbnail, alt: g.alt, width: g.width, height: g.height, videoUrl: g.videoUrl }));
  return (
    <>
      <PageHero eyebrow={t("gallery.hero.eyebrow")} title={t("gallery.hero.title")} subtitle={t("gallery.hero.subtitle")} />
      <Section label={t("gallery.hero.title")}>
        <GalleryExplorer
          items={items}
          labels={{
            all: t("gallery.categories.all"),
            photos: t("gallery.categories.photos"),
            videos: t("gallery.categories.videos"),
            emptyTitle: t("gallery.emptyState.title"),
            emptySubtitle: t("gallery.emptyState.subtitle"),
            close: t("common.close"),
            next: t("common.next"),
            previous: t("common.previous"),
            viewPhoto: t("common.viewPhoto"),
            playVideo: t("common.playVideo"),
            videoSoon: t("programs.videoComingSoon"),
          }}
        />
      </Section>
    </>
  );
}

/* ───────────────────────── Make a Difference ───────────────────────── */
const WAYS = [
  { key: "donate", slot: "donate.donate", Icon: Heart },
  { key: "volunteer", slot: "donate.volunteer", Icon: Users },
  { key: "partner", slot: "donate.partner", Icon: Building2 },
  { key: "majorDonor", slot: "donate.majorDonor", Icon: Award },
  { key: "corporateSponsorship", slot: "donate.corporate", Icon: Briefcase },
] as const;

function DetailsCard({ title, description, rows }: { title: string; description: string; rows: Array<{ label: string; value: string }> }) {
  return (
    <article className="rounded-3xl border border-border bg-white p-8 shadow-card">
      <h3 className="font-heading text-2xl text-brand-navy">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <dl className="mt-6 divide-y divide-border">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-6">
            <dt className="text-sm text-muted-foreground">{r.label}</dt>
            <dd className="break-words text-sm font-semibold text-brand-navy sm:text-right">{r.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function DonateBody({ site }: { site: Site }) {
  const { t } = site;
  const rows = (k: string) => t.list(`makeADifference.${k}.details`).map((d) => ({ label: str(d.label), value: str(d.value) }));
  return (
    <>
      <PageHero eyebrow={t("makeADifference.hero.eyebrow")} title={t("makeADifference.hero.title")} subtitle={t("makeADifference.hero.subtitle")} />
      <Section tone="muted" label={t("makeADifference.ways.title")}>
        <SectionHeading title={t("makeADifference.ways.title")} subtitle={t("makeADifference.ways.subtitle")} center />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {WAYS.map(({ key, slot, Icon }) => (
            <li key={key} className="flex flex-col rounded-3xl border border-border bg-white p-8 shadow-card">
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-500 text-white">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-2xl text-brand-navy">{t(`makeADifference.${key}.title`)}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{t(`makeADifference.${key}.description`)}</p>
              <div className="mt-6">
                <CtaLink site={site} slot={slot} label={t(`makeADifference.${key}.ctaLabel`)} variant={key === "donate" ? "accent" : "outline"} />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="how-to-give" label={t("makeADifference.paymentOptions.title")}>
        <SectionHeading title={t("makeADifference.paymentOptions.title")} subtitle={t("makeADifference.paymentOptions.subtitle")} />
        <div className="grid gap-6 lg:grid-cols-2">
          <DetailsCard title={t("makeADifference.bankTransfer.title")} description={t("makeADifference.bankTransfer.description")} rows={rows("bankTransfer")} />
          <DetailsCard title={t("makeADifference.mobileMoney.title")} description={t("makeADifference.mobileMoney.description")} rows={rows("mobileMoney")} />
        </div>
      </Section>

      <Section tone="muted" label={t("makeADifference.faq.title")}>
        <div className="mx-auto max-w-3xl">
          <SectionHeading title={t("makeADifference.faq.title")} center />
          <FaqList items={faqItems(site)} />
        </div>
      </Section>

      <CtaBand title={t("makeADifference.fundraisingTeam.title")} description={t("makeADifference.fundraisingTeam.description")}>
        <CtaLink site={site} slot="donate.fundraising" label={t("makeADifference.fundraisingTeam.ctaLabel")} variant="accent" />
      </CtaBand>
    </>
  );
}

/* ───────────────────────── Contact ───────────────────────── */
export function ContactBody({ site }: { site: Site }) {
  const { t, locale, settings } = site;
  const c = settings.contact;
  const social = [
    { name: "Facebook", href: settings.social.facebook },
    { name: "Instagram", href: settings.social.instagram },
    { name: "LinkedIn", href: settings.social.linkedin },
    { name: "YouTube", href: settings.social.youtube },
  ].filter((s) => s.href);
  const maps = `https://www.google.com/maps?q=${c.coordinates.lat},${c.coordinates.lng}`;
  const row = (icon: ReactNode, label: string, value: ReactNode) => (
    <li className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blue-50 text-brand-blue-500">{icon}</span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="block text-sm font-semibold text-brand-navy">{value}</span>
      </span>
    </li>
  );
  return (
    <>
      <PageHero eyebrow={t("contact.hero.eyebrow")} title={t("contact.hero.title")} subtitle={t("contact.hero.subtitle")} />
      <Section label={t("contact.form.title")}>
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 className="mb-8 font-heading text-3xl text-brand-navy sm:text-4xl">{t("contact.form.title")}</h2>
            <ContactForm
              locale={locale}
              labels={{
                name: t("contact.form.name"),
                email: t("contact.form.email"),
                phone: t("contact.form.phone"),
                subject: t("contact.form.subject"),
                message: t("contact.form.message"),
                submit: t("contact.form.submit"),
                sending: t("contact.form.sending"),
                thankYou: t("contact.form.thankYou"),
                sendAnother: t("contact.form.sendAnother"),
                genericError: t("contact.form.genericError"),
                errors: { name: t("contact.form.errors.name"), email: t("contact.form.errors.email"), subject: t("contact.form.errors.subject"), message: t("contact.form.errors.message") },
              }}
            />
          </div>
          <aside className="rounded-3xl bg-muted p-8" aria-label={t("contact.info.title")}>
            <h2 className="mb-6 font-heading text-2xl text-brand-navy">{t("contact.info.title")}</h2>
            <ul className="space-y-6">
              {c.phone && row(<Phone className="h-5 w-5" aria-hidden="true" />, t("contact.info.phone"), <a href={c.phoneHref} className="hover:text-brand-blue-500">{c.phone}</a>)}
              {c.email && row(<Mail className="h-5 w-5" aria-hidden="true" />, t("contact.info.email"), <a href={c.emailHref} className="break-all hover:text-brand-blue-500">{c.email}</a>)}
              {c.whatsapp && row(<MessageCircle className="h-5 w-5" aria-hidden="true" />, t("contact.info.whatsapp"), <a href={c.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-brand-blue-500">{c.whatsapp}</a>)}
              {c.address.full && row(<MapPin className="h-5 w-5" aria-hidden="true" />, t("contact.info.address"), c.address.full)}
            </ul>
            {social.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("contact.info.socialMedia")}</p>
                <ul className="flex flex-wrap gap-2">
                  {social.map((s) => (
                    <li key={s.name}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-navy ring-1 ring-border hover:bg-brand-blue-50">
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Section>

      {c.mapEmbedUrl && (
        <Section tone="muted" label={t("contact.map.title")}>
          <SectionHeading title={t("contact.map.title")} />
          <div className="overflow-hidden rounded-3xl shadow-card">
            <iframe src={c.mapEmbedUrl} title={t("contact.map.title")} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[420px] w-full border-0" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("contact.map.note")}{" "}
            <a href={maps} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-blue-500 hover:underline">
              {t("contact.map.openInGoogleMaps")}
            </a>
          </p>
        </Section>
      )}
    </>
  );
}

/* ───────────────────────── 404 ───────────────────────── */
export function NotFoundBody({ site }: { site: Site }) {
  const { t } = site;
  return (
    <section className="flex min-h-[60vh] items-center bg-white py-20">
      <div className="mx-auto w-full max-w-3xl px-4 text-center sm:px-6">
        <p className="font-heading text-8xl text-brand-gold sm:text-9xl">{t("notFound.eyebrow")}</p>
        <h1 className="mt-4 font-heading text-4xl text-brand-navy sm:text-5xl">{t("notFound.title")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{t("notFound.subtitle")}</p>
        <div className="mt-8">
          <CtaLink site={site} slot="notFound.home" label={t("notFound.cta")} variant="primary" />
        </div>
      </div>
    </section>
  );
}
