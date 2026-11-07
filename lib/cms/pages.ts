import { randomBytes } from "node:crypto";
import { z } from "zod";
import { store } from "./store";
import { UserError } from "./users";
import { buildDefaultSettings } from "./defaults";
import { getMergedMessages } from "./messages";
import { isPlainObject, type Json } from "./messages-diff";
import { pageReadiness, type Block, type PageLocale, type Readiness } from "./blocks";
import { imagePath, text } from "./schemas";

/**
 * Custom pages created in the dashboard.
 * A page has ONE slug (the URL is /<locale>/<slug>), a title and SEO fields in each
 * language, a place in the navigation, and a list of blocks (see blocks.ts).
 * A page is only visible in a language once it is published AND complete in that
 * language — the missing language is reported, never auto-translated.
 */

export type PageStatus = "draft" | "published";
export type NavPlacement = "none" | "header" | "footer";
type L10n = Record<PageLocale, string>;

export interface PageRecord {
  id: string;
  slug: string;
  status: PageStatus;
  title: L10n;
  seo: { title: L10n; description: L10n; image: string };
  nav: { placement: NavPlacement; label: L10n; order: number };
  blocks: Block[];
  rev: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}
interface PagesDoc {
  pages: PageRecord[];
}
const EMPTY: PagesDoc = { pages: [] };

/* ───────────────────────── input schema ───────────────────────── */

const l10n = (max: number) => z.object({ en: text(max), fr: text(max) });
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*){0,2}$/;

export const pageMetaSchema = z.object({
  slug: z.string().trim().toLowerCase().max(100, "Maximum 100 characters.").regex(SLUG_RE, "Use lowercase letters, numbers and dashes (e.g. livelihood-week). A slash makes a sub-page (e.g. news/summer-camp)."),
  title: l10n(120),
  seo: z.object({ title: l10n(120), description: l10n(300), image: imagePath }),
  nav: z.object({
    placement: z.enum(["none", "header", "footer"]),
    label: l10n(40),
    order: z.coerce.number().int().min(0).max(999),
  }),
});
export type PageMeta = z.infer<typeof pageMetaSchema>;

/* ───────────────────────── slug rules ───────────────────────── */

const ALWAYS_RESERVED_FIRST = new Set(["admin", "api", "media", "_next", "en", "fr"]);
const STATIC_ROUTES = ["about", "programs", "impact-stories", "gallery", "make-a-difference", "contact"];

/** Paths that already exist as real routes of the site and therefore cannot be used. */
export async function reservedPaths(): Promise<Set<string>> {
  const set = new Set<string>(STATIC_ROUTES);
  for (const p of buildDefaultSettings().programs) set.add(`programs/${p.slug}`);
  try {
    const en = (await getMergedMessages("en")) as Json;
    const items = isPlainObject(en) && isPlainObject(en.impactStories) ? en.impactStories.items : undefined;
    if (Array.isArray(items)) for (const it of items) if (isPlainObject(it) && typeof it.slug === "string") set.add(`impact-stories/${it.slug}`);
  } catch {
    /* texts unreadable: static routes are still protected */
  }
  return set;
}

export async function slugProblem(slug: string, pages: PageRecord[], selfId?: string): Promise<string | null> {
  const first = slug.split("/")[0] as string;
  if (ALWAYS_RESERVED_FIRST.has(first)) return `“${first}” is reserved by the system. Choose another address.`;
  if ((await reservedPaths()).has(slug)) return "This address is already used by an existing page of the site. Choose another one.";
  if (pages.some((p) => p.slug === slug && p.id !== selfId)) return "Another page already uses this address.";
  return null;
}

/* ───────────────────────── readiness (shared with the editor) ───────────────────────── */

export { pageReadiness };
export type { Readiness };

/* ───────────────────────── CRUD ───────────────────────── */

const newId = () => randomBytes(5).toString("hex");

