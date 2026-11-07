import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/cms/auth";
import { findPageForLocale } from "@/lib/cms/pages";
import { getSite, storiesOf } from "@/lib/site/site";
import { pageMeta } from "@/lib/site/metadata";
import { localeOf } from "@/lib/site/page";
import { StoryBody } from "@/components/site/page-bodies";
import { PageView } from "@/components/blocks/render";

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<{ preview?: string }> };

/** /impact-stories/<slug>: a story from the Texts, OR a page created in the admin with that address. */
async function resolve({ params, searchParams }: Props) {
  const locale = await localeOf(params);
  const { slug } = await params;
  const site = await getSite(locale);
  const story = storiesOf(site).find((s) => s.slug === slug);
  if (story) return { kind: "story" as const, site, slug, story };
  const sp = await searchParams;
  const preview = sp.preview === "1" && (await getCurrentUser()) !== null;
  const found = await findPageForLocale(locale, `impact-stories/${slug.toLowerCase()}`, preview);
  return found ? { kind: "custom" as const, site, found, preview } : null;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const r = await resolve(props);
  if (!r) return { title: "Not found", robots: { index: false } };
  if (r.kind === "custom") {
    const { page } = r.found;
    return { title: page.seo.title[r.site.locale].trim() || page.title[r.site.locale], description: page.seo.description[r.site.locale].trim() || undefined, robots: r.preview || !r.found.visible ? { index: false } : undefined };
  }
  return pageMeta(r.site, { title: `${r.story.title} | ${r.site.settings.organization.name}`, description: r.story.excerpt, path: `/impact-stories/${r.slug}`, image: r.story.cover });
}

export default async function StoryPage(props: Props) {
  const r = await resolve(props);
  if (!r) notFound();
  if (r.kind === "custom") {
    const { page, readiness, visible } = r.found;
    const loc = r.site.locale;
    return <PageView title={page.title[loc]} blocks={page.blocks} locale={loc} preview={r.preview ? { status: page.status, visible, issues: readiness.issues } : undefined} />;
  }
  return <StoryBody site={r.site} slug={r.slug} />;
}
