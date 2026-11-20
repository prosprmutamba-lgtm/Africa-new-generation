/* eslint-disable @next/next/no-img-element */
import { SmartLink } from "@/components/site/smart-link";
import { BLOCK_SPECS, type Block, type BlockData, type BlockItem, type Issue, type PageLocale } from "@/lib/cms/blocks";
import { safeSrc } from "@/lib/cms/links";

/**
 * Public rendering of page-builder blocks. Server components only (the FAQ uses the
 * native <details> element), no client JavaScript. All text is rendered as plain text
 * by React, so nothing typed in the admin can inject HTML or script.
 * Styling follows the ANG graphic charter: blue as the main colour, yellow and red as
 * measured accents, anthracite for text and dark bands, Anton headlines, Montserrat body.
 */

const str = (v: unknown) => (typeof v === "string" ? v : "");
const items = (d: BlockData): BlockItem[] => (Array.isArray(d.items) ? (d.items as BlockItem[]) : []);

function Paragraphs({ text, className = "" }: { text: string; className?: string }) {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} className={className}>
          {p.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

const BTN: Record<string, string> = {
  primary: "bg-brand-blue-500 text-white hover:bg-brand-blue-600",
  secondary: "bg-brand-gold text-brand-navy hover:bg-brand-gold-600",
  outline: "border-2 border-brand-blue-500 text-brand-blue-500 hover:bg-brand-blue-50",
};
const BTN_BASE = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors";

function SectionTitle({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="mb-8">
      <span className="mb-3 block h-1 w-12 rounded-full bg-brand-gold" aria-hidden="true" />
      <h2 className="font-heading text-3xl text-brand-navy sm:text-4xl">{text}</h2>
    </div>
  );
}

function RenderBlock({ block, locale }: { block: Block; locale: PageLocale }) {
  const d = block.data[locale];
  switch (block.type) {
    case "heading": {
      const text = str(d.text);
      if (!text) return null;
      const center = d.align === "center";
      if (d.level === "h3") return <h3 className={`font-heading text-2xl text-brand-navy ${center ? "text-center" : ""}`}>{text}</h3>;
      return (
        <div className={center ? "text-center" : ""}>
          <span className={`mb-3 block h-1 w-12 rounded-full bg-brand-gold ${center ? "mx-auto" : ""}`} aria-hidden="true" />
          <h2 className="font-heading text-3xl text-brand-navy sm:text-4xl">{text}</h2>
        </div>
      );
    }
    case "text": {
      const body = str(d.body);
      if (!body) return null;
      return (
        <div className="mx-auto max-w-3xl space-y-4 text-base leading-relaxed text-brand-navy/90">
          <Paragraphs text={body} />
        </div>
      );
    }
    case "image": {
      const src = safeSrc(str(d.src));
      if (!src) return null;
      const size = d.size === "narrow" ? "max-w-2xl" : d.size === "full" ? "max-w-none" : "max-w-4xl";
      const w = Number(d.width) || undefined;
      const h = Number(d.height) || undefined;
      return (
        <figure className={`mx-auto ${size}`}>
          <img src={src} alt={str(d.alt)} width={w} height={h} loading="lazy" decoding="async" className="h-auto w-full rounded-2xl object-cover shadow-card" />
          {str(d.caption) && <figcaption className="mt-3 text-center text-sm text-muted-foreground">{str(d.caption)}</figcaption>}
        </figure>
      );
    }
    case "buttons": {
      const list = items(d).filter((i) => str(i.label) && str(i.href));
      if (!list.length) return null;
      return (
        <div className={`flex flex-wrap gap-3 ${d.align === "center" ? "justify-center" : ""}`}>
          {list.map((i) => (
            <SmartLink key={i.id} href={str(i.href)} locale={locale} newTab={i.newTab === true} className={`${BTN_BASE} ${BTN[str(i.style)] ?? BTN.primary}`}>
              {str(i.label)}
            </SmartLink>
          ))}
        </div>
      );
    }
    case "cards": {
      const list = items(d).filter((i) => str(i.title));
      if (!list.length) return null;
      const cols = d.columns === "2" ? "sm:grid-cols-2" : d.columns === "4" ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
      return (
        <div>
          <SectionTitle text={str(d.title)} />
          <ul className={`grid gap-6 ${cols}`}>
            {list.map((i) => (
              <li key={i.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card">
                {safeSrc(str(i.image)) && <img src={safeSrc(str(i.image))} alt="" loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-heading text-xl text-brand-navy">{str(i.title)}</h3>
                  {str(i.text) && <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground"><Paragraphs text={str(i.text)} /></div>}
                  {str(i.href) && str(i.linkLabel) && (
                    <SmartLink href={str(i.href)} locale={locale} className="mt-4 inline-flex items-center text-sm font-semibold text-brand-blue-500 hover:underline">
                      {str(i.linkLabel)} <span aria-hidden="true" className="ml-1">→</span>
                    </SmartLink>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    case "stats": {
      const list = items(d).filter((i) => str(i.value) && str(i.label));
      if (!list.length) return null;
      return (
        <div className="rounded-3xl bg-brand-navy px-6 py-10 text-white sm:px-10">
          {str(d.title) && <h2 className="mb-8 font-heading text-3xl sm:text-4xl">{str(d.title)}</h2>}
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {list.map((i) => (
              <div key={i.id} className="flex flex-col-reverse">
                <dt className="mt-1 text-sm text-white/80">{str(i.label)}</dt>
                <dd className="font-heading text-4xl text-brand-gold sm:text-5xl">{str(i.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    }
    case "testimonials": {
      const list = items(d).filter((i) => str(i.quote) && str(i.name));
      if (!list.length) return null;
      return (
        <div>
          <SectionTitle text={str(d.title)} />
          <ul className="grid gap-6 md:grid-cols-2">
            {list.map((i) => (
              <li key={i.id} className="rounded-2xl bg-brand-blue-50 p-6">
                <blockquote className="text-base leading-relaxed text-brand-navy">“{str(i.quote)}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {safeSrc(str(i.photo)) && <img src={safeSrc(str(i.photo))} alt="" loading="lazy" decoding="async" className="h-12 w-12 rounded-full object-cover" />}
                  <span>
                    <span className="block text-sm font-semibold text-brand-navy">{str(i.name)}</span>
                    {str(i.role) && <span className="block text-xs text-muted-foreground">{str(i.role)}</span>}
                  </span>
                </figcaption>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    case "faq": {
      const list = items(d).filter((i) => str(i.question) && str(i.answer));
      if (!list.length) return null;
      return (
        <div className="mx-auto max-w-3xl">
          <SectionTitle text={str(d.title)} />
          <div className="space-y-3">
            {list.map((i) => (
              <details key={i.id} className="group rounded-xl border border-border bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-brand-navy">
                  {str(i.question)}
                  <span aria-hidden="true" className="text-2xl leading-none text-brand-blue-500 transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="space-y-3 px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                  <Paragraphs text={str(i.answer)} />
                </div>
              </details>
            ))}
          </div>
        </div>
      );
    }
    case "cta": {
      if (!str(d.heading) || !str(d.buttonLabel) || !str(d.buttonHref)) return null;
      const tone = d.tone === "dark" ? "bg-brand-navy text-white" : d.tone === "yellow" ? "bg-brand-gold text-brand-navy" : "bg-brand-blue-500 text-white";
      const btn = d.tone === "yellow" ? "bg-brand-navy text-white hover:bg-brand-navy/90" : "bg-white text-brand-blue-600 hover:bg-brand-blue-50";
      return (
        <div className={`rounded-3xl px-6 py-10 sm:px-10 ${tone}`}>
          <h2 className="font-heading text-3xl sm:text-4xl">{str(d.heading)}</h2>
          {str(d.text) && <div className="mt-3 max-w-2xl space-y-2 opacity-90"><Paragraphs text={str(d.text)} /></div>}
          <SmartLink href={str(d.buttonHref)} locale={locale} className={`${BTN_BASE} mt-6 ${btn}`}>
            {str(d.buttonLabel)}
          </SmartLink>
        </div>
      );
    }
    default:
      return null;
  }
}

export function BlockRenderer({ blocks, locale }: { blocks: Block[]; locale: PageLocale }) {
  return (
    <div className="space-y-10 sm:space-y-14">
      {blocks.map((b) => (
        <section key={b.id} data-block={b.type}>
          <RenderBlock block={b} locale={locale} />
        </section>
      ))}
    </div>
  );
}

/* ───────────────────────── whole page ───────────────────────── */

export interface PageViewProps {
  title: string;
  blocks: Block[];
  locale: PageLocale;
  /** Set only for a signed-in administrator previewing. */
  preview?: { status: "draft" | "published"; visible: boolean; issues: Issue[] };
}

export function PageView({ title, blocks, locale, preview }: PageViewProps) {
  const here = preview?.issues.filter((i) => i.locale === locale || i.locale === "all") ?? [];
  return (
    <>
      {preview && (
        <div role="status" className="border-b border-brand-gold-300 bg-brand-gold-50 px-4 py-3 text-sm text-brand-navy">
          <p className="mx-auto max-w-5xl">
            <strong>Preview</strong> — {preview.status === "draft" ? "this page is a draft and is not visible to visitors." : preview.visible ? "this page is published and visible in this language." : `this page is published but NOT visible in ${locale.toUpperCase()} yet.`}
            {here.length > 0 && (
              <>
                {" "}Still missing in {locale.toUpperCase()}: {here.slice(0, 5).map((i) => i.message).join("; ")}
                {here.length > 5 ? "…" : ""}.
              </>
            )}</p>
        </div>
      )}
      <header className="bg-brand-blue-500 text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <span className="mb-4 block h-1 w-14 rounded-full bg-brand-gold" aria-hidden="true" />
          <h1 className="font-heading text-4xl leading-tight sm:text-6xl">{title || "Untitled page"}</h1>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <BlockRenderer blocks={blocks} locale={locale} />
      </div>
    </>
  );
}

export { BLOCK_SPECS };
