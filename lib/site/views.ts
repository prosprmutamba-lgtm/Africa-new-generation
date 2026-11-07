import type { PageLocale } from "@/lib/cms/blocks";
import type { Json } from "@/lib/cms/messages-diff";
import type { LinkSlotId } from "@/lib/cms/link-slots";
import type { Settings } from "@/lib/cms/schemas";
import type { T } from "./t";

/**
 * PURE parts of the public site model (no disk, no Node): the shape of `Site` and the helpers
 * that turn it into program / story views. Components import from here, so they never pull
 * server-only code; `lib/site/site.ts` builds a Site from the content store.
 */

export interface NavEntry {
  key: string;
  href: string;
  label: string;
  highlight: boolean;
  custom?: boolean;
}

export interface Site {
  locale: PageLocale;
  messages: Json;
  t: T;
  settings: Settings;
  /** Visible, ordered menu: built-in items + custom pages placed in the header. */
  menu: NavEntry[];
  /** Custom pages placed in the footer. */
  footerPages: NavEntry[];
  /** Destination of an editable button (null if an administrator hid it). */
  link: (id: LinkSlotId) => { href: string; newTab: boolean } | null;
}


/** Programs in the order and with the visibility chosen in the admin. */
export function visiblePrograms(site: Site) {
  return site.settings.programs.filter((p) => p.visible);
}

export function programView(site: Site, p: { slug: string; key: string; coverImage: string; hasDedicatedPage: boolean }) {
  const { t } = site;
  return {
    slug: p.slug,
    key: p.key,
    title: t(`programs.${p.key}.title`),
    short: t(`programs.${p.key}.shortDescription`),
    cover: p.coverImage,
    dedicated: t.raw(`programs.${p.key}.detail`) !== undefined,
  };
}

export interface StoryView {
  slug: string;
  title: string;
  excerpt: string;
  location: string;
  programSlug: string;
  quote: string;
  quoteName: string;
  body: string[];
  cover: string;
}

export function storiesOf(site: Site): StoryView[] {
  return site.t.list("impactStories.items").map((s) => {
    const slug = typeof s.slug === "string" ? s.slug : "";
    const text = (k: string) => (typeof s[k] === "string" ? (s[k] as string) : "");
    return {
      slug,
      title: text("title"),
      excerpt: text("excerpt"),
      location: text("location"),
      programSlug: text("programSlug"),
      quote: text("quote"),
      quoteName: text("quoteName"),
      body: Array.isArray(s.body) ? (s.body.filter((x) => typeof x === "string") as string[]) : [],
      cover: `/images/impact-stories/${slug}/cover.jpg`,
    };
  });
}