export async function listPages(): Promise<PageRecord[]> {
  return (await store.read<PagesDoc>("pages", EMPTY)).data.pages.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function getPage(id: string): Promise<PageRecord | undefined> {
  return (await store.read<PagesDoc>("pages", EMPTY)).data.pages.find((p) => p.id === id);
}
export async function getPageBySlug(slug: string): Promise<PageRecord | undefined> {
  return (await store.read<PagesDoc>("pages", EMPTY)).data.pages.find((p) => p.slug === slug);
}

const emptyMeta = (slug: string, title: L10n): PageMeta => ({
  slug,
  title,
  seo: { title: { en: "", fr: "" }, description: { en: "", fr: "" }, image: "" },
  nav: { placement: "none", label: { en: "", fr: "" }, order: 50 },
});

export async function createPage(input: { slug: string; title: L10n }, user: string): Promise<PageRecord> {
  const meta = pageMetaSchema.parse(emptyMeta(input.slug, input.title));
  let created!: PageRecord;
  await store.update<PagesDoc>(
    "pages",
    EMPTY,
    async (d) => {
      const problem = await slugProblem(meta.slug, d.pages);
      if (problem) throw new UserError(problem, 422);
      const now = new Date().toISOString();
      created = { id: newId(), ...meta, status: "draft", blocks: [], rev: 1, createdAt: now, updatedAt: now, updatedBy: user };
      d.pages.push(created);
      return d;
    },
    { user }
  );
  return created;
}

export async function updatePage(id: string, meta: PageMeta, blocks: Block[], expectedRev: number, user: string): Promise<PageRecord> {
  let saved!: PageRecord;
  await store.update<PagesDoc>(
    "pages",
    EMPTY,
    async (d) => {
      const p = d.pages.find((x) => x.id === id);
      if (!p) throw new UserError("This page no longer exists.", 404);
      if (p.rev !== expectedRev) throw new UserError("This page was changed by someone else since you opened it. Reload the page and try again.", 409);
      const problem = await slugProblem(meta.slug, d.pages, id);
      if (problem) throw new UserError(problem, 422);
      Object.assign(p, meta, { blocks, rev: p.rev + 1, updatedAt: new Date().toISOString(), updatedBy: user });
      saved = p;
      return d;
    },
    { user }
  );
  return saved;
}

export async function setPublished(id: string, published: boolean, user: string): Promise<PageRecord> {
  let saved!: PageRecord;
  await store.update<PagesDoc>(
    "pages",
    EMPTY,
    (d) => {
      const p = d.pages.find((x) => x.id === id);
      if (!p) throw new UserError("This page no longer exists.", 404);
      if (published) {
        const r = pageReadiness(p);
        if (!r.ready.en && !r.ready.fr) {
          const list = r.issues.slice(0, 4).map((i) => i.message).join("; ");
          throw new UserError(`The page cannot be published yet: ${list}${r.issues.length > 4 ? "…" : ""}.`, 422);
        }
      }
      p.status = published ? "published" : "draft";
      p.rev += 1;
      p.updatedAt = new Date().toISOString();
      p.updatedBy = user;
      saved = p;
      return d;
    },
    { user }
  );
  return saved;
}

export async function deletePage(id: string, user: string): Promise<PageRecord> {
  let gone!: PageRecord;
  await store.update<PagesDoc>(
    "pages",
    EMPTY,
    (d) => {
      const p = d.pages.find((x) => x.id === id);
      if (!p) throw new UserError("This page no longer exists.", 404);
      gone = p;
      d.pages = d.pages.filter((x) => x.id !== id);
      return d;
    },
    { user }
  );
  return gone;
}

export async function duplicatePage(id: string, user: string): Promise<PageRecord> {
  let copy!: PageRecord;
  await store.update<PagesDoc>(
    "pages",
    EMPTY,
    (d) => {
      const p = d.pages.find((x) => x.id === id);
      if (!p) throw new UserError("This page no longer exists.", 404);
      let slug = `${p.slug}-copy`;
      for (let n = 2; d.pages.some((x) => x.slug === slug); n++) slug = `${p.slug}-copy-${n}`;
      const now = new Date().toISOString();
      copy = {
        ...structuredClone(p),
        id: newId(),
        slug,
        status: "draft",
        title: { en: p.title.en ? `${p.title.en} (copy)` : "", fr: p.title.fr ? `${p.title.fr} (copie)` : "" },
        rev: 1,
        createdAt: now,
        updatedAt: now,
        updatedBy: user,
      };
      d.pages.push(copy);
      return d;
    },
    { user }
  );
  return copy;
}

/* ───────────────────────── public side ───────────────────────── */

/**
 * Resolve a public URL to a page. Normal visitors only get published pages that are
 * complete in the requested language. `preview` (a signed-in admin) also gets drafts and
 * incomplete languages, so the page can be checked before publishing.
 */
export async function findPageForLocale(locale: PageLocale, slug: string, preview: boolean) {
  const page = await getPageBySlug(slug);
  if (!page) return null;
  const readiness = pageReadiness(page);
  const visible = page.status === "published" && readiness.ready[locale];
  if (!visible && !preview) return null;
  return { page, readiness, visible };
}

export async function listNavPages(locale: PageLocale, placement: "header" | "footer") {
  const pages = (await store.read<PagesDoc>("pages", EMPTY)).data.pages;
  return pages
    .filter((p) => p.status === "published" && p.nav.placement === placement && pageReadiness(p).ready[locale])
    .sort((a, b) => a.nav.order - b.nav.order || a.slug.localeCompare(b.slug))
    .map((p) => ({ slug: p.slug, href: `/${p.slug}`, label: p.nav.label[locale].trim() || p.title[locale] }));
}

export async function listLivePages(): Promise<Array<{ slug: string; locales: PageLocale[]; updatedAt: string }>> {
  const pages = (await store.read<PagesDoc>("pages", EMPTY)).data.pages;
  return pages
    .filter((p) => p.status === "published")
    .map((p) => ({ slug: p.slug, locales: (["en", "fr"] as PageLocale[]).filter((l) => pageReadiness(p).ready[l]), updatedAt: p.updatedAt }))
    .filter((p) => p.locales.length > 0);
}
