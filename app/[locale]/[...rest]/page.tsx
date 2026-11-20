import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/cms/auth";
import { PAGE_LOCALES, type PageLocale } from "@/lib/cms/blocks";
import { findPageForLocale, pageReadiness } from "@/lib/cms/pages";
import { PageView } from "@/components/blocks/render";

/**
 * Catch-all for pages created in the admin dashboard: /<locale>/<slug>.
 * Real routes (about, programs, contact, …) always win over this file; anything that
 * matches no real route and no published page is a normal 404.
 *
 * A signed-in administrator can add ?preview=1 to see drafts and pages that are still
 * incomplete in this language (with a banner saying what is missing).
 */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; rest: string[] }>; searchParams: Promise<{ preview?: string }> };

async function resolve({ params, searchParams }: Props) {
  const { locale, rest } = await params;
  const sp = await searchParams;
  if (!(PAGE_LOCALES as readonly string[]).includes(locale)) return null;
  const loc = locale as PageLocale;
  const slug = rest.map((s) => decodeURIComponent(s).toLowerCase()).join("/");
  const preview = sp.preview === "1" && (await getCurrentUser()) !== null;
  const found = await findPageForLocale(loc, slug, preview);
  return found ? { ...found, loc, preview } : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const r = await resolve(props);
  if (!r) return { title: "Page not found", robots: { index: false } };
  const { page, loc, preview } = r;
  const ready = pageReadiness(page).ready;
  const languages = Object.fromEntries(PAGE_LOCALES.filter((l) => ready[l] && page.status === "published").map((l) => [l, `/${l}/${page.slug}`]));
  return {
    title: page.seo.title[loc].trim() || page.title[loc],
    description: page.seo.description[loc].trim() || undefined,
    alternates: { canonical: `/${loc}/${page.slug}`, languages },
    openGraph: page.seo.image ? { images: [{ url: page.seo.image }] } : undefined,
    robots: preview || !r.visible ? { index: false, follow: false } : undefined,
  };
}

export default async function CustomPage(props: Props) {
  const r = await resolve(props);
  if (!r) notFound();
  const { page, loc, preview, readiness, visible } = r;
  return (
    <PageView
      title={page.title[loc]}
      blocks={page.blocks}
      locale={loc}
      preview={preview ? { status: page.status, visible, issues: readiness.issues } : undefined}
    />
  );
}
