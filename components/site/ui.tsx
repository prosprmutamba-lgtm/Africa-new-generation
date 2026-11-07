import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { LinkSlotId } from "@/lib/cms/link-slots";
import type { Site } from "@/lib/site/views";
import { SmartLink } from "./smart-link";

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

const TONES = {
  white: "bg-white text-brand-navy",
  muted: "bg-muted text-brand-navy",
  blue: "bg-brand-blue-500 text-white",
  dark: "bg-brand-navy text-white",
} as const;

export function Section({ id, tone = "white", children, className, label }: { id?: string; tone?: keyof typeof TONES; children: ReactNode; className?: string; label?: string }) {
  return (
    <section id={id} aria-label={label} className={cx("py-16 sm:py-24", TONES[tone], className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, center, light, as: Tag = "h2" }: { eyebrow?: string; title: string; subtitle?: string; center?: boolean; light?: boolean; as?: "h1" | "h2" | "h3" }) {
  return (
    <div className={cx("mb-10 max-w-3xl sm:mb-14", center && "mx-auto text-center")}>
      {eyebrow && (
        <p className={cx("mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]", center && "justify-center", light ? "text-brand-gold" : "text-brand-blue-500")}>
          <span className="h-0.5 w-8 bg-brand-gold" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <Tag className={cx("font-heading text-3xl leading-tight sm:text-5xl", light ? "text-white" : "text-brand-navy")}>{title}</Tag>
      {subtitle && <p className={cx("mt-4 text-base leading-relaxed sm:text-lg", light ? "text-white/80" : "text-muted-foreground")}>{subtitle}</p>}
    </div>
  );
}

const BASE = "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold";
export const BUTTON = {
  primary: `${BASE} bg-brand-blue-500 text-white hover:bg-brand-blue-600`,
  accent: `${BASE} bg-brand-gold text-brand-navy hover:bg-brand-gold-600`,
  outline: `${BASE} border-2 border-brand-blue-500 text-brand-blue-500 hover:bg-brand-blue-50`,
  outlineLight: `${BASE} border-2 border-white/80 text-white hover:bg-white/10`,
  light: `${BASE} bg-white text-brand-blue-600 hover:bg-brand-blue-50`,
} as const;
export type ButtonVariant = keyof typeof BUTTON;

/**
 * A button whose DESTINATION, visibility and “new tab” flag come from Admin → Buttons & links,
 * and whose TEXT comes from Admin → Texts. Renders nothing if it was hidden or has no text.
 */
export function CtaLink({ site, slot, label, variant = "primary", className, arrow = true }: { site: Site; slot: LinkSlotId; label: string; variant?: ButtonVariant; className?: string; arrow?: boolean }) {
  const l = site.link(slot);
  if (!l || !label) return null;
  return (
    <SmartLink href={l.href} newTab={l.newTab} locale={site.locale} className={cx(BUTTON[variant], className)}>
      {label}
      {arrow && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
    </SmartLink>
  );
}

/** Top band of an inner page. */
export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-brand-blue-500 text-white">
      <span className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-gold/20" aria-hidden="true" />
      <Container className="relative py-16 sm:py-24">
        {eyebrow && (
          <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
            <span className="h-0.5 w-8 bg-brand-gold" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-4xl font-heading text-4xl leading-tight sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/85">{subtitle}</p>}
        {children}
      </Container>
    </section>
  );
}

/** A closing band with a title, a text and up to two buttons. */
export function CtaBand({ title, description, children, image }: { title: string; description?: string; children: ReactNode; image?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-brand-navy text-white">
      {image}
      <Container className="relative py-16 sm:py-20">
        <div className="max-w-3xl">
          <span className="mb-4 block h-1 w-14 rounded-full bg-brand-gold" aria-hidden="true" />
          <h2 className="font-heading text-3xl sm:text-5xl">{title}</h2>
          {description && <p className="mt-4 text-lg leading-relaxed text-white/80">{description}</p>}
          <div className="mt-8 flex flex-wrap gap-3">{children}</div>
        </div>
      </Container>
    </section>
  );
}
